
import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, 
  Package, 
  ClipboardCheck, 
  Users, 
  LogOut, 
  Search, 
  Zap, 
  RefreshCw,
  Database,
  ShieldAlert,
  Cpu,
  FileText,
  Bell,
  Sparkles,
  // Fix: Added missing icons used in the inventory table and AI insights panel.
  MapPin,
  AlertTriangle,
  CheckCircle2
} from 'lucide-react';
import { Dashboard } from './components/Dashboard';
import { Scanner } from './components/Scanner';
import { UserManagement } from './components/UserManagement';
import { QuotationManager } from './components/QuotationManager';
import { Product, User, UserRole, InventoryType } from './types';
import { getInventoryInsights } from './services/geminiService';
import { dbService } from './services/dbService';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'inventory' | 'counts' | 'admin' | 'quotations'>('dashboard');
  const [products, setProducts] = useState<Product[]>([]);
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [aiInsights, setAiInsights] = useState<any>(null);
  const [isLoadingInsights, setIsLoadingInsights] = useState(false);
  const [isLoadingProducts, setIsLoadingProducts] = useState(true);
  const [isDemoMode, setIsDemoMode] = useState(false);
  const [showAiPanel, setShowAiPanel] = useState(false);
  const [countSession, setCountSession] = useState<{ active: boolean; type: InventoryType; progress: Record<string, number> } | null>(null);

  const currentUser: User = {
    id: 'u1',
    name: 'Carlos Admin',
    email: 'admin@nexus.com',
    role: UserRole.ADMIN,
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Carlos'
  };

  const loadData = async () => {
    setIsLoadingProducts(true);
    const result = await dbService.getProducts();
    setProducts(result.data);
    setIsDemoMode(result.isDemo);
    setIsLoadingProducts(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleFetchInsights = async () => {
    setIsLoadingInsights(true);
    setShowAiPanel(true);
    const insights = await getInventoryInsights(products);
    setAiInsights(insights);
    setIsLoadingInsights(false);
  };

  const startCount = (type: InventoryType) => {
    setCountSession({ active: true, type, progress: {} });
  };

  const handleScanResult = (code: string) => {
    const product = products.find(p => p.sku === code || p.rfidTag === code);
    if (countSession?.active && product) {
      setCountSession(prev => ({
        ...prev!,
        progress: { ...prev!.progress, [product.id]: (prev!.progress[product.id] || 0) + 1 }
      }));
    } else if (product) {
      alert(`Nexus Detectó: ${product.name}\nStock: ${product.stock}\nUbicación: ${product.location}`);
    } else {
      alert(`Código ${code} no registrado.`);
    }
  };

  const finishCount = async () => {
    if (!countSession) return;
    await dbService.syncInventory(currentUser.id, countSession.progress);
    setCountSession(null);
    loadData();
  };

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden font-sans">
      {/* Sidebar - Desktop */}
      <aside className="w-80 bg-white border-r border-slate-200 flex flex-col hidden lg:flex shadow-2xl z-30 no-print">
        <div className="p-8">
          <div className="flex items-center gap-3 mb-10">
            <div className="bg-indigo-600 p-2.5 rounded-2xl shadow-lg shadow-indigo-200">
              <Cpu className="text-white w-7 h-7" />
            </div>
            <div>
              <span className="text-2xl font-black bg-clip-text text-transparent bg-gradient-to-br from-indigo-700 to-indigo-400 tracking-tighter">
                NEXUS AI
              </span>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.2em] -mt-1">Inventory & CRM</p>
            </div>
          </div>

          <nav className="space-y-1.5">
            {[
              { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, roles: null },
              { id: 'inventory', label: 'Stock Central', icon: Package, roles: null },
              { id: 'quotations', label: 'Cotizador Real', icon: FileText, roles: [UserRole.ADMIN, UserRole.MANAGER, UserRole.SELLER] },
              { id: 'counts', label: 'Auditoría Planta', icon: ClipboardCheck, roles: [UserRole.ADMIN, UserRole.WAREHOUSE, UserRole.MANAGER] },
              { id: 'admin', label: 'Gestión Personal', icon: Users, roles: [UserRole.ADMIN] }
            ].map((item) => {
              if (item.roles && !item.roles.includes(currentUser.role)) return null;
              return (
                <button 
                  key={item.id}
                  onClick={() => setActiveTab(item.id as any)}
                  className={`w-full flex items-center gap-4 px-6 py-4 rounded-2xl transition-all duration-300 ${activeTab === item.id ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-100 font-bold translate-x-2' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'}`}
                >
                  <item.icon className={`w-5 h-5 ${activeTab === item.id ? 'text-white' : 'text-slate-400'}`} /> {item.label}
                </button>
              );
            })}
          </nav>
        </div>

        <div className="mt-auto p-8 border-t border-slate-100 bg-slate-50/50">
          <div className="flex items-center gap-4 mb-6 p-3 rounded-2xl bg-white border border-slate-100 shadow-sm">
            <img src={currentUser.avatar} className="w-12 h-12 rounded-xl" alt="avatar" />
            <div className="overflow-hidden">
              <p className="text-sm font-bold text-slate-800 truncate">{currentUser.name}</p>
              <p className="text-[10px] uppercase text-indigo-500 font-black tracking-widest">{currentUser.role}</p>
            </div>
          </div>
          <button className="w-full flex items-center justify-center gap-3 px-4 py-3 text-rose-500 hover:bg-rose-50 rounded-2xl transition-all font-bold text-sm">
            <LogOut className="w-5 h-5" /> Salir del Sistema
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col h-full overflow-hidden relative">
        {/* Header Superior */}
        <header className="h-24 bg-white/70 backdrop-blur-2xl border-b border-slate-200 flex items-center justify-between px-10 sticky top-0 z-20 no-print">
          <div className="flex items-center gap-6 flex-1">
            <div className="relative w-full max-w-md">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
              <input 
                type="text" 
                placeholder="Busca por SKU, tag RFID o nombre..." 
                className="w-full pl-12 pr-4 py-4 bg-slate-100/50 border-none rounded-2xl focus:ring-2 focus:ring-indigo-500 transition-all text-sm outline-none"
              />
            </div>
            
            {isDemoMode ? (
              <div className="flex items-center gap-2 px-4 py-2 bg-amber-50 border border-amber-200 rounded-xl text-amber-700">
                <ShieldAlert className="w-4 h-4" />
                <span className="text-[10px] font-black uppercase tracking-wider">Modo Demo</span>
              </div>
            ) : (
              <div className="flex items-center gap-2 px-4 py-2 bg-emerald-50 border border-emerald-100 rounded-xl text-emerald-700">
                <Database className="w-4 h-4" />
                <span className="text-[10px] font-black uppercase tracking-wider">Cloud Connected</span>
              </div>
            )}
          </div>
          
          <div className="flex items-center gap-4">
            <button 
              onClick={handleFetchInsights}
              disabled={isLoadingInsights}
              className={`flex items-center gap-2 px-8 py-3.5 rounded-2xl text-sm font-black transition-all transform active:scale-95 ${isLoadingInsights ? 'bg-slate-200 text-slate-400 cursor-not-allowed' : 'bg-slate-900 text-white hover:bg-indigo-600 shadow-xl'}`}
            >
              {isLoadingInsights ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4 text-amber-400" />}
              AI INSIGHTS
            </button>
            <div className="relative">
              <button className="p-3.5 bg-white border border-slate-200 rounded-2xl text-slate-400 hover:text-indigo-600 transition-all">
                <Bell className="w-6 h-6" />
                <span className="absolute top-3 right-3 w-2.5 h-2.5 bg-rose-500 border-2 border-white rounded-full"></span>
              </button>
            </div>
          </div>
        </header>

        {/* Workspace */}
        <div className="flex-1 overflow-hidden relative bg-slate-50/50">
          {isLoadingProducts ? (
            <div className="flex flex-col items-center justify-center h-full gap-6">
               <div className="relative">
                 <div className="w-24 h-24 border-[6px] border-indigo-100 border-t-indigo-600 rounded-full animate-spin"></div>
                 <Cpu className="absolute inset-0 m-auto w-10 h-10 text-indigo-600 animate-pulse" />
               </div>
               <div className="text-center">
                 <p className="font-black text-slate-800 uppercase tracking-[0.4em] text-sm">Nexus AI</p>
                 <p className="text-slate-400 text-xs mt-1">Sincronizando flujos de trabajo...</p>
               </div>
            </div>
          ) : (
            <div className="h-full overflow-y-auto pb-32 px-10 pt-10 print:p-0 print:overflow-visible custom-scrollbar">
              {activeTab === 'dashboard' && <Dashboard products={products} movements={[]} />}
              {activeTab === 'quotations' && <QuotationManager products={products} userId={currentUser.id} />}
              
              {activeTab === 'inventory' && (
                <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-500">
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                      <h2 className="text-4xl font-black text-slate-900 tracking-tighter">Stock Central</h2>
                      <p className="text-slate-500">Monitoreo de existencias y valorización de almacén.</p>
                    </div>
                  </div>
                  
                  <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-100 overflow-hidden">
                    <table className="w-full text-left">
                      <thead>
                        <tr className="bg-slate-50 border-b border-slate-100">
                          <th className="px-10 py-6 text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">Producto</th>
                          <th className="px-10 py-6 text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">SKU / Tag</th>
                          <th className="px-10 py-6 text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">Categoría</th>
                          <th className="px-10 py-6 text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">Estado</th>
                          <th className="px-10 py-6 text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] text-right">Existencia</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-50">
                        {products.map(p => (
                          <tr key={p.id} className="hover:bg-slate-50/50 transition-all group">
                            <td className="px-10 py-7">
                              <p className="font-bold text-slate-800 text-lg tracking-tight group-hover:text-indigo-600 transition-colors">{p.name}</p>
                              <p className="text-xs text-slate-400 flex items-center gap-1 mt-0.5"><MapPin className="w-3 h-3" /> {p.location}</p>
                            </td>
                            <td className="px-10 py-7">
                              <div className="space-y-1">
                                <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-1 rounded font-mono font-bold block w-fit">{p.sku}</span>
                                <span className="text-[10px] bg-indigo-50 text-indigo-600 px-2 py-1 rounded font-mono font-bold block w-fit">{p.rfidTag}</span>
                              </div>
                            </td>
                            <td className="px-10 py-7">
                               <span className="text-sm font-medium text-slate-600">{p.category}</span>
                            </td>
                            <td className="px-10 py-7">
                               {p.stock <= p.minStock ? (
                                 <span className="inline-flex items-center gap-1.5 text-rose-600 font-bold text-xs uppercase bg-rose-50 px-3 py-1.5 rounded-full">
                                   <Zap className="w-3 h-3" /> Crítico
                                 </span>
                               ) : (
                                 <span className="inline-flex items-center gap-1.5 text-emerald-600 font-bold text-xs uppercase bg-emerald-50 px-3 py-1.5 rounded-full">
                                   <Database className="w-3 h-3" /> Saludable
                                 </span>
                               )}
                            </td>
                            <td className="px-10 py-7 text-right">
                              <p className="text-2xl font-black text-slate-900">{p.stock}</p>
                              <p className="text-[10px] text-slate-400 font-bold uppercase">Mín: {p.minStock}</p>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {activeTab === 'counts' && (
                <div className="space-y-10 animate-in fade-in duration-500">
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                      <h2 className="text-4xl font-black text-slate-900 tracking-tighter">Auditoría Física</h2>
                      <p className="text-slate-500">Sincroniza el inventario real con la base de datos central.</p>
                    </div>
                  </div>
                  
                  {countSession ? (
                    <div className="space-y-8">
                      <div className="bg-slate-900 text-white p-12 rounded-[3rem] shadow-2xl flex flex-col md:flex-row items-center justify-between gap-8 border border-slate-800">
                         <div className="flex items-center gap-6">
                           <div className="bg-indigo-600 p-5 rounded-[2rem] animate-pulse">
                              <ClipboardCheck className="w-10 h-10" />
                           </div>
                           <div>
                             <p className="text-indigo-400 font-black text-xs uppercase tracking-widest mb-1">Sesión Activa</p>
                             <h3 className="text-4xl font-black tracking-tighter">Conteo {countSession.type}</h3>
                           </div>
                         </div>
                         <div className="flex gap-4">
                           <button onClick={finishCount} className="bg-indigo-600 text-white px-10 py-5 rounded-[2rem] font-black shadow-lg shadow-indigo-500/20 hover:scale-105 transition-all">Sincronizar Almacén</button>
                           <button onClick={() => setCountSession(null)} className="bg-white/10 hover:bg-rose-600 text-white px-8 py-5 rounded-[2rem] font-black transition-all">Cancelar</button>
                         </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {products.map(p => (
                           <div key={p.id} className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm flex flex-col justify-between group hover:shadow-xl transition-all">
                              <div>
                                <h4 className="font-black text-slate-800 text-xl tracking-tight leading-tight mb-2">{p.name}</h4>
                                <div className="flex gap-2">
                                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{p.sku}</span>
                                  <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest">{p.location}</span>
                                </div>
                              </div>
                              <div className="my-8 flex items-center justify-center">
                                 <div className="text-center">
                                   <p className="text-6xl font-black text-indigo-600 tabular-nums">{countSession.progress[p.id] || 0}</p>
                                   <p className="text-[10px] text-slate-400 font-black uppercase mt-2">Unidades Escaneadas</p>
                                 </div>
                              </div>
                              <button 
                                onClick={() => handleScanResult(p.sku)} 
                                className="w-full py-5 bg-slate-100 group-hover:bg-indigo-600 group-hover:text-white text-slate-600 rounded-[2rem] font-black transition-all flex items-center justify-center gap-2"
                              >
                                <Zap className="w-5 h-5" /> Capturar Manual
                              </button>
                           </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
                      <div className="bg-white p-12 rounded-[3.5rem] border border-slate-100 shadow-xl group hover:border-indigo-200 transition-all text-center">
                        <div className="w-24 h-24 bg-blue-50 text-blue-600 rounded-[2.5rem] flex items-center justify-center mx-auto mb-8 group-hover:scale-110 transition-transform">
                          <RefreshCw className="w-10 h-10" />
                        </div>
                        <h3 className="text-2xl font-black text-slate-900 tracking-tighter mb-4">Cíclico A/B/C</h3>
                        <p className="text-slate-500 mb-8 leading-relaxed">Conteo rotativo basado en la importancia comercial y volumen de stock.</p>
                        <button onClick={() => startCount(InventoryType.CYCLICAL)} className="w-full py-5 bg-blue-600 text-white rounded-3xl font-black shadow-lg shadow-blue-100">Iniciar Auditoría</button>
                      </div>

                      <div className="bg-slate-900 p-12 rounded-[3.5rem] shadow-2xl relative overflow-hidden group text-center">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-600/20 blur-3xl rounded-full translate-x-10 -translate-y-10"></div>
                        <div className="w-24 h-24 bg-indigo-600 text-white rounded-[2.5rem] flex items-center justify-center mx-auto mb-8">
                          <Database className="w-10 h-10" />
                        </div>
                        <h3 className="text-2xl font-black text-white tracking-tighter mb-4">Gran Inventario</h3>
                        <p className="text-indigo-200/60 mb-8 leading-relaxed">Auditoría completa de todas las ubicaciones y pasillos de la planta.</p>
                        <button onClick={() => startCount(InventoryType.TOTAL)} className="w-full py-5 bg-white text-slate-900 rounded-3xl font-black shadow-xl">Auditar Todo</button>
                      </div>

                      <div className="bg-white p-12 rounded-[3.5rem] border border-slate-100 shadow-xl group hover:border-amber-200 transition-all text-center">
                        <div className="w-24 h-24 bg-amber-50 text-amber-600 rounded-[2.5rem] flex items-center justify-center mx-auto mb-8 group-hover:scale-110 transition-transform">
                          <Package className="w-10 h-10" />
                        </div>
                        <h3 className="text-2xl font-black text-slate-900 tracking-tighter mb-4">Parcial Express</h3>
                        <p className="text-slate-500 mb-8 leading-relaxed">Validación rápida por pasillo o categoría específica de productos.</p>
                        <button onClick={() => startCount(InventoryType.PARTIAL)} className="w-full py-5 bg-amber-600 text-white rounded-3xl font-black shadow-lg shadow-amber-100">Abrir Sesión</button>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'admin' && <UserManagement />}
            </div>
          )}
        </div>

        {/* Panel Lateral de IA (Gemini) */}
        {showAiPanel && (
          <div className="fixed top-0 right-0 h-full w-[400px] bg-white border-l border-slate-200 shadow-[0_0_100px_rgba(0,0,0,0.1)] z-50 flex flex-col animate-in slide-in-from-right duration-500 no-print">
            <div className="p-8 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Sparkles className="w-6 h-6 text-indigo-600 animate-pulse" />
                <h3 className="font-black text-xl tracking-tighter">Nexus Intelligence</h3>
              </div>
              <button onClick={() => setShowAiPanel(false)} className="p-2 hover:bg-slate-100 rounded-xl transition-colors">
                <LayoutDashboard className="w-5 h-5 text-slate-400" />
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-8 space-y-8 custom-scrollbar">
              {isLoadingInsights ? (
                <div className="space-y-4">
                  {[1, 2, 3].map(i => (
                    <div key={i} className="h-24 bg-slate-50 rounded-2xl animate-pulse"></div>
                  ))}
                </div>
              ) : aiInsights ? (
                <>
                  <section>
                    <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Riesgos de Stock</h4>
                    <div className="space-y-3">
                      {aiInsights.riskProducts.map((p: any, i: number) => (
                        <div key={i} className="p-4 bg-rose-50 border border-rose-100 rounded-2xl flex items-start gap-3">
                          <AlertTriangle className="w-5 h-5 text-rose-500 shrink-0" />
                          <div>
                            <p className="text-sm font-bold text-rose-900">{p.sku}</p>
                            <p className="text-xs text-rose-700 leading-relaxed">{p.reason}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </section>
                  <section>
                    <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Recomendaciones</h4>
                    <ul className="space-y-3">
                      {aiInsights.recommendations.map((rec: string, i: number) => (
                        <li key={i} className="p-4 bg-indigo-50 border border-indigo-100 rounded-2xl flex items-start gap-3">
                          <CheckCircle2 className="w-5 h-5 text-indigo-500 shrink-0" />
                          <p className="text-xs text-indigo-800 font-medium leading-relaxed">{rec}</p>
                        </li>
                      ))}
                    </ul>
                  </section>
                </>
              ) : (
                <div className="text-center py-20 text-slate-400">Hubo un error al generar insights.</div>
              )}
            </div>
          </div>
        )}

        {/* Controles Flotantes Globales */}
        {!isScannerOpen && !isLoadingProducts && (
          <div className="fixed bottom-10 right-10 flex flex-col gap-4 z-40 no-print">
            <button 
              onClick={() => setIsScannerOpen(true)}
              className="bg-slate-900 text-white p-7 rounded-[2.5rem] shadow-2xl shadow-slate-400 hover:scale-110 active:scale-95 transition-all"
            >
              <Zap className="w-10 h-10" />
            </button>
          </div>
        )}

        {isScannerOpen && (
          <Scanner 