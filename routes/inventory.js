const express = require('express');
const Pizza = require('../models/Pizza');
const { adminAuth } = require('../middleware/auth');
const nodemailer = require('nodemailer');

const router = express.Router();

// Email transporter
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

// @route   GET /api/inventory
// @desc    Get all inventory items
// @access  Private (Admin)
router.get('/', adminAuth, async (req, res) => {
  try {
    const { category } = req.query;
    
    const query = {};
    if (category) {
      query.category = category;
    }

    const items = await Pizza.find(query).sort({ category: 1, name: 1 });
    
    // Group by category
    const groupedItems = items.reduce((acc, item) => {
      if (!acc[item.category]) {
        acc[item.category] = [];
      }
      acc[item.category].push(item);
      return acc;
    }, {});

    res.json(groupedItems);
  } catch (error) {
    console.error('Get inventory error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/inventory
// @desc    Add new inventory item
// @access  Private (Admin)
router.post('/', adminAuth, async (req, res) => {
  try {
    const { name, description, basePrice, category, image, stock, threshold } = req.body;

    const item = new Pizza({
      name,
      description,
      basePrice,
      category,
      image,
      stock: stock || 100,
      threshold: threshold || 20
    });

    await item.save();

    res.status(201).json({
      message: 'Inventory item added successfully',
      item
    });
  } catch (error) {
    console.error('Add inventory item error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/inventory/:id
// @desc    Update inventory item
// @access  Private (Admin)
router.put('/:id', adminAuth, async (req, res) => {
  try {
    const { name, description, basePrice, category, image, stock, threshold, isAvailable } = req.body;

    const item = await Pizza.findById(req.params.id);
    if (!item) {
      return res.status(404).json({ message: 'Inventory item not found' });
    }

    // Update fields
    if (name) item.name = name;
    if (description) item.description = description;
    if (basePrice) item.basePrice = basePrice;
    if (category) item.category = category;
    if (image) item.image = image;
    if (stock !== undefined) item.stock = stock;
    if (threshold !== undefined) item.threshold = threshold;
    if (isAvailable !== undefined) item.isAvailable = isAvailable;

    await item.save();

    res.json({
      message: 'Inventory item updated successfully',
      item
    });
  } catch (error) {
    console.error('Update inventory item error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   DELETE /api/inventory/:id
// @desc    Delete inventory item
// @access  Private (Admin)
router.delete('/:id', adminAuth, async (req, res) => {
  try {
    const item = await Pizza.findById(req.params.id);
    if (!item) {
      return res.status(404).json({ message: 'Inventory item not found' });
    }

    await Pizza.findByIdAndDelete(req.params.id);

    res.json({ message: 'Inventory item deleted successfully' });
  } catch (error) {
    console.error('Delete inventory item error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/inventory/:id/stock
// @desc    Update stock for inventory item
// @access  Private (Admin)
router.put('/:id/stock', adminAuth, async (req, res) => {
  try {
    const { stock } = req.body;

    if (stock < 0) {
      return res.status(400).json({ message: 'Stock cannot be negative' });
    }

    const item = await Pizza.findById(req.params.id);
    if (!item) {
      return res.status(404).json({ message: 'Inventory item not found' });
    }

    item.stock = stock;
    await item.save();

    res.json({
      message: 'Stock updated successfully',
      item
    });
  } catch (error) {
    console.error('Update stock error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/inventory/low-stock
// @desc    Get low stock items
// @access  Private (Admin)
router.get('/low-stock', adminAuth, async (req, res) => {
  try {
    const lowStockItems = await Pizza.find({
      stock: { $lte: 20 },
      isAvailable: true
    }).sort({ stock: 1 });

    res.json(lowStockItems);
  } catch (error) {
    console.error('Get low stock items error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/inventory/check-low-stock
// @desc    Check and send low stock notifications
// @access  Private (Admin)
router.post('/check-low-stock', adminAuth, async (req, res) => {
  try {
    const lowStockItems = await Pizza.find({
      stock: { $lte: 20 },
      isAvailable: true
    });

    if (lowStockItems.length > 0) {
      // Send email notification
      const itemList = lowStockItems.map(item => 
        `- ${item.name} (${item.category}): ${item.stock} remaining`
      ).join('\n');

      const mailOptions = {
        from: process.env.EMAIL_USER,
        to: process.env.ADMIN_EMAIL,
        subject: 'Low Stock Alert - Pizza App',
        html: `
          <h2>Low Stock Alert</h2>
          <p>The following items are running low on stock:</p>
          <pre>${itemList}</pre>
          <p>Please restock these items as soon as possible.</p>
        `
      };

      await transporter.sendMail(mailOptions);

      res.json({
        message: 'Low stock notification sent',
        lowStockItems: lowStockItems.length
      });
    } else {
      res.json({
        message: 'No low stock items found',
        lowStockItems: 0
      });
    }
  } catch (error) {
    console.error('Check low stock error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
