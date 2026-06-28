const express = require('express');
const multer = require('multer');
const router = express.Router();
const Product = require('../models/Product');
const authMiddleware = require('../middleware/auth');
const { cloudinary, productStorage } = require('../config/cloudinary');

const upload = multer({ storage: productStorage });

// GET all active products (public)
router.get('/', async (req, res) => {
  try {
    const products = await Product.find({ isActive: true }).sort({ createdAt: -1 });
    res.json(products);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// GET all products (admin)
router.get('/admin', authMiddleware, async (req, res) => {
  try {
    const products = await Product.find().sort({ createdAt: -1 });
    res.json(products);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// POST add product (admin)
router.post('/', authMiddleware, upload.single('image'), async (req, res) => {
  try {
    const { title, description, category, tag, featured } = req.body;
    const image = req.file ? req.file.path : '';
    const product = await Product.create({
      title, description, category, tag,
      featured: featured === 'true',
      image,
      isActive: true,
    });
    res.status(201).json(product);
  } catch (err) {
    res.status(500).json({ error: 'Failed to add product' });
  }
});

// PUT update product (admin)
router.put('/:id', authMiddleware, upload.single('image'), async (req, res) => {
  try {
    const { title, description, category, tag, featured } = req.body;
    const update = { title, description, category, tag, featured: featured === 'true' };

    if (req.file) {
      // Delete old image from Cloudinary
      const existing = await Product.findById(req.params.id);
      if (existing && existing.image) {
        const parts = existing.image.split('/');
        const filename = parts[parts.length - 1];
        const publicId = `roshni-creation/products/${filename.split('.')[0]}`;
        await cloudinary.uploader.destroy(publicId);
      }
      update.image = req.file.path;
    }

    const product = await Product.findByIdAndUpdate(req.params.id, update, { new: true });
    res.json(product);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update product' });
  }
});

// DELETE product (admin)
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (product && product.image) {
      const parts = product.image.split('/');
      const filename = parts[parts.length - 1];
      const publicId = `roshni-creation/products/${filename.split('.')[0]}`;
      await cloudinary.uploader.destroy(publicId);
    }
    await Product.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete product' });
  }
});

module.exports = router;