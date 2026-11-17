import { Router, Response } from 'express';
import { authenticateToken, AuthRequest } from '../middleware/auth.js';
import { db } from '../config/db.js';

const router = Router();

// GET /api/reports/summary -> Ringkasan laporan keuangan
router.get('/summary', authenticateToken, async (_req: AuthRequest, res: Response) => {
  try {
    // Total pemasukan dari pesanan yang berstatus 'selesai'
    const [incomeRows]: any = await db.query(
      "SELECT COALESCE(SUM(total_price), 0) AS total_pemasukan, COUNT(*) AS total_transaksi_selesai FROM `order` WHERE status = 'selesai'"
    );

    // Total nominal pesanan yang masih berjalan / belum selesai
    const [pendingRows]: any = await db.query(
      "SELECT COALESCE(SUM(total_price), 0) AS total_belum_selesai, COUNT(*) AS total_transaksi_berjalan FROM `order` WHERE status IN ('pending', 'diproses', 'dikirim')"
    );

    // Total galon terjual dari pesanan yang sudah selesai
    const [galonRows]: any = await db.query(
      "SELECT COALESCE(SUM(oi.quantity), 0) AS total_galon_terjual FROM orderitem oi JOIN `order` o ON oi.order_id = o.id WHERE o.status = 'selesai'"
    );

    res.json({
      success: true,
      data: {
        total_pemasukan: Number(incomeRows[0].total_pemasukan),
        total_transaksi_selesai: Number(incomeRows[0].total_transaksi_selesai),
        total_belum_selesai: Number(pendingRows[0].total_belum_selesai),
        total_transaksi_berjalan: Number(pendingRows[0].total_transaksi_berjalan),
        total_galon_terjual: Number(galonRows[0].total_galon_terjual),
      },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Gagal memuat ringkasan keuangan', error: error.message });
  }
});

// GET /api/reports/transactions -> Riwayat transaksi pemasukan (bisa filter ?startDate=2026-11-01&endDate=2026-11-30)
router.get('/transactions', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const { startDate, endDate } = req.query;

    let query = "SELECT * FROM `order` WHERE status = 'selesai'";
    const params: any[] = [];

    if (startDate && endDate) {
      query += ' AND DATE(created_at) BETWEEN ? AND ?';
      params.push(startDate, endDate);
    }

    query += ' ORDER BY created_at DESC';

    const [transactions] = await db.query(query, params);
    res.json({ success: true, data: transactions });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Gagal memuat riwayat transaksi keuangan', error: error.message });
  }
});

export default router;