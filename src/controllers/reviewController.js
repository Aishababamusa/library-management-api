const Reviews = require('../models/Reviews');
const Review = require('../models/Reviews')
//create a new review
exports.createReview = async (req, res) => {
try {
    // 1. Get data from request body
    const { book_id, user_id, rating, review_text } = req.body;
    
    // 2. Create new review instance
    const newReview = new Review({
      book_id,
      user_id, 
      rating,
      review_text
    });
    
    // 3. Save to MongoDB (what goes here?)
    
    const savedReview = await newReview.save();
    res.status(201).json({ 
    message: "Review created successfully", 
    review: savedReview 
});
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
// Get all reviews for a specific book
exports.getReviewsByBook = async (req, res) => {
  try {
    // 1. Get book_id from URL parameter
    const {book_id} = req.params;
    // 2. Find all reviews for this book
    const reviews = await Review.find({ book_id });
    // 3. Send response
    if(reviews.length === 0 ){
      return res.status(404).json({
        success: false,
        message: `No reviews found for book with ID ${book_id}`

      })
    } return res.status(200).json({
      success: true,
      message: reviews
    })
    
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
    //Get all reviews by a specific user
exports.getReviewsByUser = async (req, res) => {
  try {
    //1. Get user_id form the request parameter
    const {user_id} = req.params;
    //2.Find all reviews by this user
    const userReviews = await Review.find({user_id});
    if(userReviews.length === 0){
      return res.status(404).json({
        success: false,
        message: `The user with this ${user_id} has no review yet`
      })
    } return res.status(200).json({
      success: true,
      message: userReviews
    })
    
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
exports.updateReview = async (req, res) => {
  try {
    // 1. Get review id from URL parameter
    const {id} = req.params;
    
    // 2. Get updated data from request body
    const updateData = req.body;
    
    // 3. Find and update the review
    // Hint: Review.findByIdAndUpdate(id, updateData, { new: true })
    // { new: true } returns the UPDATED document, not the old one
    const updatedReview = await Review.findByIdAndUpdate(id, updateData, { new: true });
    
    // 4. Check if review exists
    if(!updatedReview){
      return res.status(404).json({
        success: false,
        message: `Review with ID ${id} not found`
      })
    } return res.status(409).json({
      success: true,
      message: "Review updated successfully",
      review: updatedReview
    })
    
    // 5. Send response
    
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
exports.deleteReview = async (req, res) => {
  try {
    // 1. Get id from params
    const {id} = req.params;
    
    // 2. Find and delete
    const deletedReview = await Reviews.findByIdAndDelete(id);

    
    // 3. Check if review existed
    if(!deletedReview){
      // 4. Send response
      return res.status(404).json({
        success: false,
        message: `The review with this ${id} is not found`
      })
    } return res.status(200).json({
      success: true,
      message: "review deleted successfully",
      review: deletedReview
    })
    
    
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


    