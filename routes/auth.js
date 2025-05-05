const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const auth = require('../middleware/auth');

// Register a new user
router.post('/register', authController.register);

// Login user
router.post('/login', authController.login);

// Google OAuth login
router.post('/google', authController.googleLogin);

// Get current user (protected route)
router.get('/me', auth, authController.getCurrentUser);

module.exports = router;