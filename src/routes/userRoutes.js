const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { authenticateToken, isAdmin } = require('../middleware/authMiddleware');

// Public routes
router.post('/login', userController.login);
router.post('/', userController.createUser);  

// Admin-only routes
router.get('/', authenticateToken, isAdmin, userController.getAllUsers);
router.delete('/:id', authenticateToken, isAdmin, userController.deleteUser);

// Authenticated routes (logged in users)
router.get('/:id', authenticateToken, userController.getUserById);
router.put('/:id', authenticateToken, userController.updateUser);

module.exports = router;