const mongoose = require('mongoose');

const returnSchema = new mongoose.Schema({
  orderId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'orders'
  },
//   orderItemId: {
//     type: mongoose.Schema.Types.ObjectId,
//     required: true
//   },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'users'
  },
  productId: [{
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'products'
  }],
  reason: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['pending','accept', 'reject'],
    default: 'pending'
  }
//   ,
//   refundId: {
//     type: mongoose.Schema.Types.ObjectId,
//     ref: 'Refund' 
//   }
}, {
  timestamps: true 
});

module.exports = mongoose.model('returns', returnSchema);
