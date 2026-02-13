const express = require('express');
const router = express.Router();
const {
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory
} = require('../controllers/categoryController');
const auth = require('../middleware/auth');
const roleCheck = require('../middleware/roleCheck');

// All routes require authentication
router.use(auth);

router.get('/', getCategories);
router.post('/', roleCheck('admin', 'manager'), createCategory);
router.put('/:id', roleCheck('admin', 'manager'), updateCategory);
router.delete('/:id', roleCheck('admin'), deleteCategory);

module.exports = router;
