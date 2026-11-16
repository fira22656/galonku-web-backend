import { Router } from 'express';
import { getAllProducts } from '../services/productService.js';

const router = Router();

router.get('/', async (req, res) => {
  try {
    const products = await getAllProducts();
    res.json({ success: true, data: products });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Gagal mengambil data produk' });
  }
});

export default router;