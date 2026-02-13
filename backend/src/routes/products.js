const express = require('express');
const router = express.Router();
const {
  getProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct
} = require('../controllers/productController');
const auth = require('../middleware/auth');
const roleCheck = require('../middleware/roleCheck');

// All routes require authentication
router.use(auth);

router.get('/', getProducts);
router.get('/:id', getProduct);
router.post('/', roleCheck('admin', 'manager'), createProduct);
router.put('/:id', roleCheck('admin', 'manager'), updateProduct);
router.delete('/:id', roleCheck('admin'), deleteProduct);

module.exports = router;
