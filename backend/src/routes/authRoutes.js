const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const auth = require('../middleware/auth');
const requireAdmin = require('../middleware/requireAdmin');

router.post('/register', authController.register);
router.post('/login', authController.login);
router.get('/me', auth, authController.getMe);

// Admin-only user management
router.post('/invite', auth, requireAdmin, authController.inviteUser);
router.get('/users', auth, requireAdmin, authController.listUsers);

module.exports = router;
