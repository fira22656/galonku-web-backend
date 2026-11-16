import { db } from '../config/db.js';

export const getAllProducts = async () => {
  const [rows] = await db.query('SELECT * FROM product');
  return rows;
};

export const getProductById = async (id: number) => {
  const [rows]: any = await db.query('SELECT * FROM product WHERE id = ?', [id]);
  return rows[0];
};