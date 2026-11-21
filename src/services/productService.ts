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

export const createProduct = async (data: {
  name: string;
  price: number;
  stock: number;
  costPrice?: number;
  type?: string;
  description?: string;
  sku?: string;
}) => {
  const [cols]: any = await db.query('SHOW COLUMNS FROM product');
  const colNames = cols.map((c: any) => c.Field);

  const insertData: Record<string, any> = {};
  if (colNames.includes('name')) insertData.name = data.name;
  if (colNames.includes('nama')) insertData.nama = data.name;
  if (colNames.includes('price')) insertData.price = data.price;
  if (colNames.includes('harga')) insertData.harga = data.price;
  if (colNames.includes('stock')) insertData.stock = data.stock;
  if (colNames.includes('stok')) insertData.stok = data.stock;
  if (colNames.includes('cost_price') && data.costPrice !== undefined) insertData.cost_price = data.costPrice;
  if (colNames.includes('costPrice') && data.costPrice !== undefined) insertData.costPrice = data.costPrice;
  if (colNames.includes('type') && data.type) insertData.type = data.type;
  if (colNames.includes('description') && data.description) insertData.description = data.description;
  if (colNames.includes('sku') && data.sku) insertData.sku = data.sku;

  const keys = Object.keys(insertData);
  const values = Object.values(insertData);
  const placeholders = keys.map(() => '?').join(', ');

  const [result]: any = await db.query(
    `INSERT INTO product (${keys.join(', ')}) VALUES (${placeholders})`,
    values
  );

  return { id: result.insertId, ...insertData };
};

export const updateProduct = async (
  id: number,
  data: { stock?: number; price?: number; costPrice?: number }
) => {
  const [cols]: any = await db.query('SHOW COLUMNS FROM product');
  const colNames = cols.map((c: any) => c.Field);

  const updates: string[] = [];
  const values: any[] = [];

  if (data.stock !== undefined) {
    if (colNames.includes('stock')) { updates.push('stock = ?'); values.push(data.stock); }
    else if (colNames.includes('stok')) { updates.push('stok = ?'); values.push(data.stock); }
  }
  if (data.price !== undefined) {
    if (colNames.includes('price')) { updates.push('price = ?'); values.push(data.price); }
    else if (colNames.includes('harga')) { updates.push('harga = ?'); values.push(data.price); }
  }
  if (data.costPrice !== undefined) {
    if (colNames.includes('cost_price')) { updates.push('cost_price = ?'); values.push(data.costPrice); }
    else if (colNames.includes('costPrice')) { updates.push('costPrice = ?'); values.push(data.costPrice); }
  }

  if (updates.length > 0) {
    values.push(id);
    await db.query(`UPDATE product SET ${updates.join(', ')} WHERE id = ?`, values);
  }
  return getProductById(id);
};