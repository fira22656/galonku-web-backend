import { db } from '../config/db.js';

export const processGalonImage = async (userId: number, imagePath: string) => {
  // 1. Logika integrasi ke Gemini / Model AI
  const aiResult = {
    brand: 'Aqua',
    condition: 'Bagus',
    estimatedStock: 10,
    confidence: 0.95,
  };

  // 2. Simpan log deteksi ke tabel 'ailog'
  await db.query(
    'INSERT INTO ailog (user_id, image_path, result_json, created_at) VALUES (?, ?, ?, NOW())',
    [userId, imagePath, JSON.stringify(aiResult)]
  );

  return aiResult;
};