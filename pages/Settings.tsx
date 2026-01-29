
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
  ShieldCheck,
  ShieldAlert,
  Eye,
  EyeOff,
  Save,
  Link as LinkIcon,
  Globe
} from 'lucide-react';
import { AgentId } from '../types';

const MODELS_BY_PROVIDER = {
  'google-ai-studio': [
    { id: 'gemini-3-pro-preview', name: 'Gemini 3 Pro' },
    { id: 'gemini-3-flash-preview', name: 'Gemini 3 Flash' },
    { id: 'gemini-2.5-flash-image', name: 'Gemini 2.5 Image' },
  ],
  'openai': [
    { id: 'gpt-4o', name: 'GPT-4o (Omni)' },
    { id: 'gpt-4-turbo', name: 'GPT-4 Turbo' },
    { id: 'gpt-3.5-turbo', name: 'GPT-3.5 Turbo' },
  ],
  'custom-api': [
    { id: 'custom-model', name: 'Custom Endpoint' }
  ]
};

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
    // Se mudar o provedor, reseta o modelo para o primeiro da lista do novo provedor
    if (field === 'provider') {
      const firstModel = MODELS_BY_PROVIDER[value as keyof typeof MODELS_BY_PROVIDER][0].id;
      updateAgentSettings(agentId, { provider: value, model: firstModel });
    } else {
      updateAgentSettings(agentId, { [field]: value });
    }
    
    setSaveStatus(`Configuração salva para ${agentId}`);
    setTimeout(() => setSaveStatus(null), 2000);
  };

  return (
    <div className="space-y-12 pb-20 max-w-6xl mx-auto animate-in fade-in duration-700">
      <header className={`border-b pb-8 ${isLight ? 'border-slate-200' : 'border-slate-800'}`}>
        <h2 className={`text-4xl font-black tracking-tighter uppercase ${isLight ? 'text-slate-900' : 'text-slate-100'}`}>Central de Inteligência</h2>
        <p className="text-slate-500 mt-2 font-bold uppercase text-[11px] tracking-widest">Misture provedores (Gemini, OpenAI) e gerencie chaves individuais.</p>
      </header>

      {/* Agents Configuration List */}
      <section className="space-y-6">
        {AGENTS_DEFINITIONS.map((agent) => {
          const settings = settingsByAgent[agent.id];
          const providerModels = MODELS_BY_PROVIDER[settings.provider || 'google-ai-studio'];
          const hasManualKey = !!settings.apiKey;

          return (
            <div key={agent.id} className={`border rounded-[40px] p-8 md:p-10 transition-all hover:shadow-2xl group ${
              isLight ? 'bg-white border-slate-200 hover:border-emerald-500' : 'bg-slate-950 border-slate-800 hover:border-emerald-500/30'
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
                    <div className={`flex items-center gap-2 text-[8px] font-black px-3 py-1.5 rounded-lg border uppercase tracking-widest w-fit ${
                      settings.provider === 'openai' ? 'bg-blue-500/10 text-blue-500 border-blue-500/20' : 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'
                    }`}>
                      <Globe size={10} /> Provedor: {settings.provider?.toUpperCase()}
                    </div>
                  </div>
                </div>

                {/* Controls Area */}
                <div className="flex-1 space-y-8">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
                    
                    {/* Provider & Key */}
                    <div className="space-y-6">
                      <div className="space-y-3">
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">1. ESCOLHER PROVEDOR</label>
                        <select 
                          value={settings.provider}
                          onChange={(e) => handleUpdate(agent.id, 'provider', e.target.value)}
                          className={`w-full border rounded-2xl px-5 py-4 text-[10px] font-black uppercase tracking-widest appearance-none focus:outline-none focus:ring-2 focus:ring-emerald-500/30 ${
                            isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-900 border-slate-800 text-white'
                          }`}
                        >
                          <option value="google-ai-studio">Google AI Studio (Gemini)</option>
                          <option value="openai">OpenAI (ChatGPT)</option>
                        </select>
                      </div>

                      <div className="space-y-3">
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1 flex items-center justify-between">
                          <span>2. CHAVE DE API</span>
                          {hasManualKey && <span className="text-emerald-500 text-[8px] font-black uppercase flex items-center gap-1"><Check size={10}/> Ativa</span>}
                        </label>
                        <div className="relative">
                          <input 
                            type={showKeys[agent.id] ? "text" : "password"}
                            value={settings.apiKey || ''}
                            onChange={(e) => handleUpdate(agent.id, 'apiKey', e.target.value)}
                            placeholder={`Chave para ${settings.provider === 'openai' ? 'OpenAI' : 'Gemini'}...`}
                            className={`w-full border rounded-2xl px-6 py-4 pr-14 text-xs font-mono focus:outline-none focus:ring-2 focus:ring-emerald-500/30 transition-all ${
                              isLight ? 'bg-slate-50 border-slate-200 text-slate-900' : 'bg-slate-900 border-slate-800 text-slate-100'
                            }`}
                          />
                          <button onClick={() => toggleKeyVisibility(agent.id)} className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-500">
                            {showKeys[agent.id] ? <EyeOff size={18} /> : <Eye size={18} />}
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Model & Temperature */}
                    <div className="space-y-6">
                      <div className="space-y-3">
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">3. ESCOLHER MODELO</label>
                        <select 
                          value={settings.model}
                          onChange={(e) => handleUpdate(agent.id, 'model', e.target.value)}
                          className={`w-full border rounded-2xl px-5 py-4 text-[10px] font-black uppercase tracking-widest appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500/30 ${
                            isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-900 border-slate-800 text-white'
                          }`}
                        >
                          {providerModels.map(m => (
                            <option key={m.id} value={m.id}>{m.name}</option>
                          ))}
                        </select>
                      </div>

                      <div className="space-y-3">
                        <div className="flex justify-between items-center px-1">
                          <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">4. TEMPERATURA: {settings.temperature ?? 0.7}</label>
                        </div>
                        <input 
                          type="range" min="0" max="1" step="0.1"
                          value={settings.temperature ?? 0.7}
                          onChange={(e) => handleUpdate(agent.id, 'temperature', parseFloat(e.target.value))}
                          className="w-full h-1.5 rounded-full accent-emerald-500 bg-slate-200 dark:bg-slate-800 appearance-none"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </section>

      {saveStatus && (
        <div className="fixed bottom-10 left-1/2 -translate-x-1/2 bg-emerald-600 text-white px-10 py-5 rounded-[28px] shadow-2xl flex items-center gap-4 z-[100] border border-emerald-400/30 backdrop-blur-md">
          <Save size={20} strokeWidth={3} />
          <span className="text-xs font-black uppercase tracking-[0.1em]">{saveStatus}</span>
        </div>
      )}
    </div>
  );
};
