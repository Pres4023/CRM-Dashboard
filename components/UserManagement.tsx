
import React, { useState, useEffect } from 'react';
import { User, UserRole } from '../types';
import { dbService } from '../services/dbService';
import { Users, UserPlus, Shield, Trash2, Mail, BadgeCheck, XCircle } from 'lucide-react';

export const UserManagement: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [newUser, setNewUser] = useState({ name: '', email: '', role: UserRole.WAREHOUSE });
  const [loading, setLoading] = useState(true);

  const fetchUsers = async () => {
    setLoading(true);
    const data = await dbService.getUsers();
    setUsers(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    const avatar = `https://api.dicebear.com/7.x/avataaars/svg?seed=${newUser.name}`;
    await dbService.createUser({ ...newUser, avatar });
    setShowModal(false);
    setNewUser({ name: '', email: '', role: UserRole.WAREHOUSE });
    fetchUsers();
  };

  const handleDelete = async (id: string) => {
    if (confirm('¿Estás seguro de eliminar a este miembro del personal?')) {
      await dbService.deleteUser(id);
      fetchUsers();
    }
  };

  const roleConfig = {
    [UserRole.ADMIN]: { color: 'bg-rose-100 text-rose-700', label: 'Administrador', permissions: 'Acceso Total' },
    [UserRole.MANAGER]: { color: 'bg-indigo-100 text-indigo-700', label: 'Gerente', permissions: 'Inventario e IA' },
    [UserRole.SELLER]: { color: 'bg-emerald-100 text-emerald-700', label: 'Vendedor', permissions: 'Ventas y Stock' },
    [UserRole.SUPPLIER]: { color: 'bg-amber-100 text-amber-700', label: 'Proveedor', permissions: 'Entradas' },
    [UserRole.WAREHOUSE]: { color: 'bg-slate-100 text-slate-700', label: 'Almacén', permissions: 'Conteos' }
  };

  return (
    <div className="p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Gestión de Personal</h2>
          <p className="text-slate-500">Administra usuarios, roles y niveles de acceso.</p>
        </div>
        <button 
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 bg-indigo-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-indigo-500 transition-all shadow-lg"
        >
          <UserPlus className="w-5 h-5" /> Registrar Personal
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          <div className="col-span-full text-center py-20 text-slate-400">Cargando personal...</div>
        ) : users.map(user => (
          <div key={user.id} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm relative group">
            <button 
              onClick={() => handleDelete(user.id)}
              className="absolute top-4 right-4 text-slate-300 hover:text-rose-500 transition-colors opacity-0 group-hover:opacity-100"
            >
              <Trash2 className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-4 mb-4">
              <img src={user.avatar} className="w-16 h-16 rounded-2xl bg-slate-50 border border-slate-100" />
              <div>
                <h3 className="font-bold text-slate-800">{user.name}</h3>
                <div className="flex items-center gap-1 text-sm text-slate-500">
                  <Mail className="w-3 h-3" /> {user.email}
                </div>
              </div>
            </div>
            
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase ${roleConfig[user.role].color}`}>
                  {roleConfig[user.role].label}
                </span>
                <span className="flex items-center gap-1 text-[10px] text-emerald-600 font-bold uppercase">
                  <BadgeCheck className="w-3 h-3" /> Activo
                </span>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl">
                <p className="text-[10px] uppercase font-bold text-slate-400 mb-1">Permisos</p>
                <p className="text-sm font-semibold text-slate-700">{roleConfig[user.role].permissions}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white w-full max-w-md rounded-3xl overflow-hidden shadow-2xl p-8">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold flex items-center gap-2">
                <Shield className="w-6 h-6 text-indigo-600" /> Nuevo Registro
              </h3>
              <button onClick={() => setShowModal(false)}><XCircle className="w-6 h-6 text-slate-300" /></button>
            </div>
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase">Nombre Completo</label>
                <input 
                  required
                  type="text" 
                  value={newUser.name}
                  onChange={e => setNewUser({...newUser, name: e.target.value})}
                  className="w-full mt-1 px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                  placeholder="Ej: Juan Pérez"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase">Email Corporativo</label>
                <input 
                  required
                  type="email" 
                  value={newUser.email}
                  onChange={e => setNewUser({...newUser, email: e.target.value})}
                  className="w-full mt-1 px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                  placeholder="juan@nexus.com"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase">Puesto / Rol</label>
                <select 
                  value={newUser.role}
                  onChange={e => setNewUser({...newUser, role: e.target.value as UserRole})}
                  className="w-full mt-1 px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                >
                  <option value={UserRole.ADMIN}>Administrador (Acceso Total)</option>
                  <option value={UserRole.MANAGER}>Gerente (Inventario e IA)</option>
                  <option value={UserRole.SELLER}>Vendedor (Salidas de Stock)</option>
                  <option value={UserRole.SUPPLIER}>Proveedor (Entradas de Stock)</option>
                  <option value={UserRole.WAREHOUSE}>Operador Almacén (Conteos)</option>
                </select>
              </div>
              <button type="submit" className="w-full bg-indigo-600 text-white py-4 rounded-xl font-bold shadow-xl hover:bg-indigo-700 transition-all mt-4">
                Confirmar Registro
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
