
export enum UserRole {
  ADMIN = 'ADMIN',
  MANAGER = 'MANAGER',
  WAREHOUSE = 'WAREHOUSE',
  SELLER = 'SELLER',
  SUPPLIER = 'SUPPLIER'
}

export enum InventoryType {
  TOTAL = 'TOTAL',
  PARTIAL = 'PARTIAL',
  CYCLICAL = 'CYCLICAL'
}

export interface BusinessConfig {
  name: string;
  slogan: string;
  logo: string;
  taxId: string;
  currency: string;
  taxPercentage: number;
  address: string;
  phone: string;
  email: string;
  quotationFooter: string;
}

export interface Product {
  id: string;
  sku: string;
  name: string;
  category: string;
  stock: number;
  minStock: number;
  price: number;
  location: string;
  lastCounted?: string;
  rfidTag?: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar: string;
  status?: 'ACTIVE' | 'INACTIVE';
}

export interface Quotation {
  id: string;
  customerName: string;
  customerPhone: string;
  total: number;
  status: 'PENDING' | 'ACCEPTED' | 'REJECTED';
  items: QuotationItem[];
  createdAt: string;
}

export interface QuotationItem {
  id: string;
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
}

export interface Movement {
  id: string;
  productId: string;
  type: 'IN' | 'OUT' | 'ADJUSTMENT';
  quantity: number;
  timestamp: string;
  userId: string;
  reason?: string;
}
