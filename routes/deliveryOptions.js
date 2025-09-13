const express = require('express');
const DeliveryOption = require('../models/DeliveryOption');
const { protect, adminOnly } = require('../middleware/auth');

const router = express.Router();

// @desc    Get all delivery options
// @route   GET /api/delivery-options
// @access  Public
router.get('/', async (req, res) => {
  try {
    const deliveryOptions = await DeliveryOption.find({ isActive: true })
      .sort({ isPopular: -1, price: 1 });

    res.json({
      success: true,
      count: deliveryOptions.length,
      deliveryOptions
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

// @desc    Get single delivery option
// @route   GET /api/delivery-options/:id
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const deliveryOption = await DeliveryOption.findOne({
      $or: [{ _id: req.params.id }, { id: req.params.id }],
      isActive: true
    });

    if (!deliveryOption) {
      return res.status(404).json({
        success: false,
        message: 'Delivery option not found'
      });
    }

    res.json({
      success: true,
      deliveryOption
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

// @desc    Create delivery option
// @route   POST /api/delivery-options
// @access  Private/Admin
router.post('/', protect, adminOnly, async (req, res) => {
  try {
    const {
      id,
      name,
      description,
      estimatedTime,
      price,
      icon,
      features,
      isPopular,
      isExpress,
      availableAreas,
      minimumOrder,
      maximumOrder
    } = req.body;

    // Check if delivery option ID already exists
    const existingOption = await DeliveryOption.findOne({ id });
    if (existingOption) {
      return res.status(400).json({
        success: false,
        message: 'Delivery option with this ID already exists'
      });
    }

    const deliveryOption = await DeliveryOption.create({
      id,
      name,
      description,
      estimatedTime,
      price,
      icon,
      features,
      isPopular,
      isExpress,
      availableAreas,
      minimumOrder,
      maximumOrder
    });

    res.status(201).json({
      success: true,
      message: 'Delivery option created successfully',
      deliveryOption
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

// @desc    Update delivery option
// @route   PUT /api/delivery-options/:id
// @access  Private/Admin
router.put('/:id', protect, adminOnly, async (req, res) => {
  try {
    const deliveryOption = await DeliveryOption.findOneAndUpdate(
      { $or: [{ _id: req.params.id }, { id: req.params.id }] },
      req.body,
      { new: true, runValidators: true }
    );

    if (!deliveryOption) {
      return res.status(404).json({
        success: false,
        message: 'Delivery option not found'
      });
    }

    res.json({
      success: true,
      message: 'Delivery option updated successfully',
      deliveryOption
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

// @desc    Delete delivery option
// @route   DELETE /api/delivery-options/:id
// @access  Private/Admin
router.delete('/:id', protect, adminOnly, async (req, res) => {
  try {
    const deliveryOption = await DeliveryOption.findOneAndUpdate(
      { $or: [{ _id: req.params.id }, { id: req.params.id }] },
      { isActive: false },
      { new: true }
    );

    if (!deliveryOption) {
      return res.status(404).json({
        success: false,
        message: 'Delivery option not found'
      });
    }

    res.json({
      success: true,
      message: 'Delivery option deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

module.exports = router;