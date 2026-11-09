import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import productRoutes from './routes/productRoutes';
import adminRoutes from './routes/adminRoutes';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Endpoint Utama API
app.use('/api/products', productRoutes);
app.use('/api/admin', adminRoutes);

// Endpoint Tes Koneksi Root
app.get('/', (req, res) => {
  res.json({ message: 'Backend GalonKu Berhasil Berjalan!' });
});

// Jalankan Server
app.listen(PORT, () => {
  console.log('=================================');
  console.log(`Server jalan di: http://localhost:${PORT}`);
  console.log('=================================');
});