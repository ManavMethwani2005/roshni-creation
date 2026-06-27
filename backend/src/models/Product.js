const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({

  title: {
    type: String,
    required: true,
    trim: true
  },

  description: {
    type: String,
    required: true,
    trim: true
  },

  category: {
    type: String,
    required: true,
    enum: ['palazzo', 'salwar', 'anarkali', 'lehenga', 'kurta']
  },

  tag: {
    type: String,
    default: 'New Arrival',
    trim: true
  },

  image: {
    type: String,
    default: ''
  },

  featured: {
    type: Boolean,
    default: false
  },

  isActive: {
    type: Boolean,
    default: true
  }

}, {
  timestamps: true
});

module.exports = mongoose.model('Product', productSchema);