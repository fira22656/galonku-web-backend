export type OrderStatus = 'menunggu' | 'diproses' | 'diantar' | 'selesai' | 'dibatalkan';

export interface Order {
  id: number;
  order_code?: string;
  user_id: number;
  courier_id?: number | null;
  product_id: number;
  quantity: number;
  total_price: number;
  status: OrderStatus;
  delivery_address: string;
  notes?: string;
  created_at?: Date;
  updated_at?: Date;
}

export interface CreateOrderInput {
  user_id: number;
  product_id: number;
  quantity: number;
  total_price: number;
  delivery_address: string;
  notes?: string;
}

export interface UpdateOrderStatusInput {
  status: OrderStatus;
  courier_id?: number | null;
}