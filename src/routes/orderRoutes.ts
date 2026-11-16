import { Router, Response } from 'express';
import { authenticateToken, AuthRequest } from '../middleware/auth.js';
import { createOrder } from '../services/orderService.js';
import { db } from '../config/db.js';

const router = Router();

// POST /api/orders -> Buat pesanan baru (wajib login pakai Bearer token)
router.post('/', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    const { items } = req.body; // format: [{ productId: 1, quantity: 2, price: 20000 }]

    if (!userId) {
      return res.status(401).json({ success: false, message: 'User tidak terautentikasi' });
    }
    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ success: false, message: 'Item pesanan tidak boleh kosong' });
    }

    const result = await createOrder(userId, items);
    res.status(201).json({
      success: true,
      message: 'Pesanan berhasil dibuat',
      data: result,
    });
  } catch (error: any) {
    console.error('Error createOrder:', error);
    res.status(500).json({ success: false, message: 'Gagal membuat pesanan', error: error.message });
  }
});

// GET /api/orders -> Ambil riwayat pesanan user yang sedang login
router.get('/', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    const [orders] = await db.query(
      'SELECT * FROM `order` WHERE user_id = ? ORDER BY created_at DESC',
      [userId]
    );
    res.json({ success: true, data: orders });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Gagal mengambil riwayat pesanan', error: error.message });
  }
});

export default router;