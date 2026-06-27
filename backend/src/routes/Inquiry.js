const express = require('express');
const router = express.Router();
const Inquiry = require('../models/Inquiry');

// POST /api/inquiry — public: submit a contact inquiry
router.post('/', async (req, res) => {
  const { name, email, phone, interest, message } = req.body;

  if (!name || !email || !message) {
    return res.status(400).json({ error: 'Name, email, and message are required.' });
  }

  try {
    const inquiry = new Inquiry({ name, email, phone, interest, message });
    await inquiry.save();
    res.status(201).json({ success: true, message: 'Inquiry received successfully!' });
  } catch (err) {
    res.status(500).json({ error: 'Server error. Please try again.' });
  }
});

module.exports = router;