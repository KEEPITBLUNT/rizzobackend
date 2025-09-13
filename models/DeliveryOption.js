const mongoose = require('mongoose');

const deliveryOptionSchema = new mongoose.Schema({
  id: {
    type: String,
    required: true,
    unique: true
  },
  name: {
    type: String,
    required: [true, 'Delivery option name is required'],
    trim: true
  },
  description: {
    type: String,
    required: [true, 'Description is required']
  },
  estimatedTime: {
    type: String,
    required: [true, 'Estimated time is required']
  },
  price: {
    type: Number,
    required: [true, 'Price is required'],
    min: [0, 'Price cannot be negative']
  },
  icon: {
    type: String,
    required: true
  },
  features: [{
    type: String,
    required: true
  }],
  isPopular: {
    type: Boolean,
    default: false
  },
  isExpress: {
    type: Boolean,
    default: false
  },
  isActive: {
    type: Boolean,
    default: true
  },
  availableAreas: [{
    type: String
  }],
  minimumOrder: {
    type: Number,
    default: 0
  },
  maximumOrder: {
    type: Number
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('DeliveryOption', deliveryOptionSchema);