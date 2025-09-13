const express = require('express');
const User = require('../models/User');
const Order = require('../models/Order');
const Service = require('../models/Service');
const Pickup = require('../models/Pickup');
const PromoCode = require('../models/PromoCode');
const { protect, adminOnly } = require('../middleware/auth');

const router = express.Router();

// @desc    Get admin dashboard stats
// @route   GET /api/admin/dashboard
// @access  Private/Admin
router.get('/dashboard', protect, adminOnly, async (req, res) => {
  try {
    // Get current date ranges
    const today = new Date();
    const startOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const startOfWeek = new Date(today.setDate(today.getDate() - today.getDay()));
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

    // Basic counts
    const totalUsers = await User.countDocuments({ isActive: true });
    const totalOrders = await Order.countDocuments();
    const totalServices = await Service.countDocuments({ isActive: true });
    const activePromoCodes = await PromoCode.countDocuments({ isActive: true });

    // Today's stats
    const todayOrders = await Order.countDocuments({
      createdAt: { $gte: startOfToday }
    });
    
    const todayRevenue = await Order.aggregate([
      { $match: { createdAt: { $gte: startOfToday }, status: { $ne: 'cancelled' } } },
      { $group: { _id: null, total: { $sum: '$summary.total' } } }
    ]);

    const todayPickups = await Pickup.countDocuments({
      date: { $gte: startOfToday }
    });

    // Weekly stats
    const weeklyOrders = await Order.countDocuments({
      createdAt: { $gte: startOfWeek }
    });

    const weeklyRevenue = await Order.aggregate([
      { $match: { createdAt: { $gte: startOfWeek }, status: { $ne: 'cancelled' } } },
      { $group: { _id: null, total: { $sum: '$summary.total' } } }
    ]);

    // Monthly stats
    const monthlyOrders = await Order.countDocuments({
      createdAt: { $gte: startOfMonth }
    });

    const monthlyRevenue = await Order.aggregate([
      { $match: { createdAt: { $gte: startOfMonth }, status: { $ne: 'cancelled' } } },
      { $group: { _id: null, total: { $sum: '$summary.total' } } }
    ]);

    // Order status distribution
    const orderStatusStats = await Order.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);

    // Recent orders
    const recentOrders = await Order.find()
      .populate('customerId', 'firstName lastName email')
      .sort({ createdAt: -1 })
      .limit(10);

    // Top services
    const topServices = await Order.aggregate([
      { $unwind: '$items' },
      { $group: { 
        _id: '$items.serviceId', 
        serviceName: { $first: '$items.serviceName' },
        count: { $sum: '$items.quantity' },
        revenue: { $sum: '$items.totalPrice' }
      }},
      { $sort: { count: -1 } },
      { $limit: 5 }
    ]);

    res.json({
      success: true,
      stats: {
        overview: {
          totalUsers,
          totalOrders,
          totalServices,
          activePromoCodes
        },
        today: {
          orders: todayOrders,
          revenue: todayRevenue[0]?.total || 0,
          pickups: todayPickups
        },
        weekly: {
          orders: weeklyOrders,
          revenue: weeklyRevenue[0]?.total || 0
        },
        monthly: {
          orders: monthlyOrders,
          revenue: monthlyRevenue[0]?.total || 0
        },
        orderStatusStats,
        recentOrders,
        topServices
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

// @desc    Get all users
// @route   GET /api/admin/users
// @access  Private/Admin
router.get('/users', protect, adminOnly, async (req, res) => {
  try {
    const {
      search,
      isActive,
      role,
      page = 1,
      limit = 20,
      sort = '-createdAt'
    } = req.query;

    // Build query
    let query = {};
    
    if (search) {
      query.$or = [
        { firstName: { $regex: search, $options: 'i' } },
        { lastName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }
    
    if (isActive !== undefined) {
      query.isActive = isActive === 'true';
    }
    
    if (role) {
      query.role = role;
    }

    // Execute query with pagination
    const users = await User.find(query)
      .sort(sort)
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await User.countDocuments(query);

    res.json({
      success: true,
      count: users.length,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / limit),
      users
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

// @desc    Get single user
// @route   GET /api/admin/users/:id
// @access  Private/Admin
router.get('/users/:id', protect, adminOnly, async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Get user's orders
    const orders = await Order.find({ customerId: user._id })
      .sort({ createdAt: -1 })
      .limit(10);

    // Get user's pickups
    const pickups = await Pickup.find({ customerId: user._id })
      .sort({ createdAt: -1 })
      .limit(5);

    res.json({
      success: true,
      user,
      orders,
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

// @desc    Update user
// @route   PUT /api/admin/users/:id
// @access  Private/Admin
router.put('/users/:id', protect, adminOnly, async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      message: 'User updated successfully',
      user
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

// @desc    Delete user
// @route   DELETE /api/admin/users/:id
// @access  Private/Admin
router.delete('/users/:id', protect, adminOnly, async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      message: 'User deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

// @desc    Get revenue analytics
// @route   GET /api/admin/analytics/revenue
// @access  Private/Admin
router.get('/analytics/revenue', protect, adminOnly, async (req, res) => {
  try {
    const { period = 'month' } = req.query;
    
    let groupBy, dateRange;
    const now = new Date();
    
    switch (period) {
      case 'week':
        groupBy = { $dayOfWeek: '$createdAt' };
        dateRange = new Date(now.setDate(now.getDate() - 7));
        break;
      case 'year':
        groupBy = { $month: '$createdAt' };
        dateRange = new Date(now.setFullYear(now.getFullYear() - 1));
        break;
      default: // month
        groupBy = { $dayOfMonth: '$createdAt' };
        dateRange = new Date(now.setMonth(now.getMonth() - 1));
    }

    const revenueData = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: dateRange },
          status: { $ne: 'cancelled' }
        }
      },
      {
        $group: {
          _id: groupBy,
          revenue: { $sum: '$summary.total' },
          orders: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    res.json({
      success: true,
      period,
      data: revenueData
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

// @desc    Get service analytics
// @route   GET /api/admin/analytics/services
// @access  Private/Admin
router.get('/analytics/services', protect, adminOnly, async (req, res) => {
  try {
    const serviceAnalytics = await Order.aggregate([
      { $unwind: '$items' },
      {
        $group: {
          _id: '$items.serviceId',
          serviceName: { $first: '$items.serviceName' },
          totalOrders: { $sum: '$items.quantity' },
          totalRevenue: { $sum: '$items.totalPrice' },
          averageOrderValue: { $avg: '$items.totalPrice' }
        }
      },
      { $sort: { totalRevenue: -1 } }
    ]);

    res.json({
      success: true,
      analytics: serviceAnalytics
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