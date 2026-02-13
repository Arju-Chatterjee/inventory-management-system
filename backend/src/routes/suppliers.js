const express = require('express');
const router = express.Router();
const {
  getSuppliers,
  createSupplier,
  updateSupplier,
  deleteSupplier
} = require('../controllers/supplierController');
const auth = require('../middleware/auth');
const roleCheck = require('../middleware/roleCheck');

// All routes require authentication
router.use(auth);

router.get('/', getSuppliers);
router.post('/', roleCheck('admin', 'manager'), createSupplier);
router.put('/:id', roleCheck('admin', 'manager'), updateSupplier);
router.delete('/:id', roleCheck('admin'), deleteSupplier);

module.exports = router;
