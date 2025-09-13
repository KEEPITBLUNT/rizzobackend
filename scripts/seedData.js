const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

// Import models
const User = require('../models/User');
const Service = require('../models/Service');
const DeliveryOption = require('../models/DeliveryOption');
const PromoCode = require('../models/PromoCode');

// Connect to database
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/cleanmate', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const seedData = async () => {
  try {
    console.log('🌱 Starting database seeding...');

    // Clear existing data
    await User.deleteMany({});
    await Service.deleteMany({});
    await DeliveryOption.deleteMany({});
    await PromoCode.deleteMany({});

    console.log('🗑️  Cleared existing data');

    // Create admin user
    const adminPassword = await bcrypt.hash('admin123', 12);
    const admin = await User.create({
      firstName: 'Admin',
      lastName: 'User',
      email: 'admin@cleanmate.in',
      password: adminPassword,
      phone: '9876543210',
      role: 'admin',
      isActive: true
    });

    // Create demo users
    const demoPassword = await bcrypt.hash('password123', 12);
    const demoUsers = await User.create([
      {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
        password: demoPassword,
        phone: '9876543211',
        address: {
          street: '123 Main Street',
          area: 'Bandra West',
          city: 'Mumbai',
          pincode: '400050',
          landmark: 'Near Linking Road'
        },
        totalOrders: 5,
        totalSpent: 2500,
        loyaltyPoints: 250
      },
      {
        firstName: 'Jane',
        lastName: 'Smith',
        email: 'jane.smith@example.com',
        password: demoPassword,
        phone: '9876543212',
        address: {
          street: '456 Oak Avenue',
          area: 'Andheri East',
          city: 'Mumbai',
          pincode: '400069',
          landmark: 'Near Metro Station'
        },
        totalOrders: 3,
        totalSpent: 1800,
        loyaltyPoints: 180
      }
    ]);

    console.log('👥 Created users');

    // Create services
    const services = await Service.create([
      {
        id: 'laundry',
        name: 'Laundry Service',
        description: 'Our standard laundry service includes washing, drying, folding, and packaging your clothes with care using premium detergents.',
        shortDescription: 'Professional washing, drying, and folding for all your everyday garments.',
        image: 'https://images.pexels.com/photos/5591581/pexels-photo-5591581.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
        imageLarge: 'https://images.pexels.com/photos/4761771/pexels-photo-4761771.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
        startingPrice: 49,
        features: [
          'Sorting by color and fabric type',
          'Premium detergents and fabric softeners',
          'Stain treatment at no extra cost',
          'Folded and packaged clothes',
          'Optional hang dry for delicate items',
          'Eco-friendly options available'
        ],
        process: 'Our laundry process begins with careful sorting by color and fabric type. We use premium detergents and adjust water temperature based on fabric requirements. After washing, items are dried at the appropriate temperature, then meticulously folded and packaged to minimize wrinkles.',
        turnaround: '24-hour standard turnaround. Same-day service available for orders before 10AM.',
        pricing: [
          { type: 'Per Kg', amount: '₹49/kg' },
          { type: 'Minimum Order', amount: '₹150' },
          { type: 'Express Service', amount: '+₹50' },
          { type: 'Eco-Friendly Option', amount: '+₹20' }
        ],
        category: 'laundry',
        popularity: 100,
        averageRating: 4.8,
        totalReviews: 1250
      },
      {
        id: 'dry-cleaning',
        name: 'Dry Cleaning',
        description: 'Professional dry cleaning for your delicate garments, suits, sarees, and items that cannot be washed with water.',
        shortDescription: 'Expert care for delicate garments, suits, sarees, and special fabrics.',
        image: 'https://images.pexels.com/photos/3770434/pexels-photo-3770434.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
        imageLarge: 'https://images.pexels.com/photos/3770434/pexels-photo-3770434.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
        startingPrice: 149,
        features: [
          'Gentle cleaning for delicate fabrics',
          'Spot treatment for stains',
          'Hand-finished pressing',
          'Minor repairs included (buttons, small tears)',
          'Eco-friendly solvents',
          'Packaged to prevent wrinkles'
        ],
        process: 'Our dry cleaning process uses safe, eco-friendly solvents that clean fabrics without water. Each garment undergoes inspection, spot treatment for stains, gentle cleaning, and hand-finished pressing to ensure perfect results without damaging delicate fabrics.',
        turnaround: '48-hour standard turnaround for dry cleaning services.',
        pricing: [
          { type: 'Shirts/Blouses', amount: '₹149 each' },
          { type: 'Pants/Trousers', amount: '₹199 each' },
          { type: 'Suits (2pc)', amount: '₹399 each' },
          { type: 'Sarees', amount: '₹299 each' },
          { type: 'Coats/Jackets', amount: '₹499 each' }
        ],
        category: 'dry-cleaning',
        popularity: 85,
        averageRating: 4.7,
        totalReviews: 890
      },
      {
        id: 'shoe-care',
        name: 'Shoe Care',
        description: 'Revitalize your footwear with our professional shoe cleaning and care services, extending the life of your favorite pairs.',
        shortDescription: 'Professional cleaning and restoration for all types of footwear.',
        image: 'https://images.pexels.com/photos/5591939/pexels-photo-5591939.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
        imageLarge: 'https://images.pexels.com/photos/5591939/pexels-photo-5591939.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
        startingPrice: 299,
        features: [
          'Deep cleaning for all types of shoes',
          'Stain and scuff removal',
          'Deodorizing treatment',
          'Leather conditioning',
          'Sole cleaning and restoration',
          'Minor repairs (where possible)'
        ],
        process: 'Our shoe care process involves careful inspection, removal of dirt and debris, deep cleaning with specialized products for each material type, stain removal, deodorizing, and finishing treatments to restore and protect your footwear.',
        turnaround: '3-5 days standard turnaround for shoe care services.',
        pricing: [
          { type: 'Basic Clean (Sneakers)', amount: '₹299 per pair' },
          { type: 'Premium Clean (Leather)', amount: '₹499 per pair' },
          { type: 'Luxury Care (Designer)', amount: '₹699 per pair' },
          { type: 'Suede/Nubuck Treatment', amount: '₹599 per pair' },
          { type: 'Water Repellent Treatment', amount: '+₹199 per pair' }
        ],
        category: 'shoe-care',
        popularity: 60,
        averageRating: 4.6,
        totalReviews: 420
      },
      {
        id: 'bedding',
        name: 'Bedding & Linens',
        description: 'Professional cleaning for all your bedding needs including comforters, duvets, bed sheets, pillowcases, and other household linens.',
        shortDescription: 'Thorough cleaning for comforters, duvets, bed sheets, and household linens.',
        image: 'https://images.pexels.com/photos/279746/pexels-photo-279746.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
        imageLarge: 'https://images.pexels.com/photos/279746/pexels-photo-279746.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
        startingPrice: 199,
        features: [
          'Deep cleaning for all bedding types',
          'Allergen removal treatment',
          'Stain treatment',
          'Fresh scent options',
          'Proper folding and packaging',
          'Special care for high-end linens'
        ],
        process: 'Our bedding and linen cleaning process uses specialized equipment to handle bulky items like comforters and duvets. We use gentle, hypoallergenic detergents that clean thoroughly while protecting fabrics, followed by proper drying to maintain softness and prevent shrinkage.',
        turnaround: '2-3 days standard turnaround for bedding and linens.',
        pricing: [
          { type: 'Bed Sheets (per set)', amount: '₹199' },
          { type: 'Comforter/Duvet', amount: '₹349' },
          { type: 'Blankets', amount: '₹249' },
          { type: 'Pillows', amount: '₹149 each' },
          { type: 'Mattress Protector', amount: '₹299' }
        ],
        category: 'bedding',
        popularity: 70,
        averageRating: 4.5,
        totalReviews: 650
      },
      {
        id: 'wedding-dress',
        name: 'Wedding Dress Cleaning',
        description: 'Specialized cleaning and preservation service for wedding lehengas, sarees, and formal wear to maintain their beauty and prevent fabric deterioration.',
        shortDescription: 'Expert cleaning and preservation for wedding lehengas, sarees, and formal wear.',
        image: 'https://images.pexels.com/photos/291759/pexels-photo-291759.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
        imageLarge: 'https://images.pexels.com/photos/291759/pexels-photo-291759.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
        startingPrice: 2999,
        features: [
          'Specialized cleaning for delicate fabrics and embellishments',
          'Stain removal (including hidden stains)',
          'Hand-finished detailing',
          'Acid-free preservation packaging',
          'Anti-yellowing treatment',
          'Optional preservation box'
        ],
        process: 'Our wedding dress cleaning process begins with a thorough inspection and documentation of your garment. We then hand-clean the dress using specialized techniques for different fabrics and embellishments. After cleaning, we carefully press the garment and provide preservation packaging to prevent yellowing and fabric deterioration.',
        turnaround: '2-3 weeks for wedding dress cleaning and preservation.',
        pricing: [
          { type: 'Basic Cleaning', amount: '₹2,999' },
          { type: 'Cleaning & Preservation', amount: '₹4,999' },
          { type: 'Heirloom Preservation', amount: '₹6,999' },
          { type: 'Rush Service', amount: '+₹2,000' }
        ],
        category: 'wedding-dress',
        popularity: 25,
        averageRating: 4.9,
        totalReviews: 180
      },
      {
        id: 'alteration',
        name: 'Alterations & Repairs',
        description: 'Professional clothing alterations and repair services to ensure your garments fit perfectly and last longer.',
        shortDescription: 'Expert tailoring, alterations, and repairs for all types of clothing.',
        image: 'https://images.pexels.com/photos/4620621/pexels-photo-4620621.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
        imageLarge: 'https://images.pexels.com/photos/4620621/pexels-photo-4620621.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
        startingPrice: 99,
        features: [
          'Professional tailoring services',
          'Hem adjustments',
          'Zipper repair/replacement',
          'Button replacement',
          'Tear/hole repair',
          'Seam adjustments'
        ],
        process: 'Our alteration process starts with a professional measurement and assessment of your garments. Our skilled tailors then make precise adjustments to ensure the perfect fit, followed by careful pressing to achieve a polished finish.',
        turnaround: '3-7 days standard turnaround for alterations, depending on complexity.',
        pricing: [
          { type: 'Hem Pants/Skirts', amount: '₹149' },
          { type: 'Take in/out waist', amount: '₹199' },
          { type: 'Zipper Replacement', amount: '₹169+' },
          { type: 'Button Replacement', amount: '₹39 each' },
          { type: 'Patch/Repair', amount: '₹99+' }
        ],
        category: 'alteration',
        popularity: 45,
        averageRating: 4.4,
        totalReviews: 320
      }
    ]);

    console.log('🧺 Created services');

    // Create delivery options
    const deliveryOptions = await DeliveryOption.create([
      {
        id: 'express',
        name: 'Express Delivery',
        description: 'Super fast pickup and delivery across Mumbai',
        estimatedTime: 'Within 1 hour',
        price: 99,
        icon: 'zap',
        features: [
          'Immediate pickup within 1 hour',
          'Priority processing',
          'Same-day delivery guarantee',
          'Real-time tracking'
        ],
        isPopular: true,
        isExpress: true,
        availableAreas: ['Bandra', 'Andheri', 'Juhu', 'Powai', 'Lower Parel'],
        minimumOrder: 200
      },
      {
        id: 'standard',
        name: 'Standard Delivery',
        description: 'Regular pickup and delivery with flexible timing',
        estimatedTime: '24-48 hours',
        price: 0,
        icon: 'clock',
        features: [
          'Flexible pickup timing',
          'Free delivery service',
          '24-48 hour processing',
          'Quality guarantee'
        ],
        isPopular: false,
        isExpress: false,
        availableAreas: ['All Mumbai'],
        minimumOrder: 150
      },
      {
        id: 'premium',
        name: 'Premium Service',
        description: 'White-glove service with premium care',
        estimatedTime: '12-24 hours',
        price: 199,
        icon: 'star',
        features: [
          'Premium fabric care',
          'Hand-finished pressing',
          'Luxury packaging',
          'Dedicated customer manager'
        ],
        isPopular: false,
        isExpress: false,
        availableAreas: ['South Mumbai', 'Bandra', 'Juhu'],
        minimumOrder: 500
      }
    ]);

    console.log('🚚 Created delivery options');

    // Create promo codes
    const promoCodes = await PromoCode.create([
      {
        code: 'FIRST20',
        description: '20% off on your first order',
        discountType: 'percentage',
        discountValue: 20,
        maxDiscount: 200,
        minOrderAmount: 300,
        maxUsage: 1000,
        maxUsagePerUser: 1,
        validFrom: new Date(),
        validUntil: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year
        userRestrictions: { newUsersOnly: true }
      },
      {
        code: 'SAVE10',
        description: 'Flat ₹50 off on orders above ₹500',
        discountType: 'fixed',
        discountValue: 50,
        minOrderAmount: 500,
        maxUsage: 500,
        maxUsagePerUser: 3,
        validFrom: new Date(),
        validUntil: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000) // 90 days
      },
      {
        code: 'WEEKEND25',
        description: '25% off on weekend orders',
        discountType: 'percentage',
        discountValue: 25,
        maxDiscount: 300,
        minOrderAmount: 400,
        maxUsage: 200,
        maxUsagePerUser: 2,
        validFrom: new Date(),
        validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days
      },
      {
        code: 'LOYALTY100',
        description: 'Flat ₹100 off for loyal customers',
        discountType: 'fixed',
        discountValue: 100,
        minOrderAmount: 800,
        maxUsage: 100,
        maxUsagePerUser: 1,
        validFrom: new Date(),
        validUntil: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000), // 60 days
        userRestrictions: { existingUsersOnly: true }
      }
    ]);

    console.log('🎟️  Created promo codes');

    console.log('✅ Database seeding completed successfully!');
    console.log('\n📋 Seeded Data Summary:');
    console.log(`👥 Users: ${demoUsers.length + 1} (including 1 admin)`);
    console.log(`🧺 Services: ${services.length}`);
    console.log(`🚚 Delivery Options: ${deliveryOptions.length}`);
    console.log(`🎟️  Promo Codes: ${promoCodes.length}`);
    
    console.log('\n🔐 Admin Credentials:');
    console.log('Email: admin@cleanmate.in');
    console.log('Password: admin123');
    
    console.log('\n👤 Demo User Credentials:');
    console.log('Email: john.doe@example.com');
    console.log('Password: password123');
    console.log('\nEmail: jane.smith@example.com');
    console.log('Password: password123');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  }
};

// Run the seeder
seedData();