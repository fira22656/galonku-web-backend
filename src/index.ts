import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';

import authRoutes from './routes/authRoutes.js';
import productRoutes from './routes/productRoutes.js';
import orderRoutes from './routes/orderRoutes.js';
import aiRoutes from './routes/aiRoutes.js';
import reportRoutes from './routes/reportRoutes.js';

dotenv.config();

const app = express();

// 1. Middleware dasar
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 2. Buka akses folder uploads agar foto produk bisa tampil di frontend
app.use('/uploads', express.static(path.resolve('uploads')));

// 3. Daftarkan semua endpoint API
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/reports', reportRoutes);

// 4. Endpoint cek status server
app.get('/', (_req, res) => {
  res.json({ success: true, message: 'Server Backend GalonKu aktif!' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server berjalan di http://localhost:${PORT}`);
});