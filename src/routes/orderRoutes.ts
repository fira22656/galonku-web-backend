import { Router, Response } from 'express';
import { authenticateToken, AuthRequest } from '../middleware/auth.js';
import {
  createOrder,
  getAllOrders,
  getOrderById,
  updateOrderStatus,
  deleteOrder,
} from '../services/orderService.js';
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

// --- TAMBAHAN NICEA: MANAJEMEN PESANAN ---

// GET /api/orders/manage/all -> Lihat semua pesanan (bisa filter ?status=pending)
router.get('/manage/all', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const status = req.query.status as string | undefined;
    const orders = await getAllOrders(status);
    res.json({ success: true, data: orders });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Gagal mengambil semua pesanan', error: error.message });
  }
});

// GET /api/orders/:id -> Lihat detail 1 pesanan beserta item galonnya
router.get('/:id', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const orderId = Number(req.params.id);
    const order = await getOrderById(orderId);
    if (!order) {
      return res.status(404).json({ success: false, message: 'Pesanan tidak ditemukan' });
    }
    res.json({ success: true, data: order });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Gagal mengambil detail pesanan', error: error.message });
  }
});

// PATCH /api/orders/:id/status -> Update status pesanan (pending, diproses, dikirim, selesai, dibatalkan)
router.patch('/:id/status', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const orderId = Number(req.params.id);
    const { status } = req.body;
    const allowedStatus = ['pending', 'diproses', 'dikirim', 'selesai', 'dibatalkan'];

    if (!status || !allowedStatus.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Status tidak valid. Pilih salah satu: ${allowedStatus.join(', ')}`,
      });
    }

    const updated = await updateOrderStatus(orderId, status);
    if (!updated) {
      return res.status(404).json({ success: false, message: 'Pesanan tidak ditemukan' });
    }

    res.json({ success: true, message: `Status pesanan berhasil diubah menjadi ${status}` });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Gagal mengubah status pesanan', error: error.message });
  }
});

// DELETE /api/orders/:id -> Hapus pesanan
router.delete('/:id', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const orderId = Number(req.params.id);
    const deleted = await deleteOrder(orderId);
    if (!deleted) {
      return res.status(404).json({ success: false, message: 'Pesanan tidak ditemukan' });
    }
    res.json({ success: true, message: 'Pesanan berhasil dihapus' });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Gagal menghapus pesanan', error: error.message });
  }
});

export default router;