
import React, { useState, useMemo, useEffect } from 'react';
import { Product, QuotationItem, BusinessConfig } from '../types';
import { dbService } from '../services/dbService';
import { 
  Plus, 
  Trash2, 
  Printer, 
  MessageSquare, 
  User as UserIcon, 
  Phone, 
  Search,
  ShoppingCart,
  CreditCard,
  Cpu,
  MapPin,
  Mail
} from 'lucide-react';

interface QuotationManagerProps {
  products: Product[];
  userId: string;
}

export const QuotationManager: React.FC<QuotationManagerProps> = ({ products, userId }) => {
  const [customer, setCustomer] = useState({ name: '', phone: '' });
  const [items, setItems] = useState<QuotationItem[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [bizConfig, setBizConfig] = useState<BusinessConfig | null>(null);

  useEffect(() => {
    dbService.getConfig().then(setBizConfig);
  }, []);

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    p.sku.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const subtotal = useMemo(() => items.reduce((acc, item) => acc + item.subtotal, 0), [items]);
  const taxRate = bizConfig?.taxPercentage || 16;
  const tax = subtotal * (taxRate / 100);
  const total = subtotal + tax;

  const addItem = (product: Product) => {
    const existing = items.find(i => i.productId === product.id);
    if (existing) {
      setItems(items.map(i => i.productId === product.id ? 
        { ...i, quantity: i.quantity + 1, subtotal: (i.quantity + 1) * i.unitPrice } : i
      ));
    } else {
      setItems([...items, {
        id: Math.random().toString(36),
        productId: product.id,
        productName: product.name,
        quantity: 1,
        unitPrice: product.price,
        subtotal: product.price
      }]);
    }
  };

  const removeItem = (id: string) => {
    setItems(items.filter(i => i.id !== id));
  };

  const updateQuantity = (id: string, qty: number) => {
    if (qty < 1) return;
    setItems(items.map(i => i.id === id ? 
      { ...i, quantity: qty, subtotal: qty * i.unitPrice } : i
    ));
  };

  const handleSave = async () => {
    if (!customer.name || items.length === 0) {
      alert("Por favor ingrese el nombre del cliente y al menos un producto.");
      return;
    }
    setIsProcessing(true);
    const result = await dbService.createQuotation({
      ...customer,
      total,
      userId,
      items
    });
    if (result.success) {
      alert("Cotización generada con éxito.");
    }
    setIsProcessing(false);
  };

  const sendWhatsApp = () => {
    const message = `Hola ${customer.name}, te envío la cotización de ${bizConfig?.name}:%0A%0A` + 
      items.map(i => `- ${i.productName} (${i.quantity} x $${i.unitPrice}) = $${i.subtotal}`).join('%0A') +
      `%0A%0A*Total con IVA: $${total.toLocaleString()} ${bizConfig?.currency}*%0A%0AGracias por tu preferencia.`;
    
    const url = `https://wa.me/${customer.phone.replace(/\s+/g, '')}?text=${message}`;
    window.open(url, '_blank');
  };

  const printPDF = () => {
    window.print();
  };

  if (!bizConfig) return null;

  return (
    <div className="p-8 space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-200 pb-8">
        <div>
          <h2 className="text-3xl font-black text-slate-900 tracking-tighter">Nueva Cotización</h2>
          <p className="text-slate-500">Genera propuestas automáticas usando tu identidad corporativa.</p>
        </div>
        <div className="flex gap-3 no-print">
          <button 
            onClick={sendWhatsApp}
            disabled={items.length === 0}
            className="flex items-center gap-2 bg-emerald-600 text-white px-6 py-3 rounded-2xl font-bold hover:bg-emerald-500 transition-all shadow-lg shadow-emerald-100 disabled:opacity-50"
          >
            <MessageSquare className="w-5 h-5" /> WhatsApp
          </button>
          <button 
            onClick={printPDF}
            disabled={items.length === 0}
            className="flex items-center gap-2 bg-slate-800 text-white px-6 py-3 rounded-2xl font-bold hover:bg-slate-700 transition-all shadow-lg disabled:opacity-50"
          >
            <Printer className="w-5 h-5" /> Imprimir PDF
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1 space-y-6 no-print">
          <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm space-y-6">
            <h3 className="text-lg font-bold flex items-center gap-2 text-slate-800">
              <UserIcon className="w-5 h-5 text-indigo-500" /> Datos del Cliente
            </h3>
            <div className="space-y-4">
              <div>
                <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Nombre / Empresa</label>
                <input 
                  type="text" 
                  value={customer.name}
                  onChange={e => setCustomer({...customer, name: e.target.value})}
                  className="w-full mt-2 px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                  placeholder="Ej: Constructora Global"
                />
              </div>
              <div>
                <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Teléfono (WhatsApp)</label>
                <input 
                  type="tel" 
                  value={customer.phone}
                  onChange={e => setCustomer({...customer, phone: e.target.value})}
                  className="w-full mt-2 px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                  placeholder="Ej: +52 1 555 123 4567"
                />
              </div>
            </div>
          </div>

          <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm space-y-6">
            <h3 className="text-lg font-bold flex items-center gap-2 text-slate-800">
              <ShoppingCart className="w-5 h-5 text-indigo-500" /> Catálogo
            </h3>
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
              <input 
                type="text" 
                placeholder="Buscar producto..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-slate-50 border-none rounded-2xl text-sm focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div className="max-h-[300px] overflow-y-auto space-y-2 pr-2 custom-scrollbar">
              {filteredProducts.map(p => (
                <button 
                  key={p.id}
                  onClick={() => addItem(p)}
                  className="w-full flex items-center justify-between p-4 bg-slate-50 hover:bg-indigo-50 rounded-2xl transition-all border border-transparent hover:border-indigo-100 group text-left"
                >
                  <div>
                    <p className="font-bold text-slate-800 group-hover:text-indigo-600 transition-colors">{p.name}</p>
                    <p className="text-[10px] text-slate-400 font-mono">{p.sku}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-black text-indigo-600">${p.price} {bizConfig.currency}</p>
                    <Plus className="w-4 h-4 text-indigo-300 ml-auto" />
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="lg:col-span-2">
          <div id="print-area" className="bg-white p-10 rounded-[2.5rem] border border-slate-100 shadow-xl min-h-[600px] flex flex-col print:shadow-none print:border-none print:p-0">
            {/* Header Corporativo del PDF */}
            <div className="flex justify-between items-start mb-12 border-b border-slate-50 pb-8">
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  {bizConfig.logo ? (
                    <img src={bizConfig.logo} alt="Logo" className="h-16 w-16 object-contain" />
                  ) : (
                    <Cpu className="w-12 h-12 text-indigo-600" />
                  )}
                  <div>
                    <span className="text-2xl font-black tracking-tighter text-slate-900 block uppercase">{bizConfig.name}</span>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{bizConfig.slogan}</span>
                  </div>
                </div>
                <div className="text-[10px] text-slate-500 space-y-1">
                   <p className="flex items-center gap-2"><MapPin className="w-3 h-3 text-indigo-400" /> {bizConfig.address}</p>
                   <p className="flex items-center gap-2"><Phone className="w-3 h-3 text-indigo-400" /> {bizConfig.phone}</p>
                   <p className="flex items-center gap-2"><Mail className="w-3 h-3 text-indigo-400" /> {bizConfig.email}</p>
                   <p className="font-black text-slate-800 mt-2 uppercase">RFC/TAX ID: {bizConfig.taxId}</p>
                </div>
              </div>
              <div className="text-right">
                <h1 className="text-4xl font-black text-slate-900 tracking-tighter mb-2">PROPUESA</h1>
                <p className="text-xs font-mono text-slate-400 uppercase tracking-widest">Ref: #QT-{Date.now().toString().slice(-6)}</p>
                <p className="text-xs text-slate-500 mt-1">{new Date().toLocaleDateString('es-MX', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                
                <div className="mt-8 text-right bg-slate-50 p-4 rounded-2xl">
                   <p className="text-[10px] font-black text-slate-400 uppercase mb-1">Dirigido a:</p>
                   <p className="text-sm font-bold text-slate-800">{customer.name || 'CLIENTE FINAL'}</p>
                   <p className="text-xs text-slate-500">{customer.phone}</p>
                </div>
              </div>
            </div>

            <div className="flex-1">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b-2 border-slate-100">
                    <th className="py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Concepto</th>
                    <th className="py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Cant.</th>
                    <th className="py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Unitario</th>
                    <th className="py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Total</th>
                    <th className="py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right no-print"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {items.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-20 text-center text-slate-300 font-medium italic">Seleccione productos del catálogo a la izquierda</td>
                    </tr>
                  ) : items.map(item => (
                    <tr key={item.id} className="group">
                      <td className="py-6">
                        <p className="font-bold text-slate-800">{item.productName}</p>
                        <p className="text-[10px] text-slate-400">SKU Ref: {item.productId.slice(0, 8)}</p>
                      </td>
                      <td className="py-6 text-center">
                        <div className="flex items-center justify-center gap-2 no-print">
                          <button onClick={() => updateQuantity(item.id, item.quantity - 1)} className="w-6 h-6 rounded-lg bg-slate-100 flex items-center justify-center hover:bg-indigo-100 transition-colors">-</button>
                          <span className="font-bold text-slate-800 w-8 text-center">{item.quantity}</span>
                          <button onClick={() => updateQuantity(item.id, item.quantity + 1)} className="w-6 h-6 rounded-lg bg-slate-100 flex items-center justify-center hover:bg-indigo-100 transition-colors">+</button>
                        </div>
                        <span className="print-only font-bold">{item.quantity}</span>
                      </td>
                      <td className="py-6 text-right font-medium text-slate-600">${item.unitPrice.toLocaleString()}</td>
                      <td className="py-6 text-right font-black text-slate-900">${item.subtotal.toLocaleString()}</td>
                      <td className="py-6 text-right no-print">
                        <button onClick={() => removeItem(item.id)} className="p-2 text-slate-300 hover:text-rose-500 transition-all opacity-0 group-hover:opacity-100">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="mt-12 pt-8 border-t-2 border-slate-100 flex flex-col items-end space-y-2">
              <div className="flex justify-between w-72 text-sm">
                <span className="text-slate-500 font-medium">Subtotal</span>
                <span className="text-slate-800 font-bold">${subtotal.toLocaleString()} {bizConfig.currency}</span>
              </div>
              <div className="flex justify-between w-72 text-sm">
                <span className="text-slate-500 font-medium">IVA ({bizConfig.taxPercentage}%)</span>
                <span className="text-slate-800 font-bold">${tax.toLocaleString()} {bizConfig.currency}</span>
              </div>
              <div className="flex justify-between w-72 pt-4 border-t border-slate-100">
                <span className="text-indigo-600 font-black text-xl uppercase tracking-tighter">TOTAL NETO</span>
                <span className="text-slate-900 font-black text-2xl">${total.toLocaleString()} {bizConfig.currency}</span>
              </div>
            </div>

            <div className="mt-20 text-center border-t border-slate-50 pt-8">
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.3em] mb-4">Nexus AI Powered Document</p>
              <div className="max-w-md mx-auto">
                 <p className="text-[10px] text-slate-400 leading-relaxed italic">{bizConfig.quotationFooter}</p>
              </div>
            </div>
          </div>

          <div className="mt-6 flex justify-end no-print">
             <button 
              onClick={handleSave}
              disabled={isProcessing || items.length === 0}
              className="flex items-center gap-3 bg-indigo-600 text-white px-10 py-4 rounded-[2rem] font-black shadow-2xl shadow-indigo-200 hover:scale-105 active:scale-95 transition-all disabled:opacity-50"
            >
              <CreditCard className="w-5 h-5" /> {isProcessing ? 'Procesando...' : 'Guardar en Sistema'}
            </button>
          </div>
        </div>
      </div>

      <style>{`
        @media print {
          .no-print { display: none !important; }
          .print-only { display: inline-block !important; }
          body { background: white !important; padding: 0 !important; }
          main { overflow: visible !important; }
          aside { display: none !important; }
          #root { height: auto !important; }
          #print-area { border: none !important; padding: 0 !important; box-shadow: none !important; }
        }
        .print-only { display: none; }
      `}</style>
    </div>
  );
};
