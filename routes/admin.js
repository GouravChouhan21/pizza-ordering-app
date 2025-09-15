const express = require('express');
const Order = require('../models/Order');
const User = require('../models/User');
const Pizza = require('../models/Pizza');
const { adminAuth } = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/admin/dashboard
// @desc    Get admin dashboard data
// @access  Private (Admin)
router.get('/dashboard', adminAuth, async (req, res) => {
  try {
    // Get total orders count
    const totalOrders = await Order.countDocuments();
    
    // Get pending orders count
    const pendingOrders = await Order.countDocuments({ status: 'pending' });
    
    // Get confirmed orders count
    const confirmedOrders = await Order.countDocuments({ status: 'confirmed' });
    
    // Get in kitchen orders count
    const inKitchenOrders = await Order.countDocuments({ status: 'in_kitchen' });
    
    // Get out for delivery orders count
    const outForDeliveryOrders = await Order.countDocuments({ status: 'out_for_delivery' });
    
    // Get delivered orders count
    const deliveredOrders = await Order.countDocuments({ status: 'delivered' });
    
    // Get total revenue
    const revenueResult = await Order.aggregate([
      { $match: { paymentStatus: 'paid' } },
      { $group: { _id: null, totalRevenue: { $sum: '$totalAmount' } } }
    ]);
    const totalRevenue = revenueResult.length > 0 ? revenueResult[0].totalRevenue : 0;
    
    // Get recent orders
    const recentOrders = await Order.find()
      .populate('user', 'name email phone')
      .populate('items.pizza', 'name')
      .sort({ createdAt: -1 })
      .limit(10);

    // Get low stock items
    const lowStockItems = await Pizza.find({
      stock: { $lte: 20 },
      isAvailable: true
    });

    res.json({
      stats: {
        totalOrders,
        pendingOrders,
        confirmedOrders,
        inKitchenOrders,
        outForDeliveryOrders,
        deliveredOrders,
        totalRevenue
      },
      recentOrders,
      lowStockItems
    });

  } catch (error) {
    console.error('Admin dashboard error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/admin/orders
// @desc    Get all orders for admin
// @access  Private (Admin)
router.get('/orders', adminAuth, async (req, res) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;
    
    const query = {};
    if (status) {
      query.status = status;
    }

    const orders = await Order.find(query)
      .populate('user', 'name email phone')
      .populate('items.pizza', 'name')
      .populate('items.customizations.base', 'name')
      .populate('items.customizations.sauce', 'name')
      .populate('items.customizations.cheese', 'name')
      .populate('items.customizations.veggies', 'name')
      .populate('items.customizations.meat', 'name')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Order.countDocuments(query);

    res.json({
      orders,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });

  } catch (error) {
    console.error('Get admin orders error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/admin/orders/:id/status
// @desc    Update order status
// @access  Private (Admin)
router.put('/orders/:id/status', adminAuth, async (req, res) => {
  try {
    const { status } = req.body;
    const validStatuses = ['pending', 'confirmed', 'in_kitchen', 'out_for_delivery', 'delivered', 'cancelled'];

    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    order.status = status;
    
    // Update estimated delivery time based on status
    if (status === 'in_kitchen') {
      order.estimatedDeliveryTime = new Date(Date.now() + 20 * 60 * 1000); // 20 minutes
    } else if (status === 'out_for_delivery') {
      order.estimatedDeliveryTime = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
    }

    await order.save();

    // Emit real-time update to user
    const io = req.app.get('io');
    io.to(order.user.toString()).emit('orderUpdate', {
      orderId: order._id,
      status: order.status,
      message: `Order status updated to: ${status.replace('_', ' ')}`
    });

    res.json({
      message: 'Order status updated successfully',
      order
    });

  } catch (error) {
    console.error('Update order status error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/admin/users
// @desc    Get all users
// @access  Private (Admin)
router.get('/users', adminAuth, async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;

    const users = await User.find({ role: 'user' })
      .select('-password')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await User.countDocuments({ role: 'user' });

    res.json({
      users,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });

  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/admin/users/:id/status
// @desc    Update user status
// @access  Private (Admin)
router.put('/users/:id/status', adminAuth, async (req, res) => {
  try {
    const { isActive } = req.body;

    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.isActive = isActive;
    await user.save();

    res.json({
      message: 'User status updated successfully',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        isActive: user.isActive
      }
    });

  } catch (error) {
    console.error('Update user status error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/admin/create-admin
// @desc    Create admin user
// @access  Private (Admin)
router.post('/create-admin', adminAuth, async (req, res) => {
  try {
    const { name, email, password, phone } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists with this email' });
    }

    // Create admin user
    const admin = new User({
      name,
      email,
      password,
      phone,
      role: 'admin',
      isEmailVerified: true // Skip email verification for admin
    });

    await admin.save();

    res.status(201).json({
      message: 'Admin created successfully',
      admin: {
        id: admin._id,
        name: admin.name,
        email: admin.email,
        role: admin.role
      }
    });

  } catch (error) {
    console.error('Create admin error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
