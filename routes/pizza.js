const express = require('express');
const Pizza = require('../models/Pizza');
const { auth } = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/pizza/varieties
// @desc    Get all pizza varieties for dashboard
// @access  Private
router.get('/varieties', auth, async (req, res) => {
  try {
    const varieties = await Pizza.find({ 
      category: { $in: ['base', 'sauce', 'cheese', 'veggie', 'meat'] },
      isAvailable: true 
    }).sort({ category: 1, name: 1 });

    // Group by category
    const groupedVarieties = varieties.reduce((acc, item) => {
      if (!acc[item.category]) {
        acc[item.category] = [];
      }
      acc[item.category].push(item);
      return acc;
    }, {});

    res.json(groupedVarieties);
  } catch (error) {
    console.error('Get varieties error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/pizza/bases
// @desc    Get all pizza bases
// @access  Private
router.get('/bases', auth, async (req, res) => {
  try {
    const bases = await Pizza.find({ 
      category: 'base',
      isAvailable: true,
      stock: { $gt: 0 }
    }).sort({ name: 1 });

    res.json(bases);
  } catch (error) {
    console.error('Get bases error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/pizza/sauces
// @desc    Get all sauces
// @access  Private
router.get('/sauces', auth, async (req, res) => {
  try {
    const sauces = await Pizza.find({ 
      category: 'sauce',
      isAvailable: true,
      stock: { $gt: 0 }
    }).sort({ name: 1 });

    res.json(sauces);
  } catch (error) {
    console.error('Get sauces error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/pizza/cheeses
// @desc    Get all cheese types
// @access  Private
router.get('/cheeses', auth, async (req, res) => {
  try {
    const cheeses = await Pizza.find({ 
      category: 'cheese',
      isAvailable: true,
      stock: { $gt: 0 }
    }).sort({ name: 1 });

    res.json(cheeses);
  } catch (error) {
    console.error('Get cheeses error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/pizza/veggies
// @desc    Get all vegetables
// @access  Private
router.get('/veggies', auth, async (req, res) => {
  try {
    const veggies = await Pizza.find({ 
      category: 'veggie',
      isAvailable: true,
      stock: { $gt: 0 }
    }).sort({ name: 1 });

    res.json(veggies);
  } catch (error) {
    console.error('Get veggies error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/pizza/meats
// @desc    Get all meat options
// @access  Private
router.get('/meats', auth, async (req, res) => {
  try {
    const meats = await Pizza.find({ 
      category: 'meat',
      isAvailable: true,
      stock: { $gt: 0 }
    }).sort({ name: 1 });

    res.json(meats);
  } catch (error) {
    console.error('Get meats error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/pizza/calculate-price
// @desc    Calculate custom pizza price
// @access  Private
router.post('/calculate-price', auth, async (req, res) => {
  try {
    const { base, sauce, cheese, veggies, meats } = req.body;

    let totalPrice = 0;
    const selectedItems = [];

    // Get base price
    if (base) {
      const baseItem = await Pizza.findById(base);
      if (baseItem) {
        totalPrice += baseItem.basePrice;
        selectedItems.push({ item: baseItem, type: 'base' });
      }
    }

    // Get sauce price
    if (sauce) {
      const sauceItem = await Pizza.findById(sauce);
      if (sauceItem) {
        totalPrice += sauceItem.basePrice;
        selectedItems.push({ item: sauceItem, type: 'sauce' });
      }
    }

    // Get cheese price
    if (cheese) {
      const cheeseItem = await Pizza.findById(cheese);
      if (cheeseItem) {
        totalPrice += cheeseItem.basePrice;
        selectedItems.push({ item: cheeseItem, type: 'cheese' });
      }
    }

    // Get veggies prices
    if (veggies && veggies.length > 0) {
      const veggieItems = await Pizza.find({ _id: { $in: veggies } });
      veggieItems.forEach(veggie => {
        totalPrice += veggie.basePrice;
        selectedItems.push({ item: veggie, type: 'veggie' });
      });
    }

    // Get meats prices
    if (meats && meats.length > 0) {
      const meatItems = await Pizza.find({ _id: { $in: meats } });
      meatItems.forEach(meat => {
        totalPrice += meat.basePrice;
        selectedItems.push({ item: meat, type: 'meat' });
      });
    }

    res.json({
      totalPrice,
      selectedItems,
      breakdown: selectedItems.map(item => ({
        name: item.item.name,
        type: item.type,
        price: item.item.basePrice
      }))
    });

  } catch (error) {
    console.error('Calculate price error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
