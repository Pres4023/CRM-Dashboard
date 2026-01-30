
export enum UserRole {
  ADMIN = 'ADMIN',
  MANAGER = 'MANAGER',
  WAREHOUSE = 'WAREHOUSE'
}

export enum InventoryType {
  TOTAL = 'TOTAL',
  PARTIAL = 'PARTIAL',
  CYCLICAL = 'CYCLICAL'
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

export interface InventorySession {
  id: string;
  type: InventoryType;
  startTime: string;
  status: 'OPEN' | 'CLOSED';
  countedItems: Record<string, number>; // SKU -> Counted
}

export interface User {
  id: string;
  name: string;
  role: UserRole;
  avatar: string;
}

export interface Movement {
  id: string;
  productId: string;
  type: 'IN' | 'OUT';
  quantity: number;
  timestamp: string;
  userId: string;
}
