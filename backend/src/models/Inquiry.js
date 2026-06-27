const mongoose = require('mongoose');

const InquirySchema = new mongoose.Schema({
  name:     { type: String, required: true, trim: true },
  email:    { type: String, required: true, trim: true, lowercase: true },
  phone:    { type: String, trim: true, default: '' },
  interest: { type: String, enum: ['wholesale', 'custom', 'retail', 'other'], default: 'other' },
  message:  { type: String, required: true, trim: true },
  isRead:   { type: Boolean, default: false },
}, { timestamps: true });

module.exports = mongoose.model('Inquiry', InquirySchema);