const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  book_id: {
    type: Number,        // JavaScript type, not SQL INT
    required: true       // Validation
  },
  user_id: {
    type: Number,
    required: true
  },
  rating: {
    type: Number,
    required: true,
    min: 1,              // Minimum value
    max: 5               // Maximum value
  },
  review_text: {
    type: String,        // Not VARCHAR
    required: true,
    maxlength: 500       // Optional: limit length
  }
}, {
  timestamps: true       // Automatically adds createdAt and updatedAt!
});

module.exports = mongoose.model('Review', reviewSchema);