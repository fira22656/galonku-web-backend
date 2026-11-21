import { Router, Request, Response } from 'express';
import { db } from '../config/db.js';

const router = Router();

// GET semua produk
router.get('/', async (_req: Request, res: Response) => {
  try {
    const [rows] = await db.query('SELECT * FROM product ORDER BY id DESC');
    res.json({ status: 'success', data: rows });
  } catch (error) {
    console.error('Error get products:', error);
    res.status(500).json({ status: 'error', message: 'Gagal mengambil data produk' });
  }
});

// GET detail 1 produk
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const [rows]: any = await db.query('SELECT * FROM product WHERE id = ?', [req.params.id]);
    if (!rows.length) {
      return res.status(404).json({ status: 'error', message: 'Produk tidak ditemukan' });
    }
    res.json({ status: 'success', data: rows[0] });
  } catch (error) {
    console.error('Error get product by id:', error);
    res.status(500).json({ status: 'error', message: 'Gagal mengambil detail produk' });
  }
});

// POST tambah produk baru
router.post('/', async (req: Request, res: Response) => {
  try {
    const { name, description, price, stock, image_url, imageUrl } = req.body;
    const finalImage = image_url || imageUrl || '/products/aqua-19l.png';

    const [result]: any = await db.query(
      'INSERT INTO product (name, description, price, stock, image_url) VALUES (?, ?, ?, ?, ?)',
      [name, description || '', price || 0, stock || 0, finalImage]
    );

    res.status(201).json({
      status: 'success',
      message: 'Produk berhasil ditambahkan',
      data: { id: result.insertId, name, description, price, stock, image_url: finalImage },
    });
  } catch (error) {
    console.error('Error create product:', error);
    res.status(500).json({ status: 'error', message: 'Gagal menambahkan produk' });
  }
});

// PUT update produk / restok
router.put('/:id', async (req: Request, res: Response) => {
  try {
    const { name, description, price, stock, image_url, imageUrl } = req.body;
    const finalImage = image_url || imageUrl;

    await db.query(
      'UPDATE product SET name = COALESCE(?, name), description = COALESCE(?, description), price = COALESCE(?, price), stock = COALESCE(?, stock), image_url = COALESCE(?, image_url) WHERE id = ?',
      [name ?? null, description ?? null, price ?? null, stock ?? null, finalImage ?? null, req.params.id]
    );

    res.json({ status: 'success', message: 'Produk berhasil diperbarui' });
  } catch (error) {
    console.error('Error update product:', error);
    res.status(500).json({ status: 'error', message: 'Gagal memperbarui produk' });
  }
});

// PATCH update stok cepat dari Dashboard
router.patch('/:id', async (req: Request, res: Response) => {
  try {
    const { stock } = req.body;
    await db.query('UPDATE product SET stock = ? WHERE id = ?', [
      Number(stock),
      req.params.id,
    ]);
    res.json({ status: 'success', message: 'Stok berhasil diperbarui' });
  } catch (error) {
    console.error('Error patch stock:', error);
    res.status(500).json({ status: 'error', message: 'Gagal memperbarui stok' });
  }
});

// DELETE hapus produk
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    await db.query('DELETE FROM product WHERE id = ?', [req.params.id]);
    res.json({ status: 'success', message: 'Produk berhasil dihapus' });
  } catch (error) {
    console.error('Error delete product:', error);
    res.status(500).json({ status: 'error', message: 'Gagal menghapus produk' });
  }
});

export default router;