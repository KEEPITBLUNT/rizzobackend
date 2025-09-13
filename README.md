# CleanMate Backend API

A comprehensive MERN stack backend for CleanMate laundry service application.

## 🚀 Features

- **Authentication & Authorization**: JWT-based auth with role-based access control
- **User Management**: Registration, login, profile management
- **Service Management**: CRUD operations for laundry services
- **Order Management**: Complete order lifecycle management
- **Pickup Scheduling**: Pickup request and management system
- **Delivery Options**: Flexible delivery options with pricing
- **Promo Codes**: Discount and promotional code system
- **Admin Dashboard**: Comprehensive admin panel with analytics
- **Security**: Rate limiting, input validation, error handling
- **Database**: MongoDB with Mongoose ODM

## 📋 Prerequisites

- Node.js (v16 or higher)
- MongoDB (local or MongoDB Atlas)
- npm or yarn

## 🛠️ Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd cleanmate-backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   ```bash
   cp .env.example .env
   ```
   


4. **Start MongoDB**
   - For local MongoDB: `mongod`
   - For MongoDB Atlas: Use your connection string

5. **Seed the database** (Optional)
   ```bash
   npm run seed
   ```

6. **Start the server**
   ```bash
   # Development
   npm run dev
   
   # Production
   npm start
   ```

## 📚 API Documentation

### Base URL
```
http://localhost:8000/api
```

### Authentication Endpoints

#### Register User
```http
POST /auth/register
Content-Type: application/json

{
  "firstName": "John",
  "lastName": "Doe",
  "email": "john@example.com",
  "password": "password123",
  "phone": "9876543210"
}
```

#### Login User
```http
POST /auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "password123"
}
```

#### Get Current User
```http
GET /auth/me
Authorization: Bearer <token>
```

### User Endpoints

#### Get User Profile
```http
GET /users/profile
Authorization: Bearer <token>
```

#### Update User Profile
```http
PUT /users/profile
Authorization: Bearer <token>
Content-Type: application/json

{
  "firstName": "John",
  "lastName": "Doe",
  "phone": "9876543210",
  "address": {
    "street": "123 Main St",
    "area": "Bandra West",
    "city": "Mumbai",
    "pincode": "400050"
  }
}
```

### Service Endpoints

#### Get All Services
```http
GET /services
```

#### Get Single Service
```http
GET /services/:id
```

#### Create Service (Admin Only)
```http
POST /services
Authorization: Bearer <admin-token>
Content-Type: application/json

{
  "id": "laundry",
  "name": "Laundry Service",
  "description": "Professional laundry service",
  "startingPrice": 49,
  "category": "laundry",
  "features": ["Feature 1", "Feature 2"]
}
```

### Order Endpoints

#### Create Order
```http
POST /orders
Authorization: Bearer <token>
Content-Type: application/json

{
  "customerInfo": {
    "firstName": "John",
    "lastName": "Doe",
    "email": "john@example.com",
    "phone": "9876543210",
    "address": {
      "street": "123 Main St",
      "area": "Bandra West",
      "city": "Mumbai",
      "pincode": "400050"
    }
  },
  "items": [
    {
      "serviceId": "laundry",
      "serviceName": "Laundry Service",
      "itemName": "Cotton Shirts",
      "quantity": 3,
      "unitPrice": 49
    }
  ],
  "schedule": {
    "pickupDate": "2024-01-15",
    "pickupTimeSlot": {
      "label": "9:00 AM - 12:00 PM",
      "startTime": "09:00",
      "endTime": "12:00"
    },
    "deliveryDate": "2024-01-17",
    "deliveryOption": {
      "id": "standard",
      "name": "Standard Delivery",
      "price": 0
    }
  },
  "paymentMethod": "cod"
}
```

#### Get User Orders
```http
GET /orders
Authorization: Bearer <token>
```

#### Get Single Order
```http
GET /orders/:id
Authorization: Bearer <token>
```

### Pickup Endpoints

#### Create Pickup Request
```http
POST /pickups
Authorization: Bearer <token>
Content-Type: application/json

{
  "address": {
    "street": "123 Main St",
    "area": "Bandra West",
    "city": "Mumbai",
    "pincode": "400050"
  },
  "date": "2024-01-15",
  "timeSlot": {
    "label": "Morning Slot",
    "from": "9:00 AM",
    "to": "11:00 AM"
  },
  "instructions": "Call before pickup"
}
```

#### Get User Pickups
```http
GET /pickups/user
Authorization: Bearer <token>
```

#### Cancel Pickup
```http
PUT /pickups/pickup/:id/cancel
Authorization: Bearer <token>
```

### Delivery Options

#### Get All Delivery Options
```http
GET /delivery-options
```

### Promo Codes

#### Validate Promo Code
```http
POST /promos/validate
Content-Type: application/json

{
  "promoCode": "FIRST20",
  "orderAmount": 500
}
```

### Admin Endpoints

#### Get Dashboard Stats
```http
GET /admin/dashboard
Authorization: Bearer <admin-token>
```

#### Get All Users
```http
GET /admin/users
Authorization: Bearer <admin-token>
```

#### Get Revenue Analytics
```http
GET /admin/analytics/revenue?period=month
Authorization: Bearer <admin-token>
```

## 🗄️ Database Schema

### User Schema
- Personal information (name, email, phone)
- Address details
- Authentication (password, role)
- Statistics (orders, spending, loyalty points)

### Service Schema
- Service details (name, description, pricing)
- Features and process information
- Category and popularity metrics

### Order Schema
- Customer information
- Order items and pricing
- Scheduling and delivery options
- Payment and status tracking

### Pickup Schema
- Customer and address information
- Date and time slot details
- Status and assignment tracking

## 🔒 Security Features

- **JWT Authentication**: Secure token-based authentication
- **Password Hashing**: bcrypt for password security
- **Rate Limiting**: Prevent API abuse
- **Input Validation**: Comprehensive request validation
- **CORS Protection**: Cross-origin request security
- **Helmet**: Security headers
- **Error Handling**: Secure error responses

## 🧪 Testing

```bash
npm test
```

## 📦 Deployment

### Environment Variables for Production
```env
NODE_ENV=production
PORT=8000
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/cleanmate
JWT_SECRET=your_production_jwt_secret
FRONTEND_URL=https://your-frontend-domain.com
```

### Docker Deployment
```dockerfile
FROM node:16-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 8000
CMD ["npm", "start"]
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For support, email support@cleanmate.in or create an issue in the repository.

## 🔄 API Status Codes

- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `500` - Internal Server Error

## 📊 Default Admin Credentials

After running the seed script:
- **Email**: admin@cleanmate.in
- **Password**: admin123

## 📱 Demo User Credentials

- **Email**: john.doe@example.com
- **Password**: password123

