const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const Product = require('../models/Product');
const authMiddleware = require('../middleware/auth');

// ── Ensure uploads/products folder exists ────────────────────────
const uploadsDir = path.join(__dirname, '../../uploads/products');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// ── Multer config ────────────────────────────────────────────────
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadsDir),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, Date.now() + ext);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowed = ['.jpg', '.jpeg', '.png', '.webp', '.gif'];
    const ext = path.extname(file.originalname).toLowerCase();
    allowed.includes(ext) ? cb(null, true) : cb(new Error('Only image files allowed'));
  }
});

// ── GET /api/products — public, returns all active products
router.get('/', async (req, res) => {
  try {
    const products = await Product.find().sort({ createdAt: -1 });
    res.json(products);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── GET /api/products/admin — PROTECTED, returns ALL products for admin
router.get('/admin', authMiddleware, async (req, res) => {
  try {
    const products = await Product.find().sort({ createdAt: -1 });
    console.log('Admin products fetched:', products.length);
    res.json(products);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── POST /api/products — add new product (protected)
router.post('/', authMiddleware, upload.single('image'), async (req, res) => {
  try {
    const { title, description, category, tag, featured } = req.body;
    if (!title || !description || !category) {
      return res.status(400).json({ error: 'Title, description and category are required' });
    }
    const product = await Product.create({
      title: title.trim(),
      description: description.trim(),
      category,
      tag: tag?.trim() || 'New Arrival',
      featured: featured === 'true',
      image: req.file ? req.file.filename : '',
      isActive: true
    });
    res.status(201).json(product);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── PUT /api/products/:id — edit product (protected)
router.put('/:id', authMiddleware, upload.single('image'), async (req, res) => {
  try {
    const existing = await Product.findById(req.params.id);
    if (!existing) return res.status(404).json({ error: 'Product not found' });

    const updateData = {
      title: req.body.title?.trim() || existing.title,
      description: req.body.description?.trim() || existing.description,
      category: req.body.category || existing.category,
      tag: req.body.tag?.trim() || existing.tag,
      featured: req.body.featured !== undefined ? req.body.featured === 'true' : existing.featured,
      isActive: req.body.isActive !== undefined ? req.body.isActive === 'true' : existing.isActive,
    };

    if (req.file) {
      if (existing.image) {
        const oldPath = path.join(uploadsDir, existing.image);
        if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
      }
      updateData.image = req.file.filename;
    }

    const product = await Product.findByIdAndUpdate(req.params.id, updateData, { new: true });
    res.json(product);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── DELETE /api/products/:id (protected)
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ error: 'Product not found' });

    if (product.image) {
      const imgPath = path.join(uploadsDir, product.image);
      if (fs.existsSync(imgPath)) fs.unlinkSync(imgPath);
    }

    await Product.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;