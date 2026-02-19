const express = require('express');
const router = express.Router();
const reviewController = require('../controllers/reviewController');


// POST /reviews - Create a new review
router.post('/', reviewController.createReview);

//GET /reviews- Get all reviews for a specific book
router.get('/book/:book_id', reviewController.getReviewsByBook);

//GET /reviews -Get all reviews by a specific user
router.get ('/user/:user_id', reviewController.getReviewsByUser)
//PUT /Update reviews by a user
router.put('/:id', reviewController.updateReview)
//DELETE /delete reviews by a user
router.delete('/:id', reviewController.deleteReview)

module.exports = router;