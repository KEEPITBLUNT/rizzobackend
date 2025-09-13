const mongoose = require('mongoose');

const promoCodeSchema = new mongoose.Schema({
  code: {
    type: String,
    required: [true, 'Promo code is required'],
    unique: true,
    uppercase: true,
    trim: true
  },
  description: {
    type: String,
    required: [true, 'Description is required']
  },
  discountType: {
    type: String,
    enum: ['percentage', 'fixed'],
    required: true
  },
  discountValue: {
    type: Number,
    required: [true, 'Discount value is required'],
    min: [0, 'Discount value cannot be negative']
  },
  maxDiscount: {
    type: Number,
    min: [0, 'Maximum discount cannot be negative']
  },
  minOrderAmount: {
    type: Number,
    default: 0,
    min: [0, 'Minimum order amount cannot be negative']
  },
  maxUsage: {
    type: Number,
    default: null // null means unlimited
  },
  usageCount: {
    type: Number,
    default: 0
  },
  maxUsagePerUser: {
    type: Number,
    default: 1
  },
  validFrom: {
    type: Date,
    default: Date.now
  },
  validUntil: {
    type: Date,
    required: [true, 'Expiry date is required']
  },
  isActive: {
    type: Boolean,
    default: true
  },
  applicableServices: [{
    type: String
  }],
  excludedServices: [{
    type: String
  }],
  userRestrictions: {
    newUsersOnly: { type: Boolean, default: false },
    existingUsersOnly: { type: Boolean, default: false }
  },
  usageHistory: [{
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    orderId: { type: mongoose.Schema.Types.ObjectId, ref: 'Order' },
    discountApplied: { type: Number },
    usedAt: { type: Date, default: Date.now }
  }]
}, {
  timestamps: true
});

// Check if promo code is valid
promoCodeSchema.methods.isValid = function(userId = null, orderAmount = 0) {
  const now = new Date();
  
  // Check if active
  if (!this.isActive) {
    return { valid: false, message: 'Promo code is not active' };
  }
  
  // Check date validity
  if (now < this.validFrom || now > this.validUntil) {
    return { valid: false, message: 'Promo code has expired' };
  }
  
  // Check minimum order amount
  if (orderAmount < this.minOrderAmount) {
    return { valid: false, message: `Minimum order amount is ₹${this.minOrderAmount}` };
  }
  
  // Check maximum usage
  if (this.maxUsage && this.usageCount >= this.maxUsage) {
    return { valid: false, message: 'Promo code usage limit exceeded' };
  }
  
  // Check per-user usage limit
  if (userId && this.maxUsagePerUser) {
    const userUsage = this.usageHistory.filter(usage => 
      usage.userId.toString() === userId.toString()
    ).length;
    
    if (userUsage >= this.maxUsagePerUser) {
      return { valid: false, message: 'You have already used this promo code' };
    }
  }
  
  return { valid: true, message: 'Promo code is valid' };
};

// Calculate discount amount
promoCodeSchema.methods.calculateDiscount = function(orderAmount) {
  let discount = 0;
  
  if (this.discountType === 'percentage') {
    discount = (orderAmount * this.discountValue) / 100;
    if (this.maxDiscount && discount > this.maxDiscount) {
      discount = this.maxDiscount;
    }
  } else {
    discount = this.discountValue;
  }
  
  return Math.min(discount, orderAmount);
};

// Record usage
promoCodeSchema.methods.recordUsage = function(userId, orderId, discountApplied) {
  this.usageCount += 1;
  this.usageHistory.push({
    userId,
    orderId,
    discountApplied,
    usedAt: new Date()
  });
  return this.save();
};

module.exports = mongoose.model('PromoCode', promoCodeSchema);