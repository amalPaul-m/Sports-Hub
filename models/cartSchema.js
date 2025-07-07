const mongoose = require('mongoose');

const cartSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'userSchema',   
    required: true
  },
  items: [
    {
      productId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'ProductsSchema', 
        required: true
      },
      quantity: {
        type: Number,
        required: true,
        min: 1
      },
      price: {
        type: Number,
        required: true
      },
      color: {
        type: String,
        required: false
      },
      size: {
        type: String,
        required: false
      }
    }
  ]
}, {
  timestamps: true  
});

module.exports = mongoose.model('cart', cartSchema);
