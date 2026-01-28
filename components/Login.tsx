
import React, { useState } from 'react';
import { ShieldCheck, Zap, ChevronRight, Cpu, LayoutDashboard, Globe } from 'lucide-react';
import { useThemeStore } from '../store/useThemeStore';

interface LoginProps {
  onEnter: () => void;
}

export const Login: React.FC<LoginProps> = ({ onEnter }) => {
  const { theme } = useThemeStore();
  const [isStarting, setIsStarting] = useState(false);

  const handleStart = () => {
    setIsStarting(true);
    setTimeout(() => {
      onEnter();
    }, 800);
  };

  const logoUrl = theme === 'light' 
    ? 'https://i.imgur.com/JU8v63w.png' 
    : 'https://i.imgur.com/UVeg7Nr.png';

  return (
    <div className={`fixed inset-0 z-[200] flex flex-col items-center justify-center p-6 transition-all duration-700 ${
      isStarting ? 'opacity-0 scale-110 pointer-events-none' : 'opacity-100 scale-100'
    } ${theme === 'light' ? 'bg-slate-50' : 'bg-slate-950'}`}>
      
      {/* Background Decorativo - Apenas Desktop/Tablet */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-20 hidden md:block">
        <div className="absolute top-10 left-10 flex flex-col gap-2 font-mono text-[10px] text-emerald-500/40 uppercase tracking-widest">
          <span>LAT: -23.5505</span>
          <span>LNG: -46.6333</span>
          <span>SYS_STATUS: READY</span>
        </div>
        <div className="absolute bottom-10 right-10 flex flex-col gap-2 font-mono text-[10px] text-blue-500/40 uppercase tracking-widest text-right">
          <span>COCKPIT_V: 1.0.4</span>
          <span>ENCRYPT: AES-256</span>
          <span>CONNECTION: STABLE</span>
        </div>
      </div>

      <div className="max-w-md w-full text-center space-y-12 relative z-10">
        {/* Logo & Branding */}
        <div className="space-y-6 animate-in fade-in zoom-in duration-1000">
          <div className="relative inline-block">
             <div className="absolute inset-0 bg-emerald-500/20 blur-3xl rounded-full scale-150 animate-pulse"></div>
             <img src={logoUrl} alt="Logo" className="h-24 md:h-32 w-auto mx-auto object-contain relative z-10" />
          </div>
          <div className="space-y-2">
            <h1 className={`text-4xl md:text-5xl font-black tracking-tighter uppercase leading-none ${theme === 'light' ? 'text-slate-900' : 'text-slate-100'}`}>
              PM Command <span className="text-emerald-500">Center</span>
            </h1>
            <p className="text-[10px] md:text-xs font-black uppercase tracking-[0.4em] text-slate-500 opacity-80">
              Operative Intelligence System
            </p>
          </div>
        </div>

        {/* Features Grid - Minimalista para Mobile */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-300">
          {[
            { icon: ShieldCheck, label: 'Secure' },
            { icon: Zap, label: 'Fast' },
            { icon: Globe, label: 'Global' }
          ].map((item, i) => (
            <div key={i} className={`p-4 rounded-2xl border flex flex-col items-center gap-2 ${
              theme === 'light' ? 'bg-white border-slate-200' : 'bg-slate-900/50 border-slate-800'
            }`}>
              <item.icon className="text-emerald-500" size={18} />
              <span className="text-[9px] font-black uppercase tracking-widest text-slate-500">{item.label}</span>
            </div>
          ))}
        </div>

        {/* Action Button */}
        <div className="pt-8 animate-in fade-in slide-in-from-bottom-12 duration-1000 delay-500">
          <button 
            onClick={handleStart}
            className="group w-full md:w-auto bg-emerald-600 hover:bg-emerald-500 text-white px-10 py-5 rounded-[24px] font-black text-sm uppercase tracking-[0.2em] transition-all shadow-2xl shadow-emerald-600/30 active:scale-95 flex items-center justify-center gap-3 mx-auto"
          >
            Iniciar Operação
            <ChevronRight className="group-hover:translate-x-1 transition-transform" size={20} strokeWidth={3} />
          </button>
          
          <p className="mt-8 text-[9px] font-black uppercase tracking-[0.2em] text-slate-600">
            Acesso autorizado para gestores de projetos
          </p>
        </div>
      </div>

      {/* Footer Mobile Friendly */}
      <footer className="absolute bottom-8 text-center w-full px-6 md:px-0">
        <div className={`h-1 w-24 mx-auto rounded-full mb-4 ${theme === 'light' ? 'bg-slate-200' : 'bg-slate-800'}`}></div>
        <p className="text-[9px] text-slate-500 font-bold uppercase tracking-widest opacity-40">
          © 2024 PM AI Partner • High-Performance Cockpit
        </p>
      </footer>
    </div>
  );
};
