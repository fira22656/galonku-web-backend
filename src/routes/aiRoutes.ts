import { Router } from 'express';
import { authenticateToken, AuthRequest } from '../middleware/auth.js';
import { upload } from '../middleware/upload.js';
import { processGalonImage } from '../aiServices/geminiService.js';

const router = Router();

router.post('/scan', authenticateToken, upload.single('image'), async (req: AuthRequest, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: 'File gambar wajib diunggah' });

    const result = await processGalonImage(req.user.id, req.file.path);
    res.json({ success: true, data: result });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Gagal memproses gambar AI' });
  }
});

export default router;