
import React, { useState, useEffect, useCallback } from 'react';
// Fix: Added missing icons MapPin, RefreshCw, and Layers to the import list to resolve "Cannot find name" errors.
import { 
  LayoutDashboard, 
  Package, 
  ClipboardCheck, 
  Settings, 
  Users, 
  LogOut, 
  Search, 
  Plus, 
  Bell,
  Cpu,
  Zap,
  CheckCircle2,
  AlertTriangle,
  MapPin,
  RefreshCw,
  Layers
} from 'lucide-react';
import { Dashboard } from './components/Dashboard';
import { Scanner } from './components/Scanner';
import { Product, User, UserRole, InventoryType, Movement } from './types';
import { getInventoryInsights } from './services/geminiService';

// Mock Data
const INITIAL_PRODUCTS: Product[] = [
  { id: '1', sku: 'LAP-001', name: 'MacBook Pro 14"', category: 'Laptops', stock: 12, minStock: 5, price: 1999, location: 'Shelf A1', lastCounted: '2024-03-01' },
  { id: '2', sku: 'MOU-052', name: 'Logitech MX Master 3S', category: 'Accesorios', stock: 45, minStock: 10, price: 99, location: 'Shelf B2', lastCounted: '2024-03-05' },
  { id: '3', sku: 'MON-101', name: 'Dell UltraSharp 27"', category: 'Monitores', stock: 3, minStock: 10, price: 549, location: 'Shelf C1', lastCounted: '2024-02-28' },
  { id: '4', sku: 'KEY-902', name: 'Keychron Q1 V2', category: 'Accesorios', stock: 8, minStock: 15, price: 169, location: 'Shelf B2', lastCounted: '2024-03-02' },
];

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'inventory' | 'counts' | 'admin'>('dashboard');
  const [products, setProducts] = useState<Product[]>(INITIAL_PRODUCTS);
  const [movements, setMovements] = useState<Movement[]>([]);
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [aiInsights, setAiInsights] = useState<any>(null);
  const [isLoadingInsights, setIsLoadingInsights] = useState(false);
  const [countSession, setCountSession] = useState<{ active: boolean; type: InventoryType; progress: Record<string, number> } | null>(null);

  const currentUser: User = {
    id: 'u1',
    name: 'Carlos Warehouse',
    role: UserRole.MANAGER,
    avatar: 'https://picsum.photos/seed/user1/200/200'
  };

  const handleFetchInsights = async () => {
    setIsLoadingInsights(true);
    const insights = await getInventoryInsights(products);
    setAiInsights(insights);
    setIsLoadingInsights(false);
  };

  const handleScanResult = (code: string, type: string) => {
    const product = products.find(p => p.sku === code || p.rfidTag === code);
    
    if (countSession?.active && product) {
      setCountSession(prev => ({
        ...prev!,
        progress: {
          ...prev!.progress,
          [product.id]: (prev!.progress[product.id] || 0) + 1
        }
      }));
    } else if (product) {
      alert(`Producto detectado: ${product.name}. Stock actual: ${product.stock}`);
    } else {
      alert(`Código ${code} no reconocido en el sistema.`);
    }
    // Auto close for better UX on mobile
    // setIsScannerOpen(false);
  };

  const startCount = (type: InventoryType) => {
    setCountSession({ active: true, type, progress: {} });
    setActiveTab('counts');
  };

  const finishCount = () => {
    if (!countSession) return;
    
    const updatedProducts = products.map(p => {
      if (countSession.progress[p.id] !== undefined) {
        return { ...p, stock: countSession.progress[p.id], lastCounted: new Date().toISOString().split('T')[0] };
      }
      return p;
    });

    setProducts(updatedProducts);
    setCountSession(null);
    alert('Conteo finalizado y stock actualizado exitosamente.');
  };

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-slate-200 flex flex-col hidden md:flex shadow-xl z-10">
        <div className="p-6">
          <div className="flex items-center gap-3 mb-8">
            <div className="bg-indigo-600 p-2 rounded-xl">
              <Cpu className="text-white w-6 h-6" />
            </div>
            <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-indigo-400 tracking-tight">
              Nexus AI
            </span>
          </div>

          <nav className="space-y-1">
            <button 
              onClick={() => setActiveTab('dashboard')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeTab === 'dashboard' ? 'bg-indigo-50 text-indigo-600 font-semibold' : 'text-slate-500 hover:bg-slate-50'}`}
            >
              <LayoutDashboard className="w-5 h-5" /> Dashboard
            </button>
            <button 
              onClick={() => setActiveTab('inventory')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeTab === 'inventory' ? 'bg-indigo-50 text-indigo-600 font-semibold' : 'text-slate-500 hover:bg-slate-50'}`}
            >
              <Package className="w-5 h-5" /> Inventario
            </button>
            <button 
              onClick={() => setActiveTab('counts')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeTab === 'counts' ? 'bg-indigo-50 text-indigo-600 font-semibold' : 'text-slate-500 hover:bg-slate-50'}`}
            >
              <ClipboardCheck className="w-5 h-5" /> Auditoría
            </button>
            <button 
              onClick={() => setActiveTab('admin')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeTab === 'admin' ? 'bg-indigo-50 text-indigo-600 font-semibold' : 'text-slate-500 hover:bg-slate-50'}`}
            >
              <Users className="w-5 h-5" /> Usuarios
            </button>
          </nav>
        </div>

        <div className="mt-auto p-6 border-t border-slate-100">
          <div className="flex items-center gap-3 mb-6 p-2 rounded-xl hover:bg-slate-50 cursor-pointer">
            <img src={currentUser.avatar} className="w-10 h-10 rounded-full border-2 border-indigo-100" />
            <div className="overflow-hidden">
              <p className="text-sm font-bold text-slate-800 truncate">{currentUser.name}</p>
              <p className="text-[10px] uppercase text-slate-500 font-semibold tracking-wider">{currentUser.role}</p>
            </div>
          </div>
          <button className="w-full flex items-center gap-3 px-4 py-2 text-rose-500 hover:bg-rose-50 rounded-xl transition-colors font-medium">
            <LogOut className="w-5 h-5" /> Salir
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-full overflow-hidden relative">
        {/* Header */}
        <header className="h-20 bg-white/80 backdrop-blur-md border-b border-slate-200 flex items-center justify-between px-8 sticky top-0 z-20">
          <div className="flex items-center flex-1 max-w-xl">
            <div className="relative w-full">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
              <input 
                type="text" 
                placeholder="Buscar por SKU, nombre o categoría..." 
                className="w-full pl-12 pr-4 py-2.5 bg-slate-100 border-none rounded-2xl focus:ring-2 focus:ring-indigo-500 transition-all text-sm outline-none"
              />
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <button 
              onClick={handleFetchInsights}
              disabled={isLoadingInsights}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all ${isLoadingInsights ? 'bg-slate-200 text-slate-400' : 'bg-indigo-600 text-white hover:bg-indigo-500 shadow-lg shadow-indigo-200'}`}
            >
              {isLoadingInsights ? <Zap className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4" />}
              AI Insights
            </button>
            <div className="relative">
              <button className="p-2.5 bg-slate-100 rounded-xl text-slate-600 hover:bg-slate-200 transition-colors">
                <Bell className="w-5 h-5" />
                <span className="absolute top-2 right-2 w-2 h-2 bg-rose-500 rounded-full border-2 border-white"></span>
              </button>
            </div>
            <button 
              onClick={() => setIsScannerOpen(true)}
              className="md:hidden p-2.5 bg-indigo-600 text-white rounded-xl shadow-lg"
            >
              <Zap className="w-5 h-5" />
            </button>
          </div>
        </header>

        {/* Dynamic Body */}
        <div className="flex-1 overflow-hidden relative">
          {activeTab === 'dashboard' && <Dashboard products={products} movements={movements} />}
          
          {activeTab === 'inventory' && (
            <div className="p-8 space-y-6 overflow-y-auto h-full pb-20">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-slate-800">Catálogo de Productos</h2>
                <div className="flex gap-2">
                   <button className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-xl text-sm font-bold hover:bg-indigo-500">
                    <Plus className="w-4 h-4" /> Nuevo Producto
                  </button>
                </div>
              </div>

              {/* AI Insight Box */}
              {aiInsights && (
                <div className="bg-gradient-to-br from-indigo-900 to-slate-900 rounded-2xl p-6 text-white shadow-xl relative overflow-hidden group">
                  <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/20 rounded-full -mr-32 -mt-32 blur-3xl group-hover:scale-125 transition-transform duration-700"></div>
                  <div className="flex items-start gap-4 relative z-10">
                    <div className="bg-indigo-500/30 p-3 rounded-xl backdrop-blur-sm border border-indigo-400/30">
                      <Zap className="w-6 h-6 text-indigo-300" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-bold mb-2">Análisis de Nexus AI</h3>
                      <div className="grid md:grid-cols-2 gap-4">
                        <div>
                          <p className="text-xs uppercase text-indigo-300 font-bold mb-2 tracking-widest">Riesgos Identificados</p>
                          <ul className="space-y-2">
                            {aiInsights.riskProducts?.map((p: any, i: number) => (
                              <li key={i} className="flex items-center gap-2 text-sm bg-white/10 p-2 rounded-lg border border-white/5">
                                <AlertTriangle className="w-4 h-4 text-amber-400" />
                                <span className="font-bold">{p.sku}:</span> {p.reason}
                              </li>
                            ))}
                          </ul>
                        </div>
                        <div>
                          <p className="text-xs uppercase text-indigo-300 font-bold mb-2 tracking-widest">Recomendaciones</p>
                          <ul className="space-y-2">
                            {aiInsights.recommendations?.map((r: string, i: number) => (
                              <li key={i} className="flex items-center gap-2 text-sm">
                                <CheckCircle2 className="w-4 h-4 text-emerald-400" /> {r}
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                <table className="w-full text-left">
                  <thead className="bg-slate-50 border-b border-slate-100">
                    <tr>
                      <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Producto</th>
                      <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Categoría</th>
                      <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase text-center">Stock</th>
                      <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Ubicación</th>
                      <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Estado</th>
                      <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase text-right">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {products.map(p => (
                      <tr key={p.id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center font-bold text-slate-500">
                              {p.sku.substring(0, 2)}
                            </div>
                            <div>
                              <p className="font-bold text-slate-800">{p.name}</p>
                              <p className="text-xs text-slate-400">SKU: {p.sku}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-slate-600">{p.category}</td>
                        <td className="px-6 py-4 text-center">
                          <span className={`font-bold text-lg ${p.stock <= p.minStock ? 'text-rose-600' : 'text-slate-800'}`}>
                            {p.stock}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2 text-sm text-slate-600 bg-slate-100 w-fit px-2 py-1 rounded-md">
                            <MapPin className="w-3 h-3" /> {p.location}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase ${p.stock <= p.minStock ? 'bg-rose-100 text-rose-600' : 'bg-emerald-100 text-emerald-600'}`}>
                            {p.stock <= p.minStock ? 'Bajo Stock' : 'Disponible'}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <button className="text-slate-400 hover:text-indigo-600 transition-colors">
                            <Settings className="w-5 h-5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'counts' && (
            <div className="p-8 h-full overflow-y-auto pb-24">
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h2 className="text-2xl font-bold text-slate-800">Auditoría de Inventario</h2>
                  <p className="text-slate-500">Módulo de toma física y conteos cíclicos.</p>
                </div>
                {!countSession && (
                   <div className="flex gap-2">
                    <button onClick={() => startCount(InventoryType.CYCLICAL)} className="bg-white border border-slate-200 px-4 py-2 rounded-xl text-sm font-bold hover:bg-slate-50">Cíclico</button>
                    <button onClick={() => startCount(InventoryType.PARTIAL)} className="bg-white border border-slate-200 px-4 py-2 rounded-xl text-sm font-bold hover:bg-slate-50">Parcial</button>
                    <button onClick={() => startCount(InventoryType.TOTAL)} className="bg-indigo-600 text-white px-6 py-2 rounded-xl text-sm font-bold shadow-lg shadow-indigo-200">Inventario Total</button>
                  </div>
                )}
              </div>

              {countSession ? (
                <div className="space-y-6">
                  <div className="bg-indigo-600 text-white p-6 rounded-2xl shadow-xl flex items-center justify-between">
                    <div>
                      <span className="text-xs uppercase font-bold text-indigo-200 tracking-widest">Auditoría en Curso</span>
                      <h3 className="text-2xl font-bold">Inventario {countSession.type}</h3>
                    </div>
                    <div className="flex gap-3">
                      <button 
                        onClick={() => setIsScannerOpen(true)}
                        className="flex items-center gap-2 bg-white/20 hover:bg-white/30 backdrop-blur-md text-white px-6 py-3 rounded-xl font-bold transition-all"
                      >
                        <Zap className="w-5 h-5" /> Escanear Ahora
                      </button>
                      <button 
                        onClick={finishCount}
                        className="bg-white text-indigo-600 px-6 py-3 rounded-xl font-bold hover:bg-indigo-50 transition-all shadow-xl"
                      >
                        Finalizar Conteo
                      </button>
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {products.map(p => {
                      const counted = countSession.progress[p.id] || 0;
                      const diff = counted - p.stock;
                      return (
                        <div key={p.id} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
                          <div>
                            <div className="flex justify-between items-start mb-4">
                              <div>
                                <h4 className="font-bold text-slate-800">{p.name}</h4>
                                <p className="text-xs text-slate-400">SKU: {p.sku}</p>
                              </div>
                              <div className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase ${diff === 0 ? 'bg-slate-100 text-slate-600' : diff > 0 ? 'bg-emerald-100 text-emerald-600' : 'bg-rose-100 text-rose-600'}`}>
                                Dif: {diff > 0 ? '+' : ''}{diff}
                              </div>
                            </div>
                            <div className="flex items-center justify-between bg-slate-50 p-4 rounded-xl mb-4">
                              <div className="text-center">
                                <p className="text-[10px] text-slate-400 uppercase font-bold mb-1">En Sistema</p>
                                <p className="text-xl font-bold text-slate-400">{p.stock}</p>
                              </div>
                              <div className="w-px h-8 bg-slate-200"></div>
                              <div className="text-center">
                                <p className="text-[10px] text-indigo-600 uppercase font-bold mb-1">Contado</p>
                                <p className="text-2xl font-bold text-indigo-600">{counted}</p>
                              </div>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <button 
                              onClick={() => handleScanResult(p.sku, 'MANUAL')}
                              className="flex-1 bg-indigo-50 text-indigo-600 py-2 rounded-lg font-bold hover:bg-indigo-100"
                            >
                              +1 Manual
                            </button>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              ) : (
                <div className="grid md:grid-cols-3 gap-8">
                  <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-lg text-center space-y-4">
                    <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mx-auto">
                      <RefreshCw className="w-8 h-8" />
                    </div>
                    <h3 className="text-xl font-bold">Conteos Cíclicos</h3>
                    <p className="text-sm text-slate-500">Rotación diaria de categorías críticas para mantener exactitud continua.</p>
                    <button onClick={() => startCount(InventoryType.CYCLICAL)} className="w-full bg-slate-50 hover:bg-slate-100 py-3 rounded-xl font-bold text-slate-700">Programar Cíclico</button>
                  </div>
                  <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-lg text-center space-y-4">
                    <div className="w-16 h-16 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center mx-auto">
                      <Layers className="w-8 h-8" />
                    </div>
                    <h3 className="text-xl font-bold">Toma Parcial</h3>
                    <p className="text-sm text-slate-500">Auditoría focalizada en una ubicación, pasillo o tipo de producto específico.</p>
                    <button onClick={() => startCount(InventoryType.PARTIAL)} className="w-full bg-slate-50 hover:bg-slate-100 py-3 rounded-xl font-bold text-slate-700">Iniciar Parcial</button>
                  </div>
                  <div className="bg-indigo-600 p-8 rounded-3xl shadow-2xl text-center space-y-4 text-white">
                    <div className="w-16 h-16 bg-white/10 text-white rounded-2xl flex items-center justify-center mx-auto border border-white/20">
                      <ClipboardCheck className="w-8 h-8" />
                    </div>
                    <h3 className="text-xl font-bold">Inventario General</h3>
                    <p className="text-sm text-indigo-100">Cierre fiscal o semestral. Requiere auditoría total de todas las existencias.</p>
                    <button onClick={() => startCount(InventoryType.TOTAL)} className="w-full bg-white text-indigo-600 py-3 rounded-xl font-bold hover:bg-indigo-50 shadow-xl">Comenzar Total</button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Global Floating Action for Scanner (Mobile/Contextual) */}
        {!isScannerOpen && (
          <button 
            onClick={() => setIsScannerOpen(true)}
            className="fixed bottom-8 right-8 bg-indigo-600 text-white p-5 rounded-full shadow-2xl hover:scale-110 active:scale-95 transition-all z-40 group"
          >
            <Zap className="w-8 h-8 group-hover:animate-pulse" />
          </button>
        )}

        {isScannerOpen && (
          <Scanner 
            onScan={handleScanResult} 
            onClose={() => setIsScannerOpen(false)} 
          />
        )}
      </main>

      {/* Helper Icons for Lucide */}
      <style>{`
        .lucide-map-pin { vertical-align: middle; }
      `}</style>
    </div>
  );
};

export default App;
