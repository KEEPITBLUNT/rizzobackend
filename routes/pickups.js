const express = require('express');
const Pickup = require('../models/Pickup');
const { protect, adminOnly } = require('../middleware/auth');
const { validatePickup } = require('../middleware/validation');

const router = express.Router();

// @desc    Create pickup request
// @route   POST /api/pickups
// @access  Private
router.post('/', protect, validatePickup, async (req, res) => {
  try {
    const {
      address,
      date,
      timeSlot,
      instructions,
      estimatedItems
    } = req.body;

    const pickup = await Pickup.create({
      customerId: req.user.id,
      address,
      date,
      timeSlot,
      instructions,
      estimatedItems
    });

    res.status(201).json({
      success: true,
      message: 'Pickup request created successfully',
      pickup
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error creating pickup',
      error: error.message
    });
  }
});

// @desc    Get user pickups
// @route   GET /api/pickups/user
// @access  Private
router.get('/user', protect, async (req, res) => {
  try {
    const {
      status,
      page = 1,
      limit = 10,
      sort = '-createdAt'
    } = req.query;

    // Build query
    let query = { customerId: req.user.id };
    
    if (status) {
      query.status = status;
    }

    // Execute query with pagination
    const pickups = await Pickup.find(query)
      .sort(sort)
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Pickup.countDocuments(query);

    res.json({
      success: true,
      count: pickups.length,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / limit),
      pickups
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

// @desc    Get single pickup
// @route   GET /api/pickups/:id
// @access  Private
router.get('/:id', protect, async (req, res) => {
  try {
    const pickup = await Pickup.findOne({
      _id: req.params.id,
      customerId: req.user.id
    });

    if (!pickup) {
      return res.status(404).json({
        success: false,
        message: 'Pickup not found'
      });
    }

    res.json({
      success: true,
      pickup
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

// @desc    Cancel pickup
// @route   PUT /api/pickups/pickup/:id/cancel
// @access  Private
router.put('/pickup/:id/cancel', protect, async (req, res) => {
  try {
    const pickup = await Pickup.findOne({
      _id: req.params.id,
      customerId: req.user.id
    });

    if (!pickup) {
      return res.status(404).json({
        success: false,
        message: 'Pickup not found'
      });
    }

    // Check if pickup can be cancelled
    if (['completed', 'cancelled'].includes(pickup.status)) {
      return res.status(400).json({
        success: false,
        message: 'Pickup cannot be cancelled at this stage'
      });
    }

    pickup.status = 'cancelled';
    await pickup.save();

    res.json({
      success: true,
      message: 'Pickup cancelled successfully',
      pickup
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

// Admin routes

// @desc    Get all pickups (Admin)
// @route   GET /api/pickups/admin/all
// @access  Private/Admin
router.get('/admin/all', protect, adminOnly, async (req, res) => {
  try {
    const {
      status,
      date,
      assignedTo,
      page = 1,
      limit = 20,
      sort = '-createdAt'
    } = req.query;

    // Build query
    let query = {};
    
    if (status) {
      query.status = status;
    }
    
    if (date) {
      const startDate = new Date(date);
      const endDate = new Date(date);
      endDate.setDate(endDate.getDate() + 1);
      query.date = { $gte: startDate, $lt: endDate };
    }
    
    if (assignedTo) {
      query.assignedTo = assignedTo;
    }

    // Execute query with pagination
    const pickups = await Pickup.find(query)
      .populate('customerId', 'firstName lastName email phone')
      .populate('assignedTo', 'firstName lastName')
      .sort(sort)
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Pickup.countDocuments(query);

    res.json({
      success: true,
      count: pickups.length,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / limit),
      pickups
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

// @desc    Update pickup status (Admin)
// @route   PUT /api/pickups/:id/status
// @access  Private/Admin
router.put('/:id/status', protect, adminOnly, async (req, res) => {
  try {
    const { status, assignedTo, actualItems, pickupNotes } = req.body;

    const validStatuses = ['requested', 'confirmed', 'in-progress', 'completed', 'cancelled'];
    
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status'
      });
    }

    const pickup = await Pickup.findById(req.params.id);

    if (!pickup) {
      return res.status(404).json({
        success: false,
        message: 'Pickup not found'
      });
    }

    pickup.status = status;
    
    if (assignedTo) pickup.assignedTo = assignedTo;
    if (actualItems) pickup.actualItems = actualItems;
    if (pickupNotes) pickup.pickupNotes = pickupNotes;
    
    if (status === 'completed') {
      pickup.completedAt = new Date();
    }

    await pickup.save();

    res.json({
      success: true,
      message: 'Pickup status updated successfully',
      pickup
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

// @desc    Assign pickup to staff (Admin)
// @route   PUT /api/pickups/:id/assign
// @access  Private/Admin
router.put('/:id/assign', protect, adminOnly, async (req, res) => {
  try {
    const { assignedTo } = req.body;

    if (!assignedTo) {
      return res.status(400).json({
        success: false,
        message: 'Staff member ID is required'
      });
    }

    const pickup = await Pickup.findById(req.params.id);

    if (!pickup) {
      return res.status(404).json({
        success: false,
        message: 'Pickup not found'
      });
    }

    pickup.assignedTo = assignedTo;
    pickup.status = 'confirmed';
    await pickup.save();

    res.json({
      success: true,
      message: 'Pickup assigned successfully',
      pickup
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