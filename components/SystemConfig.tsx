
import React, { useState } from 'react';
import { BusinessConfig } from '../types';
import { dbService } from '../services/dbService';
import { 
  Building2, 
  Save, 
  Image as ImageIcon, 
  Globe, 
  Percent, 
  MapPin, 
  Phone, 
  Mail, 
  FileText,
  CheckCircle2
} from 'lucide-react';

interface SystemConfigProps {
  config: BusinessConfig;
  onUpdate: (newConfig: BusinessConfig) => void;
}

export const SystemConfig: React.FC<SystemConfigProps> = ({ config, onUpdate }) => {
  const [formData, setFormData] = useState<BusinessConfig>(config);
  const [isSaving, setIsSaving] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    await dbService.saveConfig(formData);
    onUpdate(formData);
    setIsSaving(false);
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 3000);
  };

  return (
    <div className="p-8 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-black text-slate-900 tracking-tighter">Identidad del Negocio</h2>
          <p className="text-slate-500">Configura los datos que aparecerán en tus documentos y reportes.</p>
        </div>
        {showSuccess && (
          <div className="flex items-center gap-2 bg-emerald-50 text-emerald-600 px-4 py-2 rounded-xl font-bold animate-in fade-in zoom-in">
            <CheckCircle2 className="w-5 h-5" /> Configuración Guardada
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Lado Izquierdo: Branding */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm space-y-6">
            <h3 className="text-lg font-bold flex items-center gap-2 text-slate-800">
              <ImageIcon className="w-5 h-5 text-indigo-500" /> Branding
            </h3>
            
            <div className="flex flex-col items-center gap-4">
              <div className="w-32 h-32 bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200 flex items-center justify-center overflow-hidden group relative">
                {formData.logo ? (
                  <img src={formData.logo} alt="Logo" className="w-full h-full object-contain p-2" />
                ) : (
                  <ImageIcon className="w-10 h-10 text-slate-300" />
                )}
              </div>
              <div className="w-full">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">URL del Logo</label>
                <input 
                  type="text" 
                  value={formData.logo}
                  onChange={e => setFormData({...formData, logo: e.target.value})}
                  className="w-full mt-2 px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none text-xs"
                  placeholder="https://..."
                />
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Nombre del Negocio</label>
                <input 
                  type="text" 
                  value={formData.name}
                  onChange={e => setFormData({...formData, name: e.target.value})}
                  className="w-full mt-2 px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none font-bold"
                />
              </div>
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Eslogan / Lema</label>
                <input 
                  type="text" 
                  value={formData.slogan}
                  onChange={e => setFormData({...formData, slogan: e.target.value})}
                  className="w-full mt-2 px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none text-sm"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Lado Derecho: Datos Fiscales y Contacto */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-6">
                <h3 className="text-lg font-bold flex items-center gap-2 text-slate-800">
                  <Building2 className="w-5 h-5 text-indigo-500" /> Información Fiscal
                </h3>
                <div className="space-y-4">
                  <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Identificación Fiscal (RFC/NIT)</label>
                    <input 
                      type="text" 
                      value={formData.taxId}
                      onChange={e => setFormData({...formData, taxId: e.target.value})}
                      className="w-full mt-2 px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1">
                        <Globe className="w-3 h-3" /> Moneda
                      </label>
                      <input 
                        type="text" 
                        value={formData.currency}
                        onChange={e => setFormData({...formData, currency: e.target.value})}
                        className="w-full mt-2 px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none"
                        placeholder="MXN, USD, EUR..."
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1">
                        <Percent className="w-3 h-3" /> IVA (%)
                      </label>
                      <input 
                        type="number" 
                        value={formData.taxPercentage}
                        onChange={e => setFormData({...formData, taxPercentage: Number(e.target.value)})}
                        className="w-full mt-2 px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <h3 className="text-lg font-bold flex items-center gap-2 text-slate-800">
                  <MapPin className="w-5 h-5 text-indigo-500" /> Contacto
                </h3>
                <div className="space-y-4">
                  <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Dirección Física</label>
                    <input 
                      type="text" 
                      value={formData.address}
                      onChange={e => setFormData({...formData, address: e.target.value})}
                      className="w-full mt-2 px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1">
                      <Phone className="w-3 h-3" /> Teléfono
                    </label>
                    <input 
                      type="text" 
                      value={formData.phone}
                      onChange={e => setFormData({...formData, phone: e.target.value})}
                      className="w-full mt-2 px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1">
                      <Mail className="w-3 h-3" /> Email
                    </label>
                    <input 
                      type="email" 
                      value={formData.email}
                      onChange={e => setFormData({...formData, email: e.target.value})}
                      className="w-full mt-2 px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-8 pt-8 border-t border-slate-100">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1">
                <FileText className="w-3 h-3" /> Pie de Página de Cotizaciones
              </label>
              <textarea 
                value={formData.quotationFooter}
                onChange={e => setFormData({...formData, quotationFooter: e.target.value})}
                rows={3}
                className="w-full mt-2 px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none text-sm resize-none"
                placeholder="Términos, condiciones, validez..."
              />
            </div>
          </div>

          <div className="flex justify-end">
            <button 
              type="submit"
              disabled={isSaving}
              className="flex items-center gap-3 bg-indigo-600 text-white px-12 py-5 rounded-[2rem] font-black shadow-2xl shadow-indigo-100 hover:scale-105 active:scale-95 transition-all disabled:opacity-50"
            >
              <Save className="w-5 h-5" /> {isSaving ? 'Guardando...' : 'Aplicar Cambios'}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};
