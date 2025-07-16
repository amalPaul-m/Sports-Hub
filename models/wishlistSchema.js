const mongoose = require('mongoose');

const wishlistSchema = new mongoose.Schema({
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'users', 
    required: true 
},
  productId: [
    { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'products',
    default: []
    }
], 
}, {
  timestamps: true
});

module.exports = mongoose.model('wishlist', wishlistSchema);
