
import React, { useState } from 'react';
import { useSettingsStore } from '../store/useSettingsStore';
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
    setSaveStatus("Chave salva com sucesso!");
    setTimeout(() => setSaveStatus(null), 3000);
  };

  const handleClearKey = () => {
    setApiKeyInput('');
    setCustomApiKey('');
    setSaveStatus("Chave removida.");
    setTimeout(() => setSaveStatus(null), 3000);
  };

  return (
    <div className="space-y-8 pb-20 max-w-4xl mx-auto animate-slide-up">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-6">
        <div>
          <h2 className="text-3xl font-black text-slate-100 uppercase tracking-tighter">Configurações</h2>
          <p className="text-slate-500 mt-1 font-bold uppercase text-[10px] tracking-widest">Gerencie suas credenciais e parâmetros de IA.</p>
        </div>
      </header>

      {/* Manual API Key Input Section */}
      <section className="bg-slate-900 border border-slate-800 rounded-[32px] p-8 space-y-8 shadow-xl relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 blur-3xl rounded-full -mr-32 -mt-32"></div>
        
        <div className="flex items-center gap-4 relative z-10">
          <div className="p-4 bg-emerald-500/10 text-emerald-400 rounded-2xl border border-emerald-500/20">
            <Key size={24} />
          </div>
          <div>
            <h3 className="text-xl font-black text-slate-100 uppercase tracking-tight">Credenciais do Gemini</h3>
            <p className="text-xs text-slate-500 font-bold uppercase tracking-widest mt-1">Insira sua chave de API pessoal para ativar o cockpit.</p>
          </div>
        </div>

        <div className="space-y-6 relative z-10">
          <div className="bg-slate-950/50 border border-slate-800 rounded-2xl p-6 flex items-start gap-4">
            <Info className="text-blue-400 mt-1 flex-shrink-0" size={20} />
            <p className="text-[11px] text-slate-400 leading-relaxed font-bold uppercase">
              Sua chave será armazenada apenas localmente no seu navegador. Certifique-se de usar uma chave com permissão para o modelo <span className="text-emerald-400">Gemini 3 Pro</span>.
            </p>
          </div>

          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <input 
                type={showKey ? "text" : "password"}
                value={apiKeyInput}
                onChange={(e) => setApiKeyInput(e.target.value)}
                placeholder="Cole sua API Key aqui (AIza...)"
                className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-6 py-4 text-slate-100 placeholder:text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 transition-all font-mono text-sm"
              />
              <button 
                onClick={() => setShowKey(!showKey)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-600 hover:text-slate-300 transition-colors"
              >
                {showKey ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
            
            <div className="flex gap-2">
              <button 
                onClick={handleSaveKey}
                disabled={!apiKeyInput}
                className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-800 disabled:text-slate-600 text-white px-6 py-4 rounded-2xl font-black text-xs uppercase tracking-widest transition-all shadow-xl shadow-emerald-600/20 active:scale-95"
              >
                <Save size={18} /> Salvar
              </button>
              {customApiKey && (
                <button 
                  onClick={handleClearKey}
                  className="p-4 bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white border border-red-500/20 rounded-2xl transition-all"
                  title="Remover Chave"
                >
                  <Trash2 size={18} />
                </button>
              )}
            </div>
          </div>
        </div>
      </section>

      <section className="space-y-6">
        <div className="flex items-center gap-3 text-emerald-400">
          <Cpu size={24} />
          <h3 className="text-xl font-black text-slate-100 uppercase tracking-tight">Parâmetros de Inteligência</h3>
        </div>

        <div className="space-y-4">
          {AGENTS_DEFINITIONS.map((agent) => {
            const settings = settingsByAgent[agent.id];
            
            return (
              <div key={agent.id} className="bg-slate-900 border border-slate-800 rounded-[24px] p-6 transition-all hover:border-emerald-500/20 group">
                <div className="flex flex-col md:flex-row gap-6">
                  <div className="md:w-1/3">
                    <h4 className="font-black text-slate-100 uppercase tracking-tight group-hover:text-emerald-400 transition-colors">{agent.displayName}</h4>
                    <p className="text-[10px] text-slate-500 mt-1 font-bold uppercase tracking-widest leading-relaxed">{agent.shortDescription}</p>
                  </div>

                  <div className="flex-1 space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-3">
                        <label className="text-[9px] font-black text-slate-500 uppercase flex items-center gap-1 tracking-[0.2em]">
                          Temperatura (Nível de Insight)
                        </label>
                        <input 
                          type="range"
                          min="0"
                          max="1"
                          step="0.1"
                          value={settings.temperature ?? 0.7}
                          onChange={(e) => handleUpdate(agent.id, 'temperature', parseFloat(e.target.value))}
                          className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                        />
                        <div className="flex justify-between text-[8px] text-slate-600 font-black uppercase tracking-widest">
                          <span>Analítico</span>
                          <span>Criativo</span>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <label className="text-[9px] font-black text-slate-500 uppercase tracking-[0.2em]">Modelo</label>
                        <div className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-xs font-black text-emerald-400/70 uppercase tracking-widest">
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
        <div className="fixed bottom-8 right-8 bg-emerald-600 text-white px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-3 animate-in slide-in-from-bottom-4 duration-300 z-[100] border border-emerald-400/30">
          <Check size={20} strokeWidth={3} />
          <span className="text-xs font-black uppercase tracking-widest">{saveStatus}</span>
        </div>
      )}
    </div>
  );
};
