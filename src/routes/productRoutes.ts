import { Router } from 'express';
import db from '../config/db.js';

const router = Router();

// GET: Ambil semua produk galon
router.get('/', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM products');
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: 'Gagal mengambil data produk' });
  }
});

// POST: Tambah produk galon baru
router.post('/', async (req, res) => {
  const { namaProduk, harga, stok, deskripsi } = req.body;
  try {
    const [result]: any = await db.query(
      'INSERT INTO products (namaProduk, harga, stok, deskripsi) VALUES (?, ?, ?, ?)',
      [namaProduk, harga, stok, deskripsi]
    );
    res.status(201).json({ id: result.insertId, namaProduk, harga, stok, deskripsi });
  } catch (error) {
    res.status(500).json({ error: 'Gagal menambahkan produk' });
  }
});

export default router;