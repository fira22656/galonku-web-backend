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