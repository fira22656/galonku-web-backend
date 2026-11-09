import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

const db = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: '', // sesuaikan dengan password Laragon kamu (biasanya kosong)
  database: 'galonku_db', // nama database di MySQL Laragon
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

export default db;