export type UserRole = 'admin' | 'kurir' | 'pelanggan';

export interface User {
  id: number;
  name: string;
  email: string;
  password?: string;
  role: UserRole;
  phone?: string;
  address?: string;
  status?: 'jalan' | 'standby' | 'aktif' | 'nonaktif';
  created_at?: Date;
  updated_at?: Date;
}

export interface RegisterUserInput {
  name: string;
  email: string;
  password: string;
  role?: UserRole;
  phone?: string;
  address?: string;
}

export interface LoginUserInput {
  email: string;
  password: string;
}