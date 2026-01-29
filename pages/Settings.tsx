
import React, { useState } from 'react';
import { useSettingsStore } from '../store/useSettingsStore';
import { useThemeStore } from '../store/useThemeStore';
import { AGENTS_DEFINITIONS } from '../constants';
import { 
  Cpu, 
  Check, 
  Key,
  ExternalLink,
  ChevronDown,
  Lock,
  Zap,
  AlertCircle,
  ShieldCheck,
  ShieldAlert,
  Eye,
  EyeOff,
  Save,
  Link as LinkIcon
} from 'lucide-react';
import { AgentId } from '../types';

const GOOGLE_MODELS = [
  { id: 'gemini-3-pro-preview', name: 'Gemini 3 Pro (Complexo)', type: 'text', requiresBilling: true },
  { id: 'gemini-3-flash-preview', name: 'Gemini 3 Flash (Rápido)', type: 'text', requiresBilling: false },
  { id: 'gemini-3-pro-image-preview', name: 'Gemini 3 Pro Image (HQ)', type: 'image', requiresBilling: true },
  { id: 'gemini-2.5-flash-image', name: 'Gemini 2.5 Flash Image', type: 'image', requiresBilling: false },
];

export const Settings: React.FC = () => {
  const { settingsByAgent, updateAgentSettings } = useSettingsStore();
  const theme = useThemeStore((state) => state.theme);
  const isLight = theme === 'light';
  const [saveStatus, setSaveStatus] = useState<string | null>(null);
  const [showKeys, setShowKeys] = useState<Record<string, boolean>>({});

  const toggleKeyVisibility = (agentId: string) => {
    setShowKeys(prev => ({ ...prev, [agentId]: !prev[agentId] }));
  };

  const handleUpdate = (agentId: AgentId, field: string, value: any) => {
    updateAgentSettings(agentId, { [field]: value });
    setSaveStatus(`Configuração salva para ${agentId}`);
    setTimeout(() => setSaveStatus(null), 2000);
  };

  return (
    <div className="space-y-12 pb-20 max-w-6xl mx-auto animate-in fade-in duration-700">
      <header className={`border-b pb-8 ${isLight ? 'border-slate-200' : 'border-slate-800'}`}>
        <h2 className={`text-4xl font-black tracking-tighter uppercase ${isLight ? 'text-slate-900' : 'text-slate-100'}`}>Central de Inteligência</h2>
        <p className="text-slate-500 mt-2 font-bold uppercase text-[11px] tracking-widest">Controle total: Defina a chave e o motor de IA para cada especialista.</p>
      </header>

      {/* Hero Section: Manual Keys Explanation */}
      <section className={`p-8 md:p-12 rounded-[48px] border flex flex-col lg:flex-row items-center gap-10 relative overflow-hidden ${isLight ? 'bg-blue-50/50 border-blue-100' : 'bg-slate-900 border-slate-800'}`}>
        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 blur-[100px] rounded-full -mr-32 -mt-32"></div>
        <div className="p-6 bg-blue-500/10 text-blue-500 rounded-[32px] shadow-2xl shadow-blue-500/10">
          <Lock size={48} />
        </div>
        <div className="flex-1 space-y-4 text-center lg:text-left">
          <h3 className={`text-2xl font-black uppercase tracking-tight ${isLight ? 'text-slate-900' : 'text-slate-100'}`}>Agnóstico & Independente</h3>
          <p className="text-[11px] text-slate-500 font-black uppercase tracking-widest leading-relaxed max-w-2xl">
            Cada especialista abaixo opera como uma unidade isolada. Você vincula uma <b>Chave</b> e escolhe um <b>Modelo</b>. O sistema executará o modelo escolhido usando a credencial fornecida.
          </p>
        </div>
        <div className="flex flex-col gap-3 w-full lg:w-auto">
          <a 
            href="https://aistudio.google.com/app/apikey" 
            target="_blank" 
            rel="noopener noreferrer"
            className={`flex items-center justify-center gap-2 px-8 py-5 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all border shadow-xl ${isLight ? 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50 shadow-slate-200/50' : 'bg-slate-800 border-slate-700 text-slate-200 hover:text-white shadow-black/20'}`}
          >
            Obter Chaves AI Studio <ExternalLink size={16} />
          </a>
        </div>
      </section>

      {/* Agents Configuration List */}
      <section className="space-y-6">
        <div className="flex items-center justify-between px-4">
           <h3 className={`text-xs font-black uppercase tracking-[0.2em] ${isLight ? 'text-slate-900' : 'text-slate-400'}`}>Configurações por Especialista</h3>
        </div>

        {AGENTS_DEFINITIONS.map((agent) => {
          const settings = settingsByAgent[agent.id];
          const selectedModel = GOOGLE_MODELS.find(m => m.id === settings.model);
          const hasManualKey = !!settings.apiKey;

          return (
            <div key={agent.id} className={`border rounded-[40px] p-8 md:p-10 transition-all hover:shadow-2xl group ${
              isLight ? 'bg-white border-slate-200 hover:border-emerald-500 shadow-slate-200/30' : 'bg-slate-950 border-slate-800 hover:border-emerald-500/30'
            }`}>
              <div className="flex flex-col xl:flex-row gap-12">
                {/* Identity Sidebar */}
                <div className="xl:w-1/4 space-y-6">
                  <div className={`w-16 h-16 rounded-3xl flex items-center justify-center border-2 transition-all duration-500 ${
                    hasManualKey 
                      ? 'bg-emerald-500/10 border-emerald-500 text-emerald-500' 
                      : (isLight ? 'bg-slate-50 border-slate-100 text-slate-400' : 'bg-slate-900 border-slate-800 text-slate-600')
                  }`}>
                    <Cpu size={32} strokeWidth={2.5} />
                  </div>
                  <div>
                    <h4 className={`text-xl font-black uppercase tracking-tight transition-colors ${isLight ? 'text-slate-900' : 'text-slate-100'} group-hover:text-emerald-500`}>
                      {agent.displayName}
                    </h4>
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest opacity-60 mt-1">{agent.category}</p>
                  </div>
                  
                  <div className="space-y-2">
                    {hasManualKey ? (
                      <div className="flex items-center gap-2 text-[8px] font-black text-emerald-500 bg-emerald-500/5 px-3 py-1.5 rounded-lg border border-emerald-500/10 uppercase tracking-widest w-fit">
                        <ShieldCheck size={10} /> Chave Manual Ativa
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 text-[8px] font-black text-slate-400 bg-slate-500/5 px-3 py-1.5 rounded-lg border border-slate-500/10 uppercase tracking-widest w-fit">
                        <ShieldAlert size={10} /> Chave Global Ativa
                      </div>
                    )}
                    <div className="flex items-center gap-2 text-[8px] font-black text-blue-500 bg-blue-500/5 px-3 py-1.5 rounded-lg border border-blue-500/10 uppercase tracking-widest w-fit">
                      <Zap size={10} /> Motor: {selectedModel?.name.split(' ')[1]}
                    </div>
                  </div>
                </div>

                {/* Controls Area */}
                <div className="flex-1 space-y-8">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
                    
                    {/* API Key Input */}
                    <div className="space-y-4">
                      <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1 flex items-center justify-between pr-2">
                        <span className="flex items-center gap-2"><Key size={14} /> 1. DEFINIR CHAVE</span>
                      </label>
                      <div className="relative">
                        <input 
                          type={showKeys[agent.id] ? "text" : "password"}
                          value={settings.apiKey || ''}
                          onChange={(e) => handleUpdate(agent.id, 'apiKey', e.target.value)}
                          placeholder="Chave Individual (Opcional)..."
                          className={`w-full border rounded-2xl px-6 py-5 pr-14 text-xs font-mono focus:outline-none focus:ring-2 focus:ring-emerald-500/30 transition-all ${
                            isLight ? 'bg-slate-50 border-slate-200 text-slate-900' : 'bg-slate-900 border-slate-800 text-slate-100'
                          }`}
                        />
                        <button 
                          onClick={() => toggleKeyVisibility(agent.id)}
                          className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-emerald-500 transition-colors"
                        >
                          {showKeys[agent.id] ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                      </div>
                      <p className="text-[8px] text-slate-500 font-bold uppercase px-2 tracking-tight">
                        Se vazio, usará a chave de faturamento global do cockpit.
                      </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      {/* Model Select */}
                      <div className="space-y-4">
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1 flex items-center justify-between">
                          <span className="flex items-center gap-2 text-blue-500"><LinkIcon size={12}/> 2. DEFINIR MOTOR</span>
                        </label>
                        <div className="relative">
                          <select 
                            value={settings.model}
                            onChange={(e) => handleUpdate(agent.id, 'model', e.target.value)}
                            className={`w-full border rounded-2xl px-5 py-5 text-[10px] font-black uppercase tracking-widest appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500/30 transition-all ${
                              isLight ? 'bg-slate-50 border-slate-200 text-slate-900' : 'bg-slate-900 border-slate-800 text-slate-100'
                            }`}
                          >
                            {GOOGLE_MODELS.map(m => (
                              <option key={m.id} value={m.id}>{m.name}</option>
                            ))}
                          </select>
                          <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" size={16} />
                        </div>
                        <p className="text-[7px] text-blue-500/70 font-black uppercase px-2 tracking-tighter">
                          * Este motor será alimentado pela chave ao lado.
                        </p>
                      </div>

                      {/* Temperature Slider */}
                      <div className="space-y-4">
                        <div className="flex justify-between items-center px-1">
                          <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">3. CRIATIVIDADE</label>
                          <span className="text-[10px] font-black text-emerald-500">{settings.temperature ?? 0.7}</span>
                        </div>
                        <div className="pt-3">
                          <input 
                            type="range" min="0" max="1" step="0.1"
                            value={settings.temperature ?? 0.7}
                            onChange={(e) => handleUpdate(agent.id, 'temperature', parseFloat(e.target.value))}
                            className={`w-full h-1.5 rounded-full appearance-none cursor-pointer accent-emerald-500 ${isLight ? 'bg-slate-200' : 'bg-slate-800'}`}
                          />
                        </div>
                        <div className="flex justify-between text-[7px] font-black text-slate-500 uppercase tracking-widest px-1">
                          <span>Rigor</span>
                          <span>Criatividade</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </section>

      {/* Floating Save Notification */}
      {saveStatus && (
        <div className="fixed bottom-10 left-1/2 -translate-x-1/2 bg-emerald-600 text-white px-10 py-5 rounded-[28px] shadow-2xl flex items-center gap-4 animate-in slide-in-from-bottom-10 duration-500 z-[100] border border-emerald-400/30 backdrop-blur-md">
          <Save size={20} strokeWidth={3} />
          <span className="text-xs font-black uppercase tracking-[0.1em]">{saveStatus}</span>
        </div>
      )}
    </div>
  );
};
