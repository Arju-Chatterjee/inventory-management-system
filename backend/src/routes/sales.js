const express = require('express');
const router = express.Router();

const {
  getSales,
  createSale,
  updateSale,
  deleteSale
} = require('../controllers/saleController');

const auth = require('../middleware/auth');
const roleCheck = require('../middleware/roleCheck');

// All routes require authentication
router.use(auth);

// Routes
router.get('/', getSales);
router.post('/', createSale);
router.put('/:id', updateSale);
router.delete('/:id', roleCheck('admin'), deleteSale);

module.exports = router;
