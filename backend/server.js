require('dotenv').config();
const express = require('express');
const path = require('path');
const cors = require('cors');
const fs = require('fs');

const connectDB = require('./src/config/db');
const Admin = require('./src/models/Admin');

const adminRoutes = require('./src/routes/admin');
const inquiryRoutes = require('./src/routes/Inquiry'); // ✦ FIX: was './src/routes/inquiry' (lowercase) — crashes on Linux
const productRoutes = require('./src/routes/productRoutes');

const app = express();
const PORT = process.env.PORT || 3000;

// Connect to MongoDB
connectDB();

// Middleware
app.use(cors({
  origin: [
    'http://localhost:4200',
    'https://roshni-creation-theta.vercel.app'
  ]
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Create uploads folders if missing
const uploadsDir = path.join(__dirname, 'uploads');
const uploadsProductsDir = path.join(__dirname, 'uploads/products');
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir);
if (!fs.existsSync(uploadsProductsDir)) fs.mkdirSync(uploadsProductsDir, { recursive: true });

// Serve uploaded images
app.use('/uploads', express.static(uploadsDir));

// API Routes
app.use('/api/admin', adminRoutes);
app.use('/api/inquiries', inquiryRoutes);
app.use('/api/products', productRoutes);

// Seed admin account
async function seedAdmin() {
  try {
    const exists = await Admin.findOne({ username: process.env.ADMIN_USERNAME });
    if (!exists) {
      await Admin.create({
        username: process.env.ADMIN_USERNAME,
        password: process.env.ADMIN_PASSWORD,
      });
      console.log('✦ Admin account created');
    }
  } catch (err) {
    console.error(err);
  }
}

seedAdmin();

app.listen(PORT, () => {
  console.log(`✦ Roshni Creation API running at http://localhost:${PORT}`);
});
