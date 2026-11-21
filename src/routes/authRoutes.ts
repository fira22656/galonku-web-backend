import { Router, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { db } from '../config/db.js';

const router = Router();
const JWT_SECRET = process.env.JWT_SECRET || 'secret_galonku';

const hashPassword = (password: string): string => {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.scryptSync(password, salt, 64).toString('hex');
  return `${salt}:${hash}`;
};

const verifyPassword = (password: string, stored: string): boolean => {
  const [salt, key] = stored.split(':');
  if (!salt || !key) return password === stored; // fallback jika input manual di HeidiSQL
  const keyBuffer = Buffer.from(key, 'hex');
  const derivedKey = crypto.scryptSync(password, salt, 64);
  return crypto.timingSafeEqual(keyBuffer, derivedKey);
};

// POST /api/auth/register
router.post('/register', async (req: Request, res: Response) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: 'Nama, email, dan password wajib diisi' });
    }

    const [existing]: any = await db.query('SELECT id FROM `user` WHERE email = ?', [email]);
    if (existing.length > 0) {
      return res.status(400).json({ success: false, message: 'Email sudah terdaftar' });
    }

    const hashedPassword = hashPassword(password);
    const [result]: any = await db.query(
      'INSERT INTO `user` (name, email, password) VALUES (?, ?, ?)',
      [name, email, hashedPassword]
    );

    res.status(201).json({
      success: true,
      message: 'Registrasi berhasil',
      data: { id: result.insertId, name, email },
    });
  } catch (error: any) {
    console.error('Error register:', error);
    res.status(500).json({ success: false, message: 'Gagal registrasi', error: error.message });
  }
});

// POST /api/auth/login
router.post('/login', async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email dan password wajib diisi' });
    }

    const [rows]: any = await db.query('SELECT * FROM `user` WHERE email = ?', [email]);
    const user = rows[0];

    if (!user || !verifyPassword(password, user.password)) {
      return res.status(401).json({ success: false, message: 'Email atau password salah' });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, name: user.name },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      success: true,
      message: 'Login berhasil',
      token,
      user: { id: user.id, name: user.name, email: user.email },
    });
  } catch (error: any) {
    console.error('Error login:', error);
    res.status(500).json({ success: false, message: 'Gagal login', error: error.message });
  }
});
// POST /api/auth/google
router.post('/google', async (req: Request, res: Response) => {
  try {
    const { credential, accessToken } = req.body;
    if (!credential && !accessToken) {
      return res.status(400).json({ success: false, message: 'Token Google tidak ditemukan' });
    }

    let payload: any = null;

    if (accessToken) {
      const googleRes = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      payload = await googleRes.json();
      if (!googleRes.ok || !payload.email) {
        return res.status(401).json({ success: false, message: 'Token Google tidak valid' });
      }
    } else if (credential) {
      const googleRes = await fetch(`https://oauth2.googleapis.com/tokeninfo?id_token=${credential}`);
      payload = await googleRes.json();
      if (!googleRes.ok || !payload.email) {
        return res.status(401).json({ success: false, message: 'Token Google tidak valid' });
      }
    }

    const [rows]: any = await db.query('SELECT * FROM `user` WHERE email = ?', [payload.email]);
    let user = rows[0];

    if (!user) {
      const dummyPassword = hashPassword(crypto.randomBytes(16).toString('hex'));
      const userName = payload.name || payload.email.split('@')[0];
      const [result]: any = await db.query(
        'INSERT INTO `user` (name, email, password) VALUES (?, ?, ?)',
        [userName, payload.email, dummyPassword]
      );
      user = { id: result.insertId, name: userName, email: payload.email };
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, name: user.name },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      success: true,
      message: 'Login Google berhasil',
      token,
      user: { id: user.id, name: user.name, email: user.email },
    });
  } catch (error: any) {
    console.error('Error Google login:', error);
    res.status(500).json({ success: false, message: 'Gagal login dengan Google', error: error.message });
  }
});
export default router;