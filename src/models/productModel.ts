export interface Product {
  id: number;
  name: string;
  brand?: string;
  size?: string;
  price: number;
  stock: number;
  image_url?: string;
  created_at?: Date;
  updated_at?: Date;
}

export interface CreateProductInput {
  name: string;
  brand?: string;
  size?: string;
  price: number;
  stock: number;
  image_url?: string;
}

export interface UpdateProductInput {
  name?: string;
  brand?: string;
  size?: string;
  price?: number;
  stock?: number;
  image_url?: string;
}