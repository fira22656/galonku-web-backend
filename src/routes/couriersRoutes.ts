import { Router, Response } from 'express';
import {db} from '../config/db';
import { authenticateToken, AuthRequest } from '../middleware/auth';

const router = Router();

// 1. GET /api/couriers -> Ambil semua daftar kurir beserta jumlah pesanan yang sedang dibawa
router.get('/', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const [couriers] = await db.query(`
      SELECT 
        c.*,
        COUNT(o.id) AS activeOrders
      FROM courier c
      LEFT JOIN \`order\` o 
        ON o.courierId = c.id AND o.status IN ('diproses', 'dikirim')
      GROUP BY c.id
      ORDER BY c.id DESC
    `);

    res.json({
      success: true,
      data: couriers,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Gagal mengambil data monitoring kurir',
      error: error.message,
    });
  }
});

// 2. GET /api/couriers/orders -> Ambil daftar pengiriman pesanan beserta nama kurirnya
router.get('/orders', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const [deliveries] = await db.query(`
      SELECT 
        o.*,
        c.name AS courierName,
        c.phone AS courierPhone
      FROM \`order\` o
      LEFT JOIN courier c ON o.courierId = c.id
      ORDER BY o.createdAt DESC
    `);

    res.json({
      success: true,
      data: deliveries,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Gagal mengambil data pengiriman pesanan',
      error: error.message,
    });
  }
});

// 3. PATCH /api/couriers/assign/:orderId -> Tugaskan kurir ke pesanan tertentu
router.patch('/assign/:orderId', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const { orderId } = req.params;
    const { courierId, status } = req.body;

    if (!courierId) {
      return res.status(400).json({
        success: false,
        message: 'courierId wajib diisi',
      });
    }

    const orderStatus = status || 'dikirim';

    const [result]: any = await db.query(
      'UPDATE `order` SET courierId = ?, status = ? WHERE id = ?',
      [courierId, orderStatus, orderId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: 'Pesanan tidak ditemukan',
      });
    }

    res.json({
      success: true,
      message: 'Kurir berhasil ditugaskan ke pesanan',
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Gagal menugaskan kurir',
      error: error.message,
    });
  }
});

// 4. PATCH /api/couriers/:id/status -> Update status kurir (aktif / mengantar / offline)
router.patch('/:id/status', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!status) {
      return res.status(400).json({
        success: false,
        message: 'Status kurir wajib diisi',
      });
    }

    const [result]: any = await db.query(
      'UPDATE courier SET status = ? WHERE id = ?',
      [status, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: 'Kurir tidak ditemukan',
      });
    }

    res.json({
      success: true,
      message: 'Status kurir berhasil diperbarui',
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Gagal memperbarui status kurir',
      error: error.message,
    });
  }
});

export default router;