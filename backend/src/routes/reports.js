const express = require('express');
const router = express.Router();
const {
  getDashboard,
  getSalesReport,
  getInventoryReport
} = require('../controllers/reportController');
const auth = require('../middleware/auth');
const roleCheck = require('../middleware/roleCheck');

// All routes require authentication
router.use(auth);

// Dashboard accessible to all roles
router.get('/dashboard', getDashboard);

// Reports accessible to admin and manager only
router.get('/sales', roleCheck('admin', 'manager'), getSalesReport);
router.get('/inventory', roleCheck('admin', 'manager'), getInventoryReport);

module.exports = router;
