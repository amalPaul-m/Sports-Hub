const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

const ordersSchema = new mongoose.Schema({

  orderId: {
    type: String,
    required: true,
    unique: true
  },

  userId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'users'
  },

  deliveryStatus: {
    type: String,
    enum: ['pending', 'shipped', 'outofdelivery','delivered', 'cancelled'],
    default: 'pending'
  },

//   couponId: {
//     type: mongoose.Schema.Types.ObjectId,
//     ref: 'Coupon'
//   },

//   walletAmountUsed: {
//     type: Number,
//     default: 0
//   },

  productInfo: [
    {
      productId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'products'
      },
      quantity: {
        type: Number,
        required: true
      },
      status: {
        type: String,
        enum: ['confirmed', 'cancelled','returned'],
        default: 'confirmed'
      },
      price: {
        type: Number,
        required: true
      },
      color: String,
      size: String
    }
  ],

  addressId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'address'
  },

  paymentInfo: [
    {
      totalAmount: {
        type: Number,
        required: true
      },
      paymentMethod: {
        type: String,
        enum: ['COD', 'wallet','online'],
        required: true
      },
      paymentStatus: {
        type: String,
        enum: ['paid', 'unpaid'],
        required: true
      },
      transactionId: {
        type: String,
        default: null
      }
    }
  ]
//   ,

//   couponInfo: [
//     {
//       couponCode: String,
//       discount: Number
//     }
//   ]

}, { timestamps: true });

module.exports = mongoose.model('orders', ordersSchema);
