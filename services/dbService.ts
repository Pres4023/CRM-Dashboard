
import { Product, User, UserRole } from "../types";

const API_URL = 'api.php';

const MOCK_PRODUCTS: Product[] = [
  { id: '1', sku: 'NX-001', name: 'Laptop Pro 16', category: 'Electrónica', stock: 15, minStock: 5, price: 1200, location: 'Pasillo A-1', rfidTag: 'RFID-1001' },
  { id: '2', sku: 'NX-002', name: 'Monitor 4K Nexus', category: 'Electrónica', stock: 3, minStock: 10, price: 450, location: 'Pasillo A-2', rfidTag: 'RFID-1002' },
  { id: '3', sku: 'NX-003', name: 'Teclado Mecánico RGB', category: 'Periféricos', stock: 45, minStock: 15, price: 89, location: 'Pasillo B-1', rfidTag: 'RFID-1003' },
  { id: '4', sku: 'NX-004', name: 'Mouse Inalámbrico AI', category: 'Periféricos', stock: 0, minStock: 20, price: 55, location: 'Pasillo B-1', rfidTag: 'RFID-1004' }
];

export const dbService = {
  async getProducts(): Promise<{ data: Product[], isDemo: boolean }> {
    try {
      const res = await fetch(`${API_URL}?action=products`);
      if (!res.ok) throw new Error();
      const data = await res.json();
      return { data, isDemo: false };
    } catch {
      return { data: MOCK_PRODUCTS, isDemo: true };
    }
  },

  async createQuotation(quotation: any) {
    try {
      const res = await fetch(`${API_URL}?action=create_quotation`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(quotation)
      });
      return await res.json();
    } catch {
      console.warn("Modo Demo: Cotización simulada exitosa.");
      return { success: true, id: 'demo-' + Date.now() };
    }
  },

  async getUsers(): Promise<User[]> {
    try {
      const res = await fetch(`${API_URL}?action=users`);
      if (!res.ok) throw new Error();
      return await res.json();
    } catch {
      return [
        { id: 'u1', name: 'Carlos Admin', email: 'admin@nexus.com', role: UserRole.ADMIN, avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Carlos' }
      ];
    }
  },

  async createUser(user: Partial<User>) {
    try {
      const res = await fetch(`${API_URL}?action=create_user`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(user)
      });
      return await res.json();
    } catch {
      return { success: true };
    }
  },

  async deleteUser(id: string) {
    try {
      const res = await fetch(`${API_URL}?action=delete_user&id=${id}`, {
        method: 'POST', // Usamos POST para mayor compatibilidad con algunos hostings
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id })
      });
      return await res.json();
    } catch {
      return { success: true };
    }
  },

  async syncInventory(userId: string, progress: Record<string, number>) {
    try {
      const res = await fetch(`${API_URL}?action=update_stock`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, counts: progress })
      });
      return await res.json();
    } catch {
      return { success: true };
    }
  }
};
