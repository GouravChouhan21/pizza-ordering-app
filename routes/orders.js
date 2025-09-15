const express = require('express');
const Razorpay = require('razorpay');
const Order = require('../models/Order');
const Pizza = require('../models/Pizza');
const { auth } = require('../middleware/auth');

const router = express.Router();

// Initialize Razorpay (kept for optional future use)
let razorpay = null;
try {
  razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET
  });
} catch (e) {
  // ignore if not configured
}
const isPaymentsDisabled = String(process.env.PAYMENTS_DISABLED || 'true').toLowerCase() === 'true';
const isTestMode = String(process.env.RAZORPAY_TEST_MODE || 'true').toLowerCase() === 'true';

// @route   GET /api/orders/config
// @desc    Expose payment config to client
// @access  Private
router.get('/config', auth, (req, res) => {
  res.json({
    paymentsEnabled: !isPaymentsDisabled,
    keyId: process.env.RAZORPAY_KEY_ID || null,
    testMode: isTestMode
  });
});

// @route   POST /api/orders/create-order
// @desc    Create a new order
// @access  Private
router.post('/create-order', auth, async (req, res) => {
  try {
    const { items, deliveryAddress } = req.body;

    if (!items || items.length === 0) {
      return res.status(400).json({ message: 'Order items are required' });
    }

    // Calculate total amount server-side using selected components
    let totalAmount = 0;
    const orderItems = [];

    for (const item of items) {
      const quantity = Math.max(item.quantity || 1, 1);
      const custom = item.customizations || {};

      let unitPrice = 0;
      const priceComponents = [];

      // Helper to add price by id(s)
      const addPriceById = async (idOrIds, type) => {
        if (!idOrIds) return;
        if (Array.isArray(idOrIds)) {
          const docs = await Pizza.find({ _id: { $in: idOrIds } });
          docs.forEach(d => { unitPrice += d.basePrice; priceComponents.push({ type, id: d._id }); });
        } else {
          const doc = await Pizza.findById(idOrIds);
          if (doc) { unitPrice += doc.basePrice; priceComponents.push({ type, id: doc._id }); }
        }
      };

      await addPriceById(custom.base, 'base');
      await addPriceById(custom.sauce, 'sauce');
      await addPriceById(custom.cheese, 'cheese');
      await addPriceById(custom.veggies, 'veggie');
      await addPriceById(custom.meat, 'meat');

      const itemPrice = unitPrice * quantity;
      totalAmount += itemPrice;

      // Use base id as representative pizza link if provided, else any
      const pizzaRef = custom.base || custom.sauce || custom.cheese;

      orderItems.push({
        pizza: pizzaRef,
        quantity,
        customizations: custom,
        price: itemPrice
      });
    }

    // Use saved address if not provided in payload
    let finalAddress = deliveryAddress;
    if (!finalAddress) {
      const userDoc = await require('../models/User').findById(req.userId);
      if (userDoc?.address?.street) {
        finalAddress = {
          street: userDoc.address.street,
          city: userDoc.address.city,
          state: userDoc.address.state,
          zipCode: userDoc.address.zipCode,
          phone: userDoc.phone
        };
      }
    }

    // Create order (initially pending)
    const order = new Order({
      user: req.userId,
      items: orderItems,
      totalAmount,
      deliveryAddress: finalAddress,
      status: 'pending'
    });

    await order.save();

    // If payments are disabled, auto-confirm the order here
    if (isPaymentsDisabled) {
      order.paymentStatus = 'paid';
      order.paymentId = `pay_mock_${Date.now()}`;
      order.status = 'confirmed';
      order.estimatedDeliveryTime = new Date(Date.now() + 30 * 60 * 1000);
      await order.save();

      // Update stock for each selected component
      for (const item of order.items) {
        const c = item.customizations || {};
        const dec = async (id, qty) => id && await Pizza.findByIdAndUpdate(id, { $inc: { stock: -qty } });
        await dec(c.base, item.quantity);
        await dec(c.sauce, item.quantity);
        await dec(c.cheese, item.quantity);
        if (Array.isArray(c.veggies)) {
          for (const vid of c.veggies) { await dec(vid, item.quantity); }
        }
        if (Array.isArray(c.meat)) {
          for (const mid of c.meat) { await dec(mid, item.quantity); }
        }
      }

      // Emit real-time update
      const io = req.app.get('io');
      io.to(req.userId.toString()).emit('orderUpdate', {
        orderId: order._id,
        status: order.status,
        message: 'Order confirmed (payment disabled mode)'
      });

      return res.json({
        order,
        message: 'Order created and confirmed (payment disabled)'
      });
    }

    // Otherwise, create a Razorpay order (or mock in test mode)
    let razorpayOrder;
    if (isTestMode || !razorpay) {
      razorpayOrder = {
        id: `order_test_${Date.now()}`,
        amount: totalAmount * 100,
        currency: 'INR',
        receipt: order.orderNumber,
        status: 'created',
        notes: { orderId: order._id.toString(), userId: req.userId.toString() }
      };
    } else {
      razorpayOrder = await razorpay.orders.create({
        amount: totalAmount * 100,
        currency: 'INR',
        receipt: order.orderNumber,
        notes: { orderId: order._id.toString(), userId: req.userId.toString() }
      });
    }

    return res.json({ order, razorpayOrder, message: 'Order created successfully' });

  } catch (error) {
    console.error('Create order error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/orders/verify-payment
// @desc    Verify payment and confirm order
// @access  Private
router.post('/verify-payment', auth, async (req, res) => {
  try {
    const { orderId, paymentId, signature } = req.body;

    // In test mode, bypass signature verification
    let dbOrderId = orderId;
    if (!isTestMode) {
      if (!orderId || !paymentId || !signature) {
        return res.status(400).json({ message: 'Missing payment details' });
      }
      const crypto = require('crypto');
      const expectedSignature = crypto
        .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
        .update(`${orderId}|${paymentId}`)
        .digest('hex');
      if (expectedSignature !== signature) {
        return res.status(400).json({ message: 'Invalid payment signature' });
      }
    }

    // Find and update order
    const order = await Order.findById(dbOrderId);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    if (order.user.toString() !== req.userId.toString()) {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    // Update order status
    order.paymentStatus = 'paid';
    order.paymentId = paymentId || `pay_test_${Date.now()}`;
    order.status = 'confirmed';
    order.estimatedDeliveryTime = new Date(Date.now() + 30 * 60 * 1000); // 30 minutes

    await order.save();

    // Update stock for each item
    for (const item of order.items) {
      await Pizza.findByIdAndUpdate(
        item.pizza,
        { $inc: { stock: -item.quantity } }
      );
    }

    // Emit real-time update
    const io = req.app.get('io');
    io.to(req.userId.toString()).emit('orderUpdate', {
      orderId: order._id,
      status: order.status,
      message: 'Order confirmed and payment successful!'
    });

    res.json({
      message: 'Payment verified and order confirmed',
      order
    });

  } catch (error) {
    console.error('Verify payment error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/orders/my-orders
// @desc    Get user's orders
// @access  Private
router.get('/my-orders', auth, async (req, res) => {
  try {
    const orders = await Order.find({ user: req.userId })
      .populate('items.pizza')
      .populate('items.customizations.base')
      .populate('items.customizations.sauce')
      .populate('items.customizations.cheese')
      .populate('items.customizations.veggies')
      .populate('items.customizations.meat')
      .sort({ createdAt: -1 });

    res.json(orders);
  } catch (error) {
    console.error('Get orders error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/orders/:id
// @desc    Get specific order
// @access  Private
router.get('/:id', auth, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('items.pizza')
      .populate('items.customizations.base')
      .populate('items.customizations.sauce')
      .populate('items.customizations.cheese')
      .populate('items.customizations.veggies')
      .populate('items.customizations.meat');

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    if (order.user.toString() !== req.userId.toString()) {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    res.json(order);
  } catch (error) {
    console.error('Get order error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/orders/cancel/:id
// @desc    Cancel an order
// @access  Private
router.post('/cancel/:id', auth, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    if (order.user.toString() !== req.userId.toString()) {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    if (['delivered', 'cancelled'].includes(order.status)) {
      return res.status(400).json({ message: 'Cannot cancel this order' });
    }

    order.status = 'cancelled';
    await order.save();

    // Restore stock
    for (const item of order.items) {
      await Pizza.findByIdAndUpdate(
        item.pizza,
        { $inc: { stock: item.quantity } }
      );
    }

    res.json({ message: 'Order cancelled successfully', order });
  } catch (error) {
    console.error('Cancel order error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
