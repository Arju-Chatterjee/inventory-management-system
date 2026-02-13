# Retail Inventory Management System

A full-stack inventory management system built with the MERN stack (MongoDB, Express, React, Node.js) for retail businesses to manage products, track sales, monitor stock levels, and generate reports.

## Features

- **Product Management**: Full CRUD operations with categories and suppliers
- **Sales Recording**: Transaction recording with automatic stock updates
- **Low Stock Alerts**: Real-time monitoring of products below minimum levels
- **Dashboard**: Key metrics and analytics
- **Reports**: Sales and inventory reports with CSV export
- **User Management**: Role-based access control (Admin, Manager, Staff)
- **Authentication**: Secure JWT-based authentication

## Tech Stack

**Backend:** Node.js, Express.js, MongoDB, Mongoose, JWT, bcrypt
**Frontend:** React 18, React Router v6, Tailwind CSS, Axios, Vite

## Quick Start

### Prerequisites
- Node.js v16+
- MongoDB v5+
- npm or yarn

### Installation

```bash
# 1. Clone and navigate
git clone <repository-url>
cd inventory-management-system

# 2. Setup Backend
cd backend
npm install
cp .env.example .env
# Edit .env with your MongoDB URI

# 3. Setup Frontend
cd ../frontend
npm install
```

### Running the Application

```bash
# Terminal 1 - Start MongoDB (if local)
mongod

# Terminal 2 - Start Backend (from backend/)
npm run dev
# Runs on http://localhost:5000

# Terminal 3 - Start Frontend (from frontend/)
npm run dev
# Runs on http://localhost:3000
```

## Initial Setup

Create an admin user in MongoDB:

```javascript
// Connect to MongoDB
use inventory_management

// Insert admin user (password must be hashed with bcrypt)
db.users.insertOne({
  username: "admin",
  email: "admin@example.com",
  password: "$2b$10$..." // Hash "password" with bcrypt
  role: "admin",
  firstName: "Admin",
  lastName: "User",
  createdAt: new Date(),
  updatedAt: new Date()
})
```

Default test credentials:
- Email: `admin@example.com`
- Password: `password`

## Project Structure

```
├── backend/                # Express API server
│   ├── src/
│   │   ├── config/        # Database configuration
│   │   ├── controllers/   # Route controllers
│   │   ├── middleware/    # Auth & error handling
│   │   ├── models/        # Mongoose models
│   │   ├── routes/        # API routes
│   │   ├── app.js         # Express app
│   │   └── server.js      # Entry point
│   └── package.json
│
└── frontend/              # React application
    ├── src/
    │   ├── components/    # UI components
    │   ├── context/       # React Context
    │   ├── pages/         # Page components
    │   ├── services/      # API services
    │   ├── App.jsx
    │   └── index.jsx
    └── package.json
```

## API Endpoints

### Authentication
- `POST /api/auth/login` - Login
- `POST /api/auth/register` - Register (Admin only)
- `GET /api/auth/me` - Get current user

### Products
- `GET /api/products` - List products (with filters)
- `POST /api/products` - Create product
- `PUT /api/products/:id` - Update product
- `DELETE /api/products/:id` - Delete product

### Sales
- `GET /api/sales` - List sales
- `POST /api/sales` - Record sale
- `DELETE /api/sales/:id` - Void sale (Admin)

### Reports
- `GET /api/reports/dashboard` - Dashboard stats
- `GET /api/reports/sales` - Sales report
- `GET /api/reports/inventory` - Inventory report

See `planning.md` for complete API documentation.

## User Roles

- **Admin**: Full system access
- **Manager**: Manage products, categories, suppliers, view reports
- **Staff**: View products, record sales

## Environment Variables

**Backend (.env)**
```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/inventory_management
JWT_SECRET=your_secret_key_here
JWT_EXPIRES_IN=24h
NODE_ENV=development
```

**Frontend (.env)**
```
VITE_API_URL=http://localhost:5000/api
```

## Development

```bash
# Backend with auto-reload
cd backend && npm run dev

# Frontend with HMR
cd frontend && npm run dev
```

## Production Build

```bash
# Frontend
cd frontend
npm run build
npm run preview

# Backend
cd backend
NODE_ENV=production npm start
```

## Features to Extend

The current implementation includes:
- ✅ Complete backend API with all endpoints
- ✅ Authentication and authorization
- ✅ Database models and validation
- ✅ Login page and dashboard
- ✅ Basic product listing
- ⚠️ Placeholder pages for Sales, Categories, Suppliers, Users, Reports

To complete the frontend, implement:
1. Product form modal with validation
2. Sales form for recording transactions
3. Category/Supplier management with inline editing
4. User management for admins
5. Enhanced reports with charts (using Recharts)
6. CSV export functionality

## Common Issues

**MongoDB Connection Error**: Ensure MongoDB is running and URI is correct in .env

**CORS Errors**: Backend has CORS enabled; check proxy in vite.config.js

**Auth Issues**: Clear localStorage and verify JWT_SECRET consistency

## License

ISC License
