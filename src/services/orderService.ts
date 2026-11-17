import { db } from '../config/db.js';

export const createOrder = async (userId: number, items: { productId: number; quantity: number; price: number }[]) => {
  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();

    const totalAmount = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

    // Insert ke tabel order
    const [orderResult]: any = await connection.query(
      'INSERT INTO `order` (user_id, total_price, status, created_at) VALUES (?, ?, "pending", NOW())',
      [userId, totalAmount]
    );

    const orderId = orderResult.insertId;

    // Insert item ke tabel orderitem
    for (const item of items) {
      await connection.query(
        'INSERT INTO orderitem (order_id, product_id, quantity, price) VALUES (?, ?, ?, ?)',
        [orderId, item.productId, item.quantity, item.price]
      );
    }

    await connection.commit();
    return { orderId, totalAmount };
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
};

// --- TAMBAHAN NICEA: MANAJEMEN PESANAN ---

// 1. Ambil semua pesanan (untuk Admin/Pengelola) beserta detail itemnya
export const getAllOrders = async (status?: string) => {
  let query = 'SELECT * FROM `order`';
  const params: any[] = [];

  if (status) {
    query += ' WHERE status = ?';
    params.push(status);
  }
  query += ' ORDER BY createdAt DESC';

  const [orders]: any = await db.query(query, params);
  const [items]: any = await db.query('SELECT * FROM orderitem');

  return orders.map((order: any) => ({
    ...order,
    items: items.filter((item: any) => item.order_id === order.id),
  }));
};

// 2. Ambil detail 1 pesanan berdasarkan ID
export const getOrderById = async (orderId: number) => {
  const [orders]: any = await db.query('SELECT * FROM `order` WHERE id = ?', [orderId]);
  if (orders.length === 0) return null;

  const [items]: any = await db.query('SELECT * FROM orderitem WHERE order_id = ?', [orderId]);
  return {
    ...orders[0],
    items,
  };
};

// 3. Ubah status pesanan (pending -> diproses -> dikirim -> selesai / dibatalkan)
export const updateOrderStatus = async (orderId: number, status: string) => {
  const [result]: any = await db.query(
    'UPDATE `order` SET status = ? WHERE id = ?',
    [status, orderId]
  );
  return result.affectedRows > 0;
};

// 4. Hapus pesanan beserta itemnya
export const deleteOrder = async (orderId: number) => {
  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();
    await connection.query('DELETE FROM orderitem WHERE order_id = ?', [orderId]);
    const [result]: any = await connection.query('DELETE FROM `order` WHERE id = ?', [orderId]);
    await connection.commit();
    return result.affectedRows > 0;
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
};