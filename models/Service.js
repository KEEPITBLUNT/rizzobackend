const mongoose = require('mongoose');

const serviceSchema = new mongoose.Schema({
  id: {
    type: String,
    required: true,
    unique: true
  },
  name: {
    type: String,
    required: [true, 'Service name is required'],
    trim: true
  },
  description: {
    type: String,
    required: [true, 'Service description is required']
  },
  shortDescription: {
    type: String,
    trim: true
  },
  image: {
    type: String,
    required: [true, 'Service image is required']
  },
  imageLarge: {
    type: String
  },
  startingPrice: {
    type: Number,
    required: [true, 'Starting price is required'],
    min: [0, 'Price cannot be negative']
  },
  features: [{
    type: String,
    required: true
  }],
  process: {
    type: String
  },
  turnaround: {
    type: String
  },
  pricing: [{
    type: {
      type: String,
      required: true
    },
    amount: {
      type: String,
      required: true
    }
  }],
  category: {
    type: String,
    enum: ['laundry', 'dry-cleaning', 'shoe-care', 'bedding', 'wedding-dress', 'alteration'],
    required: true
  },
  isActive: {
    type: Boolean,
    default: true
  },
  popularity: {
    type: Number,
    default: 0
  },
  averageRating: {
    type: Number,
    default: 0,
    min: 0,
    max: 5
  },
  totalReviews: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Index for better search performance
serviceSchema.index({ name: 'text', description: 'text' });
serviceSchema.index({ category: 1, isActive: 1 });
serviceSchema.index({ startingPrice: 1 });

module.exports = mongoose.model('Service', serviceSchema);