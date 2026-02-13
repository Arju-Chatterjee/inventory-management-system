const express = require('express');
const router = express.Router();
const { register, login, getMe } = require('../controllers/authController');
const auth = require('../middleware/auth');
const roleCheck = require('../middleware/roleCheck');

// Public routes
router.post('/login', login);

// Protected routes
router.post('/register', auth, roleCheck('admin'), register);
router.get('/me', auth, getMe);

module.exports = router;
