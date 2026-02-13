const express = require('express');
const router = express.Router();
const {
  getSales,
  getSale,
  createSale,
  deleteSale
} = require('../controllers/saleController');
const auth = require('../middleware/auth');
const roleCheck = require('../middleware/roleCheck');

// All routes require authentication
router.use(auth);

router.get('/', getSales);
router.get('/:id', getSale);
router.post('/', createSale);
router.delete('/:id', roleCheck('admin'), deleteSale);

module.exports = router;
