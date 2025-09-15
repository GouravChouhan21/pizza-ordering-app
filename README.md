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
- **Payment Integration**: Razorpay integration (test mode) for secure payments
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
RAZORPAY_KEY_ID=your_test_key_id
RAZORPAY_KEY_SECRET=your_test_key_secret
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

## Default Admin Account

After seeding the database, you can use the following admin account:
- **Email**: admin@pizzaapp.com
- **Password**: admin123

## Features Implementation

### 1. Authentication System
- Complete registration with email verification
- JWT-based authentication
- Password reset functionality
- Role-based access control (user/admin)

### 2. Pizza Builder
- Step-by-step pizza customization
- Real-time price calculation
- Stock validation
- Order summary and confirmation

### 3. Payment Integration
- Razorpay test mode integration
- Payment verification
- Order confirmation after successful payment

### 4. Admin Panel
- Comprehensive dashboard with statistics
- Order management with status updates
- Inventory management with stock tracking
- User management
- Low stock email notifications

### 5. Real-time Updates
- Socket.io integration for live updates
- Order status notifications
- Real-time inventory updates

### 6. Email Notifications
- Email verification for new users
- Password reset emails
- Low stock alerts for admins
- Order confirmation emails

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

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

This project is licensed under the MIT License.

## Support

For support, email support@example.com or create an issue in the repository.
 
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
   - PORT
   - MONGODB_URI
   - JWT_SECRET
   - EMAIL_USER, EMAIL_PASS
   - PAYMENTS_DISABLED (true to auto-confirm without gateway)
   - RAZORPAY_TEST_MODE, RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET (if enabling payments)
4. Point frontend to backend API. Locally we use `axios.defaults.baseURL = 'http://localhost:5000'`. In production, set the correct base URL.

### Git hygiene
- Ensure `.env`, `config.env`, and other secrets are gitignored (see `client/.gitignore`).
- Create a `config.example.env` file showing required keys without real values for collaborators.
