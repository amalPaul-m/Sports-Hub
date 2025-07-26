const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'users' 
    },

  productId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'products' 
    },
    
  rating: Number,
  comment: String,
  imageUrl: [String]
}, {
  timestamps: true 
});

module.exports = mongoose.model('reviews', reviewSchema);
