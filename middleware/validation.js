const { body, validationResult } = require('express-validator');

// Handle validation errors
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array()
    });
  }
  next();
};

// User registration validation
const validateRegistration = [
  body('firstName')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('First name must be between 2 and 50 characters'),
  body('lastName')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Last name must be between 2 and 50 characters'),
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long'),
  body('phone')
    .optional()
    .isMobilePhone('en-IN')
    .withMessage('Please provide a valid Indian phone number'),
  handleValidationErrors
];

// User login validation
const validateLogin = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  body('password')
    .notEmpty()
    .withMessage('Password is required'),
  handleValidationErrors
];

// Order creation validation
const validateOrder = [
  body('customerInfo.firstName')
    .trim()
    .notEmpty()
    .withMessage('First name is required'),
  body('customerInfo.lastName')
    .trim()
    .notEmpty()
    .withMessage('Last name is required'),
  body('customerInfo.email')
    .isEmail()
    .withMessage('Valid email is required'),
  body('customerInfo.phone')
    .isMobilePhone('en-IN')
    .withMessage('Valid phone number is required'),
  body('customerInfo.address.street')
    .trim()
    .notEmpty()
    .withMessage('Street address is required'),
  body('customerInfo.address.area')
    .trim()
    .notEmpty()
    .withMessage('Area is required'),
  body('customerInfo.address.city')
    .trim()
    .notEmpty()
    .withMessage('City is required'),
  body('customerInfo.address.pincode')
    .isPostalCode('IN')
    .withMessage('Valid pincode is required'),
  body('items')
    .isArray({ min: 1 })
    .withMessage('At least one item is required'),
  body('items.*.serviceId')
    .notEmpty()
    .withMessage('Service ID is required for each item'),
  body('items.*.quantity')
    .isInt({ min: 1 })
    .withMessage('Quantity must be at least 1'),
  body('items.*.unitPrice')
    .isFloat({ min: 0 })
    .withMessage('Unit price must be a positive number'),
  body('schedule.pickupDate')
    .isISO8601()
    .withMessage('Valid pickup date is required'),
  body('paymentMethod')
    .isIn(['card', 'upi', 'cod'])
    .withMessage('Valid payment method is required'),
  handleValidationErrors
];

// Pickup validation
const validatePickup = [
  body('address.street')
    .trim()
    .notEmpty()
    .withMessage('Street address is required'),
  body('address.area')
    .trim()
    .notEmpty()
    .withMessage('Area is required'),
  body('address.city')
    .trim()
    .notEmpty()
    .withMessage('City is required'),
  body('address.pincode')
    .isPostalCode('IN')
    .withMessage('Valid pincode is required'),
  body('date')
    .isISO8601()
    .withMessage('Valid date is required'),
  body('timeSlot.label')
    .notEmpty()
    .withMessage('Time slot label is required'),
  body('timeSlot.from')
    .notEmpty()
    .withMessage('Time slot start time is required'),
  body('timeSlot.to')
    .notEmpty()
    .withMessage('Time slot end time is required'),
  handleValidationErrors
];

// Service validation
const validateService = [
  body('name')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Service name must be between 2 and 100 characters'),
  body('description')
    .trim()
    .isLength({ min: 10, max: 1000 })
    .withMessage('Description must be between 10 and 1000 characters'),
  body('startingPrice')
    .isFloat({ min: 0 })
    .withMessage('Starting price must be a positive number'),
  body('category')
    .isIn(['laundry', 'dry-cleaning', 'shoe-care', 'bedding', 'wedding-dress', 'alteration'])
    .withMessage('Valid category is required'),
  body('features')
    .isArray({ min: 1 })
    .withMessage('At least one feature is required'),
  handleValidationErrors
];

// Promo code validation
const validatePromoCode = [
  body('code')
    .trim()
    .isLength({ min: 3, max: 20 })
    .isAlphanumeric()
    .withMessage('Promo code must be 3-20 alphanumeric characters'),
  body('description')
    .trim()
    .isLength({ min: 5, max: 200 })
    .withMessage('Description must be between 5 and 200 characters'),
  body('discountType')
    .isIn(['percentage', 'fixed'])
    .withMessage('Discount type must be percentage or fixed'),
  body('discountValue')
    .isFloat({ min: 0 })
    .withMessage('Discount value must be a positive number'),
  body('validUntil')
    .isISO8601()
    .withMessage('Valid expiry date is required'),
  handleValidationErrors
];

module.exports = {
  validateRegistration,
  validateLogin,
  validateOrder,
  validatePickup,
  validateService,
  validatePromoCode,
  handleValidationErrors
};