
import { Router, Response } from 'express';
import { authenticateToken, AuthRequest } from '../middleware/auth.js';
import { db } from '../config/db.js';

const router = Router();

// ======================================
// GET /api/reports/summary
// Ringkasan laporan keuangan
// ======================================

router.get('/summary', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {

    // 1. Total pemasukan pesanan selesai
    const [incomeRows]: any = await db.query(`
      SELECT
        COALESCE(SUM(totalAmount), 0) AS total_pemasukan,
        COUNT(*) AS total_transaksi_selesai
      FROM \`order\`
      WHERE status = 'SELESAI'
    `);

    // 2. Total pesanan yang masih berjalan
    const [pendingRows]: any = await db.query(`
      SELECT
        COALESCE(SUM(totalAmount), 0) AS total_belum_selesai,
        COUNT(*) AS total_transaksi_berjalan
      FROM \`order\`
      WHERE status IN ('PENDING', 'DIPROSES', 'DIANTAR')
    `);

    // 3. Total galon terjual
    const [galonRows]: any = await db.query(`
      SELECT
        COALESCE(SUM(oi.quantity), 0) AS total_galon_terjual
      FROM orderitem oi
      JOIN \`order\` o ON oi.orderId = o.id
      WHERE o.status = 'SELESAI'
    `);

    // 4. Kirim hasil laporan
    res.status(200).json({
      success: true,
      data: {
        total_pemasukan: Number(incomeRows[0].total_pemasukan),
        total_transaksi_selesai: Number(incomeRows[0].total_transaksi_selesai),
        total_belum_selesai: Number(pendingRows[0].total_belum_selesai),
        total_transaksi_berjalan: Number(pendingRows[0].total_transaksi_berjalan),
        total_galon_terjual: Number(galonRows[0].total_galon_terjual)
      }
    });

  } catch (error: any) {
    console.error('Error laporan keuangan:', error);

    res.status(500).json({
      success: false,
      message: 'Gagal memuat laporan keuangan',
      error: error.message
    });
  }
});


// ======================================
// GET /api/reports/transactions
// Riwayat transaksi
// ======================================

router.get('/transactions', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {

    const startDate = req.query.startDate as string | undefined;
    const endDate = req.query.endDate as string | undefined;

    let query = `
      SELECT *
      FROM \`order\`
      WHERE status = 'SELESAI'
    `;

    const params: any[] = [];

    if (startDate && endDate) {
      query += ' AND DATE(createdAt) BETWEEN ? AND ?';
      params.push(startDate, endDate);
    }

    query += ' ORDER BY createdAt DESC';

    const [transactions]: any = await db.query(query, params);

    res.status(200).json({
      success: true,
      data: transactions
    });

  } catch (error: any) {
    console.error('Error riwayat transaksi:', error);

    res.status(500).json({
      success: false,
      message: 'Gagal memuat riwayat transaksi',
      error: error.message
    });
  }
});

export default router;
