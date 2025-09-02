const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

const ordersSchema = new mongoose.Schema({

  orderId: {
    type: String,
    required: false,
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

  orderStatus: {
    type: String,
    enum: ['confirmed','cancelled'],
    default: 'confirmed'
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
      cancelReason: String,
      price: {
        type: Number,
        required: true
      },
      regularPrice: {
        type: Number,
        required: true
      },
      color: String,
      size: String
    }
  ],

  addressId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'addresses'
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
  ],
  couponInfo: [{

      couponCode: {
        type: String,
        default: null
      },
      discount: {
        type: Number,
        default: 0
      },
    discountAmount: {
        type: Number,
        default: 0
    },
    discountPercentage: {
        type: Number,
        default: null
    }
  }]

}, { timestamps: true });

module.exports = mongoose.model('orders', ordersSchema);
