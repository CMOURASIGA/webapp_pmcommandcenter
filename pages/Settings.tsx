
import React, { useState } from 'react';
import { useSettingsStore } from '../store/useSettingsStore';
import { useThemeStore } from '../store/useThemeStore';
import { AGENTS_DEFINITIONS } from '../constants';
import { 
  Cpu, 
  Check, 
  Info,
  Key,
  Eye,
  EyeOff,
  Save,
  Trash2
} from 'lucide-react';
import { AgentId } from '../types';

export const Settings: React.FC = () => {
  const { settingsByAgent, updateAgentSettings, customApiKey, setCustomApiKey } = useSettingsStore();
  const theme = useThemeStore((state) => state.theme);
  const isLight = theme === 'light';
  const [apiKeyInput, setApiKeyInput] = useState(customApiKey);
  const [showKey, setShowKey] = useState(false);
  const [saveStatus, setSaveStatus] = useState<string | null>(null);

  const handleUpdate = (agentId: AgentId, field: string, value: any) => {
    updateAgentSettings(agentId, { [field]: value });
    setSaveStatus(`Atualizado: ${agentId}`);
    setTimeout(() => setSaveStatus(null), 2000);
  };

  const handleSaveKey = () => {
    setCustomApiKey(apiKeyInput);
    setSaveStatus("Credenciais aplicadas!");
    setTimeout(() => setSaveStatus(null), 3000);
  };

  return (
    <div className="space-y-12 pb-20 max-w-4xl mx-auto animate-in fade-in duration-700">
      <header className={`border-b pb-8 ${isLight ? 'border-slate-200' : 'border-slate-800'}`}>
        <h2 className={`text-4xl font-black tracking-tighter uppercase ${isLight ? 'text-slate-900' : 'text-slate-100'}`}>Configurações</h2>
        <p className="text-slate-500 mt-2 font-bold uppercase text-[11px] tracking-widest">Gerenciamento de credenciais e parâmetros de inteligência</p>
      </header>

      {/* API Key Section */}
      <section className={`border rounded-[40px] p-10 space-y-8 shadow-xl relative overflow-hidden group ${
        isLight ? 'bg-white border-slate-200' : 'bg-slate-900 border-slate-800'
      }`}>
        <div className={`absolute top-0 right-0 w-64 h-64 blur-3xl rounded-full -mr-32 -mt-32 transition-all ${isLight ? 'bg-emerald-500/5' : 'bg-emerald-500/10'}`}></div>
        
        <div className="flex items-center gap-5 relative z-10">
          <div className={`p-4 rounded-2xl border ${isLight ? 'bg-slate-50 text-emerald-600 border-slate-100' : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'}`}>
            <Key size={28} />
          </div>
          <div>
            <h3 className={`text-2xl font-black uppercase tracking-tight ${isLight ? 'text-slate-900' : 'text-slate-100'}`}>Credenciais do Gemini</h3>
            <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest mt-1">Sua chave de acesso pessoal</p>
          </div>
        </div>

        <div className="space-y-6 relative z-10">
          <div className={`border rounded-2xl p-6 flex items-start gap-4 ${isLight ? 'bg-blue-50 border-blue-100' : 'bg-slate-950/50 border-slate-800'}`}>
            <Info className="text-blue-500 mt-1 flex-shrink-0" size={20} />
            <p className={`text-[11px] leading-relaxed font-bold uppercase ${isLight ? 'text-blue-700' : 'text-slate-400'}`}>
              A chave é armazenada apenas no <span className="text-blue-600">localStorage</span> do seu navegador. Recomenda-se o modelo <span className="text-emerald-500">Gemini 3 Pro</span> para melhor performance.
            </p>
          </div>

          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <input 
                type={showKey ? "text" : "password"}
                value={apiKeyInput}
                onChange={(e) => setApiKeyInput(e.target.value)}
                placeholder="Insira sua API Key (AIza...)"
                className={`w-full border rounded-2xl px-6 py-4 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all ${
                  isLight ? 'bg-slate-50 border-slate-300 text-slate-900 placeholder-slate-400' : 'bg-slate-950 border-slate-800 text-slate-100'
                }`}
              />
              <button 
                onClick={() => setShowKey(!showKey)}
                className={`absolute right-4 top-1/2 -translate-y-1/2 transition-colors ${isLight ? 'text-slate-400 hover:text-slate-600' : 'text-slate-600 hover:text-slate-300'}`}
              >
                {showKey ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
            
            <button 
              onClick={handleSaveKey}
              disabled={!apiKeyInput}
              className="flex items-center gap-3 bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-200 dark:disabled:bg-slate-800 disabled:text-slate-400 text-white px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest transition-all shadow-xl shadow-emerald-600/20 active:scale-95"
            >
              <Save size={18} strokeWidth={3} /> Salvar
            </button>
          </div>
        </div>
      </section>

      {/* Agents Parameters */}
      <section className="space-y-8">
        <div className="flex items-center gap-4 text-emerald-500">
          <Cpu size={28} />
          <h3 className={`text-2xl font-black uppercase tracking-tight ${isLight ? 'text-slate-900' : 'text-slate-100'}`}>Parâmetros da Equipe</h3>
        </div>

        <div className="space-y-6">
          {AGENTS_DEFINITIONS.map((agent) => {
            const settings = settingsByAgent[agent.id];
            return (
              <div key={agent.id} className={`border rounded-[32px] p-8 transition-all hover:shadow-xl group ${
                isLight ? 'bg-white border-slate-200 hover:border-emerald-500' : 'bg-slate-900 border-slate-800 hover:border-emerald-500/30'
              }`}>
                <div className="flex flex-col md:flex-row gap-10">
                  <div className="md:w-1/3 space-y-2">
                    <h4 className={`text-lg font-black uppercase tracking-tight group-hover:text-emerald-500 transition-colors ${isLight ? 'text-slate-900' : 'text-slate-100'}`}>{agent.displayName}</h4>
                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest leading-relaxed">{agent.shortDescription}</p>
                  </div>

                  <div className="flex-1 space-y-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                      <div className="space-y-4">
                        <div className="flex justify-between items-center">
                          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Temperatura</label>
                          <span className="text-[10px] font-black text-emerald-500 px-2 py-1 bg-emerald-500/10 rounded-lg">{settings.temperature ?? 0.7}</span>
                        </div>
                        <input 
                          type="range" min="0" max="1" step="0.1"
                          value={settings.temperature ?? 0.7}
                          onChange={(e) => handleUpdate(agent.id, 'temperature', parseFloat(e.target.value))}
                          className={`w-full h-2 rounded-full appearance-none cursor-pointer accent-emerald-500 ${isLight ? 'bg-slate-100' : 'bg-slate-800'}`}
                        />
                        <div className="flex justify-between text-[8px] text-slate-500 font-black uppercase tracking-widest">
                          <span>Determinístico</span>
                          <span>Criativo</span>
                        </div>
                      </div>
                      <div className="space-y-3">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Nível de Inteligência</label>
                        <div className={`w-full border rounded-2xl px-5 py-4 text-xs font-black uppercase tracking-widest transition-colors ${
                          isLight ? 'bg-slate-50 border-slate-200 text-emerald-600' : 'bg-slate-950/50 border-slate-800 text-emerald-400'
                        }`}>
                          {settings.model}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {saveStatus && (
        <div className="fixed bottom-10 right-10 bg-emerald-600 text-white px-8 py-5 rounded-3xl shadow-2xl flex items-center gap-4 animate-in slide-in-from-bottom-6 duration-500 z-[100] border border-emerald-400/30">
          <Check size={24} strokeWidth={4} />
          <span className="text-sm font-black uppercase tracking-widest">{saveStatus}</span>
        </div>
      )}
    </div>
  );
};
