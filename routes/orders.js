const express = require('express');
const Order = require('../models/Order');
const User = require('../models/User');
const { protect, optionalAuth } = require('../middleware/auth');
const { validateOrder } = require('../middleware/validation');

const router = express.Router();

// @desc    Create order
// @route   POST /api/orders
// @access  Private/Public
router.post('/', optionalAuth, validateOrder, async (req, res) => {
  try {
    const {
      customerInfo,
      items,
      schedule,
      paymentMethod,
      promoCode
    } = req.body;

    // Calculate order summary
    const subtotal = items.reduce((sum, item) => sum + (item.unitPrice * item.quantity), 0);
    const deliveryFee = subtotal > 500 ? 0 : 50;
    const gst = Math.round((subtotal + deliveryFee) * 0.18);
    const discount = 0; // Apply promo code discount if needed
    const total = subtotal + deliveryFee + gst - discount;

// Create order instance
const order = new Order({
customerId: req.user ? req.user.id : undefined,
  customerInfo,
  items: items.map(item => ({
    serviceId: item.serviceId,
    serviceName: item.serviceName,
    itemName: item.itemName,
    quantity: item.quantity,
    unitPrice: item.unitPrice,
    image: item.image,
    specialInstructions: item.specialInstructions
  })),
  schedule: {
    pickupDate: new Date(schedule.pickupDate),
    timeSlot: `${schedule.timeSlot.label} (${schedule.timeSlot.from} - ${schedule.timeSlot.to})`, // ✅ Fix here
    deliveryDate: new Date(schedule.deliveryDate),
    specialInstructions: schedule.specialInstructions
  },
  summary: {
    subtotal,
    deliveryFee,
    gst,
    discount,
    total
  },
  paymentMethod,
  promoCode
});

 
// ✅ Await this (so `orderNumber` and `trackingSteps` get added)
await order.initializeTracking();
await order.save();

    // Update user stats if logged in
    if (req.user) {
      await User.findByIdAndUpdate(req.user.id, {
        $inc: { totalOrders: 1, totalSpent: total }
      });
    }

    res.status(201).json({
      success: true,
      message: 'Order created successfully',
      order: {
        _id: order._id,
        orderNumber: order.orderNumber,
        status: order.status,
        summary: order.summary,
        items: order.items,
        schedule: order.schedule,
        paymentMethod: order.paymentMethod,
        createdAt: order.createdAt
      }
    });
  } catch (error) {
    console.error('Order creation error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error creating order',
      error: error.message
    });
  }
});

// @desc    Get user orders
// @route   GET /api/orders
// @access  Private
router.get('/', protect, async (req, res) => {
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
    const orders = await Order.find(query)
      .sort(sort)
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Order.countDocuments(query);

    res.json({
      success: true,
      count: orders.length,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / limit),
      orders
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

// @desc    Get single order
// @route   GET /api/orders/:id
// @access  Private
router.get('/:id', protect, async (req, res) => {
  try {
    const order = await Order.findOne({
      _id: req.params.id,
      customerId: req.user.id
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    res.json({
      success: true,
      order
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

// @desc    Update order status
// @route   PUT /api/orders/:id/status
// @access  Private/Admin
router.put('/:id/status', protect, async (req, res) => {
  try {
    const { status } = req.body;

    const validStatuses = ['pending', 'confirmed', 'picked-up', 'in-progress', 'ready', 'out-for-delivery', 'delivered', 'completed', 'cancelled'];
    
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status'
      });
    }

    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    // Update status and tracking
    await order.updateStatus(status);

    res.json({
      success: true,
      message: 'Order status updated successfully',
      order
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

// @desc    Cancel order
// @route   PUT /api/orders/:id/cancel
// @access  Private
router.put('/:id/cancel', protect, async (req, res) => {
  try {
    const order = await Order.findOne({
      _id: req.params.id,
      customerId: req.user.id
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    // Check if order can be cancelled
    if (['delivered', 'completed', 'cancelled'].includes(order.status)) {
      return res.status(400).json({
        success: false,
        message: 'Order cannot be cancelled at this stage'
      });
    }

    await order.updateStatus('cancelled');

    res.json({
      success: true,
      message: 'Order cancelled successfully',
      order
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