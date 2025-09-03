const mongoose = require('mongoose');

const stockHoldSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'users',   
    required: true
  },
  items: [
    {
      productId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'products', 
        required: true
      },
      quantity: {
        type: Number,
        required: true,
        min: 1
      },
      color: {
        type: String,
        required: true
      },
      size: {
        type: String,
        required: true
      }
    }
  ]
}, {
  timestamps: true  
});

module.exports = mongoose.model('stockHold', stockHoldSchema);
