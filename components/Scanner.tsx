
import React, { useState, useRef, useEffect } from 'react';
import { Camera, X, Scan, Zap, Box } from 'lucide-react';

interface ScannerProps {
  onScan: (code: string, type: 'BARCODE' | 'QR' | 'RFID') => void;
  onClose: () => void;
}

export const Scanner: React.FC<ScannerProps> = ({ onScan, onClose }) => {
  const [mode, setMode] = useState<'BARCODE' | 'RFID'>('BARCODE');
  const [simulatedCode, setSimulatedCode] = useState('');
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (mode === 'BARCODE') {
      navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } })
        .then(stream => {
          if (videoRef.current) videoRef.current.srcObject = stream;
        })
        .catch(err => console.error("Camera Error:", err));
    }
  }, [mode]);

  const handleSimulateScan = () => {
    if (simulatedCode) {
      onScan(simulatedCode, mode === 'BARCODE' ? 'BARCODE' : 'RFID');
      setSimulatedCode('');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="bg-slate-900 w-full max-w-lg rounded-2xl overflow-hidden shadow-2xl border border-slate-700">
        <div className="p-4 flex items-center justify-between border-b border-slate-700">
          <h3 className="text-white font-bold flex items-center gap-2">
            <Scan className="w-5 h-5 text-indigo-400" />
            Centro de Escaneo
          </h3>
          <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6">
          <div className="flex bg-slate-800 p-1 rounded-lg mb-6">
            <button 
              onClick={() => setMode('BARCODE')}
              className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-md transition-all ${mode === 'BARCODE' ? 'bg-indigo-600 text-white' : 'text-slate-400'}`}
            >
              <Camera className="w-4 h-4" /> Barcode/QR
            </button>
            <button 
              onClick={() => setMode('RFID')}
              className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-md transition-all ${mode === 'RFID' ? 'bg-indigo-600 text-white' : 'text-slate-400'}`}
            >
              <Zap className="w-4 h-4" /> RFID
            </button>
          </div>

          <div className="relative aspect-video bg-black rounded-xl overflow-hidden border border-slate-700 mb-6 group">
            {mode === 'BARCODE' ? (
              <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover opacity-60" />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center text-slate-500">
                <Zap className="w-16 h-16 mb-4 animate-pulse text-indigo-500" />
                <p>Buscando señales RFID cercanas...</p>
              </div>
            )}
            <div className="absolute inset-0 border-2 border-indigo-500/50 rounded-xl m-8 pointer-events-none animate-pulse"></div>
            <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.8)] animate-bounce"></div>
          </div>

          <div className="space-y-4">
            <label className="text-sm text-slate-400 uppercase tracking-wider font-semibold">Simular Lectura Manual</label>
            <div className="flex gap-2">
              <input 
                type="text" 
                value={simulatedCode}
                onChange={(e) => setSimulatedCode(e.target.value)}
                placeholder={mode === 'BARCODE' ? "SKU o Código..." : "Tag RFID..."}
                className="flex-1 bg-slate-800 border border-slate-700 text-white px-4 py-3 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
              />
              <button 
                onClick={handleSimulateScan}
                className="bg-indigo-600 hover:bg-indigo-500 text-white px-6 py-3 rounded-xl font-bold transition-all"
              >
                Capturar
              </button>
            </div>
          </div>
        </div>
        
        <div className="p-4 bg-slate-800/50 text-center text-xs text-slate-500">
          Compatible con Honeywell, Zebra y lectores USB HID externos.
        </div>
      </div>
    </div>
  );
};
