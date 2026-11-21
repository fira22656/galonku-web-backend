import { Product } from '../models/productModel.js';
import { db } from '../config/db.js';

export const getAllProducts = async (): Promise<Product[]> => {
  const [rows] = await db.query('SELECT * FROM product');
  return rows as Product[];
};

export const getProductById = async (id: number): Promise<Product | undefined> => {
  const [rows]: any = await db.query('SELECT * FROM product WHERE id = ?', [id]);
  return rows[0] as Product | undefined;
};