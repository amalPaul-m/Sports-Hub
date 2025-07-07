const mongoose = require('mongoose');

const addressSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'userSchema', 
    required: true
  },
  fullName: {
    type: String,
    required: true,
    trim: true
  },
  mobileNumber: {
    type: String,
    required: true,
    match: /^[0-9]{10}$/
  },
  pinCode: {
    type: String,
    required: true,
    match: /^[0-9]{6}$/
  },
  street: {
    type: String,
    required: true
  },
  houseNo: {
    type: String,
    required: true
  },
  district: {
    type: String,
    required: true
  },
  state: {
    type: String,
    required: true
  },
  landMark: {
    type: String,
    required: true
  },
  alternate_number: {
    type: String,
    match: /^[0-9]{10}$/,
    default: null
  },
  addressType: {
    type: String,
    enum: ['Home', 'Work'],
    required: true
  }
}, {
  timestamps: true  
});

module.exports = mongoose.model('address', addressSchema);
