const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
  serviceId: { type: String, required: true },
  serviceName: { type: String, required: true },
  itemName: { type: String, required: true },
  quantity: { type: Number, required: true, min: 1 },
  unitPrice: { type: Number, required: true, min: 0 },
  image: { type: String },
  specialInstructions: { type: String }
});

const orderSchema = new mongoose.Schema({
  orderNumber: { type: String,  unique: true },
  customerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  customerInfo: {
    firstName: { type: String, required: true }, 
    lastName: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String, required: true },
    address: {
      street: { type: String, required: true },
      area: { type: String, required: true },
      city: { type: String, required: true },
      pincode: { type: String, required: true },
      landmark: { type: String }
    }
  },
  items: [orderItemSchema],
  schedule: {
    pickupDate: { type: Date, required: true },
    timeSlot: { type: String, required: true },
    deliveryDate: { type: Date, required: true },
    specialInstructions: { type: String }
  },
  summary: {
    subtotal: { type: Number, required: true },
    deliveryFee: { type: Number, default: 0 },
    expressCharge: { type: Number, default: 0 },
    gst: { type: Number, required: true },
    discount: { type: Number, default: 0 },
    total: { type: Number, required: true }
  },
  paymentMethod: {
    type: String,
    enum: ['card', 'upi', 'cod'],
    required: true
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'paid', 'failed', 'refunded'],
    default: 'pending'
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'picked-up', 'in-progress', 'ready', 'out-for-delivery', 'delivered', 'completed', 'cancelled'],
    default: 'pending'
  },
  promoCode: { type: String },
  trackingSteps: [{
    status: { type: String, required: true },
    title: { type: String, required: true },
    description: { type: String, required: true },
    timestamp: { type: Date, default: Date.now },
    isCompleted: { type: Boolean, default: false },
    isActive: { type: Boolean, default: false }
  }],
  estimatedDelivery: { type: Date },
  actualDelivery: { type: Date },
  rating: { type: Number, min: 1, max: 5 },
  review: { type: String },
  notes: [{
    message: { type: String, required: true },
    addedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    timestamp: { type: Date, default: Date.now }
  }]
}, { timestamps: true });

// Pre-validate: auto-generate order number before validation
orderSchema.pre('validate', function (next) {
  if (!this.orderNumber) {
    const timestamp = Date.now().toString().slice(-6);
    const random = Math.random().toString(36).substr(2, 4).toUpperCase();
    this.orderNumber = `ORD-${timestamp}${random}`;
  }
  next();
});

// Method: initialize tracking
orderSchema.methods.initializeTracking = function () {
  this.trackingSteps = [
    { status: 'pending', title: 'Order Placed', description: 'Your order has been placed successfully', isCompleted: true, isActive: false },
    { status: 'confirmed', title: 'Order Confirmed', description: 'We have confirmed your order and will pickup soon', isCompleted: false, isActive: true },
    { status: 'picked-up', title: 'Items Picked Up', description: 'Your items have been collected from your location', isCompleted: false, isActive: false },
    { status: 'in-progress', title: 'Processing', description: 'Your items are being cleaned with care', isCompleted: false, isActive: false },
    { status: 'ready', title: 'Ready for Delivery', description: 'Your items are clean and ready for delivery', isCompleted: false, isActive: false },
    { status: 'delivered', title: 'Delivered', description: 'Your items have been delivered successfully', isCompleted: false, isActive: false }
  ];
};

// Method: update status
orderSchema.methods.updateStatus = function (newStatus) {
  this.status = newStatus;
  const stepIndex = this.trackingSteps.findIndex(step => step.status === newStatus);
  if (stepIndex !== -1) {
    for (let i = 0; i <= stepIndex; i++) {
      this.trackingSteps[i].isCompleted = true;
      this.trackingSteps[i].isActive = false;
    }
    this.trackingSteps[stepIndex].isActive = true;
    this.trackingSteps[stepIndex].timestamp = new Date();
    if (stepIndex + 1 < this.trackingSteps.length) {
      this.trackingSteps[stepIndex + 1].isActive = true;
    }
  }
  return this.save();
};

// Indexes
orderSchema.index({ customerId: 1, createdAt: -1 });
orderSchema.index({ orderNumber: 1 });
orderSchema.index({ status: 1 });
orderSchema.index({ 'schedule.pickupDate': 1 });

module.exports = mongoose.model('Order', orderSchema);