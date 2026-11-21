import { Router } from 'express';
import { getAllProducts, createProduct, updateProduct } from '../services/productService.js';

const router = Router();

router.get('/', async (req, res) => {
  try {
    const products = await getAllProducts();
    res.json({ success: true, data: products });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Gagal mengambil data produk' });
  }
});

router.post('/', async (req, res) => {
  try {
    const newProduct = await createProduct(req.body);
    res.status(201).json({ success: true, data: newProduct });
  } catch (error) {
    console.error('Error tambah produk:', error);
    res.status(500).json({ success: false, message: 'Gagal menambahkan produk baru' });
  }
});

router.patch('/:id', async (req, res) => {
  try {
    const updated = await updateProduct(Number(req.params.id), req.body);
    res.json({ success: true, data: updated });
  } catch (error) {
    console.error('Error update produk:', error);
    res.status(500).json({ success: false, message: 'Gagal memperbarui produk' });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const updated = await updateProduct(Number(req.params.id), req.body);
    res.json({ success: true, data: updated });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Gagal memperbarui produk' });
  }
});

export default router;