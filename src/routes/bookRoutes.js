const express = require('express');
const router = express.Router();
const bookController = require('../controllers/bookController');
const { authenticateToken, isAdmin } = require('../middleware/authMiddleware');

// Public routes (anyone can view books)
router.get('/', bookController.getAllBooks);
router.get('/search', bookController.searchBooks);
router.get('/:id/reviews', bookController.getBookWithReviews);  // ← BEFORE /:id
router.get('/:id', bookController.getBookById);                 // ← AFTER

// Admin-only routes (protected)
router.post('/', authenticateToken, isAdmin, bookController.createBook);
router.put('/:id', authenticateToken, isAdmin, bookController.updateBook);
router.delete('/:id', authenticateToken, isAdmin, bookController.deleteBook);

module.exports = router;