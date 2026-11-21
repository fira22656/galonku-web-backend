import { Router } from 'express';
import db from '../config/db.js';

const router = Router();

// GET: Statistik Dashboard Admin
router.get('/dashboard-stats', async (req, res) => {
  try {
    const [incomeRows]: any = await db.query(
      "SELECT SUM(totalHarga) as total FROM orders WHERE status = 'SELESAI'"
    );
    const [orderRows]: any = await db.query(
      "SELECT COUNT(*) as total FROM orders"
    );
    const [productRows]: any = await db.query(
      "SELECT COUNT(*) as total FROM products"
    );

    res.json({
      pendapatan: incomeRows[0]?.total || 0,
      totalPesanan: orderRows[0]?.total || 0,
      totalProduk: productRows[0]?.total || 0,
    });
  } catch (error) {
    res.status(500).json({ error: 'Gagal mengambil statistik dashboard' });
  }
});

export default router;