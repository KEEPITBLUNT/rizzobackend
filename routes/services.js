const express = require('express');
const Service = require('../models/Service');
const { protect, adminOnly } = require('../middleware/auth');
const { validateService } = require('../middleware/validation');

const router = express.Router();

// @desc    Get all services
// @route   GET /api/services
// @access  Public
router.get('/', async (req, res) => {
  try {
    const {
      category,
      minPrice,
      maxPrice,
      search,
      sort = 'popularity',
      page = 1,
      limit = 10
    } = req.query;

    // Build query
    let query = { isActive: true };

    if (category) {
      query.category = category;
    }

    if (minPrice || maxPrice) {
      query.startingPrice = {};
      if (minPrice) query.startingPrice.$gte = parseFloat(minPrice);
      if (maxPrice) query.startingPrice.$lte = parseFloat(maxPrice);
    }

    if (search) {
      query.$text = { $search: search };
    }

    // Build sort
    let sortQuery = {};
    switch (sort) {
      case 'price-low':
        sortQuery = { startingPrice: 1 };
        break;
      case 'price-high':
        sortQuery = { startingPrice: -1 };
        break;
      case 'rating':
        sortQuery = { averageRating: -1 };
        break;
      case 'newest':
        sortQuery = { createdAt: -1 };
        break;
      default:
        sortQuery = { popularity: -1 };
    }

    // Execute query with pagination
    const services = await Service.find(query)
      .sort(sortQuery)
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Service.countDocuments(query);

    res.json({
      success: true,
      count: services.length,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / limit),
      services
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

// @desc    Get single service
// @route   GET /api/services/:id
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const service = await Service.findOne({ 
      $or: [
        { _id: req.params.id },
        { id: req.params.id }
      ],
      isActive: true 
    });

    if (!service) {
      return res.status(404).json({
        success: false,
        message: 'Service not found'
      });
    }

    // Increment popularity
    service.popularity += 1;
    await service.save();

    res.json({
      success: true,
      service
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

// @desc    Create service
// @route   POST /api/services
// @access  Private/Admin
router.post('/', protect, adminOnly, validateService, async (req, res) => {
  try {
    const {
      id,
      name,
      description,
      shortDescription,
      image,
      imageLarge,
      startingPrice,
      features,
      process,
      turnaround,
      pricing,
      category
    } = req.body;

    // Check if service ID already exists
    const existingService = await Service.findOne({ id });
    if (existingService) {
      return res.status(400).json({
        success: false,
        message: 'Service with this ID already exists'
      });
    }

    const service = await Service.create({
      id,
      name,
      description,
      shortDescription,
      image,
      imageLarge,
      startingPrice,
      features,
      process,
      turnaround,
      pricing,
      category
    });

    res.status(201).json({
      success: true,
      message: 'Service created successfully',
      service
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

// @desc    Update service
// @route   PUT /api/services/:id
// @access  Private/Admin
router.put('/:id', protect, adminOnly, async (req, res) => {
  try {
    const service = await Service.findOneAndUpdate(
      { $or: [{ _id: req.params.id }, { id: req.params.id }] },
      req.body,
      { new: true, runValidators: true }
    );

    if (!service) {
      return res.status(404).json({
        success: false,
        message: 'Service not found'
      });
    }

    res.json({
      success: true,
      message: 'Service updated successfully',
      service
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

// @desc    Delete service
// @route   DELETE /api/services/:id
// @access  Private/Admin
router.delete('/:id', protect, adminOnly, async (req, res) => {
  try {
    const service = await Service.findOneAndUpdate(
      { $or: [{ _id: req.params.id }, { id: req.params.id }] },
      { isActive: false },
      { new: true }
    );

    if (!service) {
      return res.status(404).json({
        success: false,
        message: 'Service not found'
      });
    }

    res.json({
      success: true,
      message: 'Service deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

// @desc    Get service categories
// @route   GET /api/services/categories/list
// @access  Public
router.get('/categories/list', async (req, res) => {
  try {
    const categories = await Service.distinct('category', { isActive: true });
    
    res.json({
      success: true,
      categories
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