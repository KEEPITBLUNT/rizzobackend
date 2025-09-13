const mongoose = require('mongoose');

const pickupSchema = new mongoose.Schema({
  customerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  address: {
    street: { type: String, required: true },
    area: { type: String, required: true },
    city: { type: String, required: true },
    pincode: { type: String, required: true },
    landmark: { type: String }
  },
  date: {
    type: Date,
    required: true
  },
  timeSlot: {
    label: { type: String, required: true },
    from: { type: String, required: true },
    to: { type: String, required: true }
  },
  instructions: {
    type: String
  },
  status: {
    type: String,
    enum: ['requested', 'confirmed', 'in-progress', 'completed', 'cancelled'],
    default: 'requested'
  },
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  estimatedItems: [{
    type: { type: String },
    quantity: { type: Number },
    notes: { type: String }
  }],
  actualItems: [{
    type: { type: String },
    quantity: { type: Number },
    condition: { type: String },
    notes: { type: String }
  }],
  pickupNotes: {
    type: String
  },
  completedAt: {
    type: Date
  }
}, {
  timestamps: true
});

// Indexes
pickupSchema.index({ customerId: 1, date: -1 });
pickupSchema.index({ status: 1, date: 1 });
pickupSchema.index({ assignedTo: 1, status: 1 });

module.exports = mongoose.model('Pickup', pickupSchema);