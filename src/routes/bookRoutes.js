const express = require('express');
const router = express.Router();
const bookController = require('../controllers/bookController');

//create book
router.post('/', bookController.createBook);

//get all books
router.get('/', bookController.getAllBooks);

//get books by id
router.get('/:id', bookController.getBookById);

//update book
router.put('/:id', bookController.updateBook);

//delete book by id
router.delete('/:id', bookController.deleteBook);

module.exports = router;