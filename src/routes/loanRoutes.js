const express = require('express');
const router = express.Router();
const loanController = require('../controllers/loanController');
const { authenticateToken, isAdmin } = require('../middleware/authMiddleware');

// Admin-only routes
router.get('/', authenticateToken, isAdmin, loanController.getAllLoans);
router.get('/active', authenticateToken, isAdmin, loanController.getActiveLoans);

// Authenticated user routes
router.get('/user/:user_id', authenticateToken, loanController.getLoansByUser);
router.post('/borrow', authenticateToken, loanController.borrowBook);
router.put('/return/:id', authenticateToken, loanController.returnBook);

module.exports = router;