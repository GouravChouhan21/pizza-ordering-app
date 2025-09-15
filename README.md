# Pizza Ordering App

A full-stack pizza ordering application built with React, Node.js, Express, and MongoDB. This app allows users to build custom pizzas, place orders, and provides admin functionality for order and inventory management.

## Features

### User Features
- **User Registration & Authentication**: Complete registration with email verification and forgot password functionality
- **Custom Pizza Builder**: Interactive pizza builder with step-by-step selection of:
  - Pizza bases (5 options)
  - Sauces (5 options)
  - Cheese types
  - Vegetables (multiple options)
  - Meats (optional)
- **Order Management**: View order history and track order status in real-time
- **Payment Integration**: 
  - Secure Razorpay integration
  - Test mode support with mock transactions
  - Real-time payment status updates
  - Robust error handling
  - Configurable payment settings
- **Real-time Updates**: Live order status updates using Socket.io

### Admin Features
- **Admin Dashboard**: Overview of orders, revenue, and inventory status
- **Order Management**: Update order status (pending → confirmed → in kitchen → out for delivery → delivered)
- **Inventory Management**: Manage pizza components (bases, sauces, cheeses, vegetables, meats)
- **User Management**: View and manage user accounts
- **Low Stock Alerts**: Automated email notifications when inventory falls below threshold
- **Real-time Notifications**: Live updates for order status changes

## Technology Stack

### Backend
- **Node.js** with Express.js
- **MongoDB** with Mongoose ODM
- **JWT** for authentication
- **Socket.io** for real-time communication
- **Nodemailer** for email notifications
- **Node-cron** for scheduled tasks
- **Razorpay** for payment processing

### Frontend
- **React** with functional components and hooks
- **Material-UI** for modern UI components
- **React Router** for navigation
- **Axios** for API calls
- **Socket.io-client** for real-time updates

## Prerequisites

- Node.js (v14 or higher)
- MongoDB Atlas account or local MongoDB installation
- Gmail account for email notifications
- Razorpay account for payment processing (or use test mode)

## Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/GouravChouhan21/pizza-ordering-app.git
   cd pizza-ordering-app
   ```

2. Install dependencies for both backend and frontend:
   ```bash
   npm install
   cd client && npm install
   ```

3. Create environment files:
   - Copy `.env.example` to `.env`
   - Set up your environment variables
   ```bash
   cp .env.example .env
   ```

4. Configure Razorpay (choose one):
   - For test mode: Set `RAZORPAY_TEST_MODE=true` in `.env`
   - For production: Add your Razorpay API keys in `.env`

## Installation & Setup

### 1. Clone the Repository
```bash
git clone <repository-url>
cd pizza-ordering-app
```

### 2. Install Backend Dependencies
```bash
npm install
```

### 3. Install Frontend Dependencies
```bash
cd client
npm install
cd ..
```

### 4. Environment Configuration
Create a `config.env` file in the root directory with the following variables (use your own secrets):

```env
NODE_ENV=development
PORT=5000
MONGODB_URI=your_mongodb_uri
JWT_SECRET=your_long_random_secret
EMAIL_USER=your_gmail@example.com
EMAIL_PASS=your_app_password
RAZORPAY_TEST_MODE=true
RAZORPAY_KEY_ID=your_test_key_id
RAZORPAY_KEY_SECRET=your_test_key_secret
PAYMENTS_DISABLED=false
ADMIN_EMAIL=your_admin_email@example.com
```

### 5. Seed the Database
```bash
node scripts/seedData.js
```

### 6. Start the Application

#### Development Mode
```bash
# Start backend server
npm run dev

# In a new terminal, start frontend
npm run client
```

#### Production Mode
```bash
# Build frontend
npm run build

# Start production server
npm start
```

## Payments (Razorpay Test Mode)

1. Set these environment variables in `config.env`:
   - `PAYMENTS_DISABLED=false`
   - `RAZORPAY_TEST_MODE=true`
   - `RAZORPAY_KEY_ID` and `RAZORPAY_KEY_SECRET` (from Razorpay dashboard test mode)
2. Restart the backend so changes apply.
3. On placing an order, Razorpay test checkout opens. Use Razorpay’s test cards to complete payment.
4. On success, the backend verifies the signature and confirms the order, updates stock, and notifies the user in real-time.

## API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/verify-email/:token` - Email verification
- `POST /api/auth/forgot-password` - Forgot password
- `POST /api/auth/reset-password/:token` - Reset password
- `GET /api/auth/me` - Get current user

### Pizza Components
- `GET /api/pizza/varieties` - Get all pizza varieties
- `GET /api/pizza/bases` - Get pizza bases
- `GET /api/pizza/sauces` - Get sauces
- `GET /api/pizza/cheeses` - Get cheeses
- `GET /api/pizza/veggies` - Get vegetables
- `GET /api/pizza/meats` - Get meats
- `POST /api/pizza/calculate-price` - Calculate pizza price

### Orders
- `GET /api/orders/config` - Payment config (exposes if payments enabled and keyId)
- `POST /api/orders/create-order` - Create new order
- `POST /api/orders/verify-payment` - Verify payment
- `GET /api/orders/my-orders` - Get user orders
- `GET /api/orders/:id` - Get specific order
- `POST /api/orders/cancel/:id` - Cancel order

### Admin
- `GET /api/admin/dashboard` - Admin dashboard data
- `GET /api/admin/orders` - Get all orders
- `PUT /api/admin/orders/:id/status` - Update order status
- `GET /api/admin/users` - Get all users
- `PUT /api/admin/users/:id/status` - Update user status
- `POST /api/admin/create-admin` - Create admin user

### Inventory
- `GET /api/inventory` - Get inventory items
- `POST /api/inventory` - Add inventory item
- `PUT /api/inventory/:id` - Update inventory item
- `DELETE /api/inventory/:id` - Delete inventory item
- `PUT /api/inventory/:id/stock` - Update stock
- `GET /api/inventory/low-stock` - Get low stock items
- `POST /api/inventory/check-low-stock` - Check and send low stock notifications

## Project Structure

```
pizza-ordering-app/
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/     # Reusable components
│   │   ├── contexts/       # React contexts
│   │   ├── pages/          # Page components
│   │   └── App.js         # Main app component
├── models/                 # MongoDB models
├── routes/                 # API routes
├── middleware/             # Custom middleware
├── scripts/                # Utility scripts
├── server.js              # Main server file
└── package.json           # Dependencies
```

## Deployment

This project can be deployed to any Node hosting platform (Render, Railway, etc.) with MongoDB Atlas.

1. Build the frontend
```bash
cd client
npm run build
```
2. Serve backend (Express) with a process manager or platform start command:
```bash
npm start
```
3. Configure environment variables on the platform (do not commit secrets):
   - PORT, MONGODB_URI, JWT_SECRET
   - EMAIL_USER, EMAIL_PASS
   - PAYMENTS_DISABLED (false to enable gateway)
   - RAZORPAY_TEST_MODE, RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET (if enabling payments)
4. Point frontend to backend API. Locally we use `axios.defaults.baseURL = 'http://localhost:5000'`. In production, set the correct base URL.

### Git hygiene
- Ensure `.env`, `config.env`, and other secrets are gitignored.
- Provide `config.example.env` for collaborators with placeholders only.
