const mongoose = require('mongoose');

const VariantSchema = new mongoose.Schema({
  size: {
    type: String,
    required: true
  },
  color: {
    type: String,
    required: true
  },
  stockQuantity: {
    type: Number,
    required: true,
    min: 0
  }
}, { _id: true });



const ProductsSchema = new mongoose.Schema({
  productName: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  category: {
    type: String,
    required: true
  },
  unitSize: {
    type: String
  },
  regularPrice: {
    type: Number,
    required: true,
    min: 0
  },
  salePrice: {
    type: Number,
    min: 0
  },
  ageRange: {
    type: String
  },
  material: {
    type: String
  },
  itemWeight: {
    type: Number,
    min: 0
  },
  warranty: {
    type: Number,
    min: 0
  },
  brandName: {
    type: String,
    trim: true
  },
  imageUrl: [{
    type: String
  }],
  isActive: {
    type: Boolean,
    default: true
  },
  variants: [VariantSchema]
}, {
  timestamps: true
});

module.exports = mongoose.model('products', ProductsSchema);
