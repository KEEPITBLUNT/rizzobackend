const express = require('express');
const User = require('../models/User');
const { protect } = require('../middleware/auth');

const router = express.Router();

// @desc    Get user profile
// @route   GET /api/users/profile
// @access  Private
router.get('/profile', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    
    res.json({
      success: true,
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        phone: user.phone,
        address: user.address,
        avatar: user.avatar,
        role: user.role,
        memberSince: user.memberSince,
        totalOrders: user.totalOrders,
        totalSpent: user.totalSpent,
        loyaltyPoints: user.loyaltyPoints,
        preferredServices: user.preferredServices,
        lastLogin: user.lastLogin
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

// @desc    Update user profile
// @route   PUT /api/users/profile
// @access  Private
router.put('/profile', protect, async (req, res) => {
  try {
    const {
      firstName,
      lastName,
      phone,
      address,
      preferredServices
    } = req.body;

    const user = await User.findById(req.user.id);

    // Update fields if provided
    if (firstName) user.firstName = firstName;
    if (lastName) user.lastName = lastName;
    if (phone) user.phone = phone;
    if (address) user.address = address;
    if (preferredServices) user.preferredServices = preferredServices;

    await user.save();

    res.json({
      success: true,
      message: 'Profile updated successfully',
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        phone: user.phone,
        address: user.address,
        avatar: user.avatar,
        role: user.role,
        memberSince: user.memberSince,
        totalOrders: user.totalOrders,
        totalSpent: user.totalSpent,
        loyaltyPoints: user.loyaltyPoints,
        preferredServices: user.preferredServices
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

// @desc    Delete user account
// @route   DELETE /api/users/profile
// @access  Private
router.delete('/profile', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    
    // Soft delete - deactivate account
    user.isActive = false;
    await user.save();

    res.json({
      success: true,
      message: 'Account deactivated successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

// @desc    Get user statistics
// @route   GET /api/users/stats
// @access  Private
router.get('/stats', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    
    // Calculate additional stats
    const loyaltyLevel = user.loyaltyPoints >= 1000 ? 'Gold' : 
                        user.loyaltyPoints >= 500 ? 'Silver' : 'Bronze';
    
    const averageOrderValue = user.totalOrders > 0 ? 
                             (user.totalSpent / user.totalOrders).toFixed(2) : 0;

    res.json({
      success: true,
      stats: {
        totalOrders: user.totalOrders,
        totalSpent: user.totalSpent,
        loyaltyPoints: user.loyaltyPoints,
        loyaltyLevel,
        averageOrderValue: parseFloat(averageOrderValue),
        memberSince: user.memberSince,
        lastLogin: user.lastLogin
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

module.exports = router;