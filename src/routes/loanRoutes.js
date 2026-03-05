const express = require('express');
const router = express.Router();
const loanController = require('../controllers/loanController');
//GET all loans (admin)
router.get('/', loanController.getAllLoans);

//GET active loans
router.get('/active', loanController.getActiveLoans);

//GET loans by ID
router.get('/:id', loanController.getLoansByUser);

//borrow a book
router.post('/borrow', loanController.borrowBook);

//return book
router.put('/return/:id', loanController.returnBook);
module.exports = router;