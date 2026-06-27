const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const Admin = require('../models/Admin');
const Inquiry = require('../models/Inquiry');
const authMiddleware = require('../middleware/auth');

// ── Multer image upload config ──────────────────────────────────
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, path.join(__dirname, '../../uploads')),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, 'product_' + Date.now() + ext);
  }
});
const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowed = ['.jpg', '.jpeg', '.png', '.webp', '.gif'];
    const ext = path.extname(file.originalname).toLowerCase();
    allowed.includes(ext) ? cb(null, true) : cb(new Error('Only images allowed'));
  }
});

// ── Auth Routes ─────────────────────────────────────────────────

// POST /api/admin/login
router.post('/login', async (req, res) => {
  const { username, password } = req.body;
  try {
    const admin = await Admin.findOne({ username });
    if (!admin || !(await admin.comparePassword(password))) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    const token = jwt.sign({ id: admin._id, username: admin.username }, process.env.JWT_SECRET, { expiresIn: '8h' });
    res.json({ success: true, token });
  } catch {
    res.status(500).json({ error: 'Server error' });
  }
});

// ── Inquiry Routes (protected) ──────────────────────────────────

// GET /api/admin/inquiries
router.get('/inquiries', authMiddleware, async (req, res) => {
  try {
    console.log('ADMIN AUTHENTICATED:', req.admin);

    const inquiries = await Inquiry.find().sort({
      createdAt: -1
    });

    console.log('INQUIRIES FOUND:', inquiries.length);

    res.json(inquiries);

  } catch (err) {

    console.error('INQUIRY ERROR:', err);

    res.status(500).json({
      error: err.message
    });
  }
});

// PATCH /api/admin/inquiries/:id/read — mark as read
router.patch('/inquiries/:id/read', authMiddleware, async (req, res) => {
  try {
    const inquiry = await Inquiry.findByIdAndUpdate(req.params.id, { isRead: true }, { new: true });
    if (!inquiry) return res.status(404).json({ error: 'Inquiry not found' });
    res.json(inquiry);
  } catch {
    res.status(500).json({ error: 'Server error' });
  }
});

// DELETE /api/admin/inquiries/:id
router.delete('/inquiries/:id', authMiddleware, async (req, res) => {
  try {
    const inquiry = await Inquiry.findByIdAndDelete(req.params.id);
    if (!inquiry) return res.status(404).json({ error: 'Inquiry not found' });
    res.json({ success: true });
  } catch {
    res.status(500).json({ error: 'Server error' });
  }
});

// ── Image Routes (protected) ────────────────────────────────────

// GET /api/admin/images
router.get('/images', authMiddleware, (req, res) => {
  const uploadsDir = path.join(__dirname, '../../uploads');
  const files = fs.readdirSync(uploadsDir)
    .filter(f => /\.(jpg|jpeg|png|webp|gif)$/i.test(f))
    .map(f => ({
      filename: f,
      url: `/uploads/${f}`,
      size: fs.statSync(path.join(uploadsDir, f)).size,
    }));
  res.json(files);
});

// POST /api/admin/upload
router.post('/upload', authMiddleware, upload.array('images', 10), (req, res) => {
  if (!req.files?.length) return res.status(400).json({ error: 'No files uploaded' });
  const uploaded = req.files.map(f => ({ filename: f.filename, url: `/uploads/${f.filename}`, size: f.size }));
  res.json({ success: true, files: uploaded });
});

// DELETE /api/admin/images/:filename
router.delete('/images/:filename', authMiddleware, (req, res) => {
  const filename = req.params.filename;
  if (filename.includes('..') || filename.includes('/')) {
    return res.status(400).json({ error: 'Invalid filename' });
  }
  const filepath = path.join(__dirname, '../../uploads', filename);
  if (!fs.existsSync(filepath)) return res.status(404).json({ error: 'Image not found' });
  fs.unlinkSync(filepath);
  res.json({ success: true });
});

module.exports = router;