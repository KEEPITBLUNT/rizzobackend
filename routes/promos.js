const express = require('express');
const PromoCode = require('../models/PromoCode');
const { protect, adminOnly } = require('../middleware/auth');
const { validatePromoCode } = require('../middleware/validation');

const router = express.Router();

// @desc    Validate promo code
// @route   POST /api/promos/validate
// @access  Public
router.post('/validate', async (req, res) => {
  try {
    const { promoCode, orderAmount = 0 } = req.body;

    if (!promoCode) {
      return res.status(400).json({
        success: false,
        message: 'Promo code is required'
      });
    }

    const promo = await PromoCode.findOne({ 
      code: promoCode.toUpperCase(),
      isActive: true 
    });

    if (!promo) {
      return res.status(404).json({
        success: false,
        message: 'Invalid promo code'
      });
    }

    // Validate promo code
    const validation = promo.isValid(req.user?.id, orderAmount);
    
    if (!validation.valid) {
      return res.status(400).json({
        success: false,
        message: validation.message
      });
    }

    // Calculate discount
    const discount = promo.calculateDiscount(orderAmount);

    res.json({
      success: true,
      valid: true,
      message: `${promo.description} - ₹${discount} discount applied!`,
      discount,
      promoCode: {
        code: promo.code,
        description: promo.description,
        discountType: promo.discountType,
        discountValue: promo.discountValue,
        maxDiscount: promo.maxDiscount,
        minOrderAmount: promo.minOrderAmount
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

// @desc    Get all promo codes (Admin)
// @route   GET /api/promos
// @access  Private/Admin
router.get('/', protect, adminOnly, async (req, res) => {
  try {
    const {
      isActive,
      page = 1,
      limit = 10,
      sort = '-createdAt'
    } = req.query;

    // Build query
    let query = {};
    
    if (isActive !== undefined) {
      query.isActive = isActive === 'true';
    }

    // Execute query with pagination
    const promoCodes = await PromoCode.find(query)
      .sort(sort)
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await PromoCode.countDocuments(query);

    res.json({
      success: true,
      count: promoCodes.length,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / limit),
      promoCodes
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

// @desc    Get single promo code (Admin)
// @route   GET /api/promos/:id
// @access  Private/Admin
router.get('/:id', protect, adminOnly, async (req, res) => {
  try {
    const promoCode = await PromoCode.findById(req.params.id);

    if (!promoCode) {
      return res.status(404).json({
        success: false,
        message: 'Promo code not found'
      });
    }

    res.json({
      success: true,
      promoCode
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

// @desc    Create promo code
// @route   POST /api/promos
// @access  Private/Admin
router.post('/', protect, adminOnly, validatePromoCode, async (req, res) => {
  try {
    const {
      code,
      description,
      discountType,
      discountValue,
      maxDiscount,
      minOrderAmount,
      maxUsage,
      maxUsagePerUser,
      validFrom,
      validUntil,
      applicableServices,
      excludedServices,
      userRestrictions
    } = req.body;

    // Check if promo code already exists
    const existingPromo = await PromoCode.findOne({ 
      code: code.toUpperCase() 
    });
    
    if (existingPromo) {
      return res.status(400).json({
        success: false,
        message: 'Promo code already exists'
      });
    }

    const promoCode = await PromoCode.create({
      code: code.toUpperCase(),
      description,
      discountType,
      discountValue,
      maxDiscount,
      minOrderAmount,
      maxUsage,
      maxUsagePerUser,
      validFrom,
      validUntil,
      applicableServices,
      excludedServices,
      userRestrictions
    });

    res.status(201).json({
      success: true,
      message: 'Promo code created successfully',
      promoCode
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

// @desc    Update promo code
// @route   PUT /api/promos/:id
// @access  Private/Admin
router.put('/:id', protect, adminOnly, async (req, res) => {
  try {
    const promoCode = await PromoCode.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!promoCode) {
      return res.status(404).json({
        success: false,
        message: 'Promo code not found'
      });
    }

    res.json({
      success: true,
      message: 'Promo code updated successfully',
      promoCode
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

// @desc    Delete promo code
// @route   DELETE /api/promos/:id
// @access  Private/Admin
router.delete('/:id', protect, adminOnly, async (req, res) => {
  try {
    const promoCode = await PromoCode.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true }
    );

    if (!promoCode) {
      return res.status(404).json({
        success: false,
        message: 'Promo code not found'
      });
    }

    res.json({
      success: true,
      message: 'Promo code deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

// @desc    Get promo code usage statistics (Admin)
// @route   GET /api/promos/:id/stats
// @access  Private/Admin
router.get('/:id/stats', protect, adminOnly, async (req, res) => {
  try {
    const promoCode = await PromoCode.findById(req.params.id);

    if (!promoCode) {
      return res.status(404).json({
        success: false,
        message: 'Promo code not found'
      });
    }

    const stats = {
      totalUsage: promoCode.usageCount,
      maxUsage: promoCode.maxUsage,
      remainingUsage: promoCode.maxUsage ? promoCode.maxUsage - promoCode.usageCount : 'Unlimited',
      totalDiscountGiven: promoCode.usageHistory.reduce((sum, usage) => sum + usage.discountApplied, 0),
      uniqueUsers: [...new Set(promoCode.usageHistory.map(usage => usage.userId.toString()))].length,
      recentUsage: promoCode.usageHistory.slice(-10).reverse()
    };

    res.json({
      success: true,
      stats
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