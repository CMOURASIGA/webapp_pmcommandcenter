
import React, { useState } from 'react';
import { useSettingsStore } from '../store/useSettingsStore';
import { AGENTS_DEFINITIONS } from '../constants';
import { 
  Key, 
  ShieldCheck, 
  Cpu, 
  Trash2, 
  Save, 
  Check, 
  Info, 
  AlertTriangle,
  Lock,
  Eye,
  EyeOff
} from 'lucide-react';
import { AgentId } from '../types';

export const Settings: React.FC = () => {
  const { settingsByAgent, updateAgentSettings, clearAllKeys } = useSettingsStore();
  const [saveStatus, setSaveStatus] = useState<string | null>(null);
  const [showKeys, setShowKeys] = useState<Record<string, boolean>>({});

  const toggleKeyVisibility = (agentId: string) => {
    setShowKeys(prev => ({ ...prev, [agentId]: !prev[agentId] }));
  };

  const handleUpdate = (agentId: AgentId, field: string, value: any) => {
    updateAgentSettings(agentId, { [field]: value });
    setSaveStatus(`Atualizado: ${agentId}`);
    setTimeout(() => setSaveStatus(null), 2000);
  };

  const handleClearAll = () => {
    if (confirm("Deseja realmente remover todas as chaves de API salvas neste navegador?")) {
      clearAllKeys();
    }
  };

  return (
    <div className="space-y-8 pb-20 max-w-4xl mx-auto">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-6">
        <div>
          <h2 className="text-3xl font-bold text-slate-100">Configurações</h2>
          <p className="text-slate-400 mt-1">Gerencie chaves de API, modelos e preferências do sistema.</p>
        </div>
        <button 
          onClick={handleClearAll}
          className="flex items-center gap-2 text-red-400 hover:text-red-300 px-4 py-2 rounded-lg border border-red-500/20 hover:bg-red-500/10 transition-all font-medium text-sm"
        >
          <Trash2 size={18} />
          Limpar Todas as Chaves
        </button>
      </header>

      {/* Info Box */}
      <div className="bg-blue-500/10 border border-blue-500/20 p-5 rounded-xl flex gap-4 text-blue-100">
        <Info className="flex-shrink-0 text-blue-400" size={24} />
        <div className="text-sm space-y-2">
          <p className="font-bold">Privacidade e Chaves de API</p>
          <p className="leading-relaxed">
            Todas as chaves são armazenadas localmente no seu navegador (localStorage). 
            O PM Command Center é um projeto frontend-only e não possui servidores para armazenar seus dados ou chaves.
            Você é responsável pela segurança das suas chaves de API.
          </p>
        </div>
      </div>

      <section className="space-y-6">
        <div className="flex items-center gap-2 text-emerald-400">
          <Cpu size={24} />
          <h3 className="text-xl font-bold">Configuração de IA por Agente</h3>
        </div>

        <div className="space-y-4">
          {AGENTS_DEFINITIONS.map((agent) => {
            const settings = settingsByAgent[agent.id];
            const isVisible = showKeys[agent.id];
            
            return (
              <div key={agent.id} className="bg-slate-900 border border-slate-800 rounded-xl p-6 transition-all hover:border-slate-700">
                <div className="flex flex-col md:flex-row gap-6">
                  <div className="md:w-1/3">
                    <h4 className="font-bold text-slate-100">{agent.displayName}</h4>
                    <p className="text-xs text-slate-500 mt-1 leading-relaxed">{agent.shortDescription}</p>
                    <div className="mt-4 flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${settings.apiKey ? 'bg-emerald-500 shadow-sm shadow-emerald-500' : 'bg-slate-700'}`}></div>
                      <span className="text-[10px] uppercase font-bold text-slate-500">
                        {settings.apiKey ? 'Configurado' : 'Aguardando Chave'}
                      </span>
                    </div>
                  </div>

                  <div className="flex-1 space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-[10px] font-bold text-slate-500 uppercase flex items-center gap-1">
                          Provedor
                        </label>
                        <select 
                          value={settings.provider}
                          onChange={(e) => handleUpdate(agent.id, 'provider', e.target.value)}
                          className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:ring-1 focus:ring-emerald-500/50"
                        >
                          <option value="Google Gemini">Google Gemini</option>
                        </select>
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-bold text-slate-500 uppercase">Modelo</label>
                        <input 
                          value={settings.model}
                          onChange={(e) => handleUpdate(agent.id, 'model', e.target.value)}
                          className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:ring-1 focus:ring-emerald-500/50"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-slate-500 uppercase flex items-center gap-1">
                        <Lock size={10} /> API Key
                      </label>
                      <div className="relative">
                        <input 
                          type={isVisible ? "text" : "password"}
                          value={settings.apiKey || ''}
                          onChange={(e) => handleUpdate(agent.id, 'apiKey', e.target.value)}
                          placeholder="Digite sua chave de API..."
                          className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-3 pr-10 py-2 text-sm text-slate-200 font-mono focus:outline-none focus:ring-1 focus:ring-emerald-500/50"
                        />
                        <button 
                          onClick={() => toggleKeyVisibility(agent.id)}
                          className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-slate-500 hover:text-slate-300"
                        >
                          {isVisible ? <EyeOff size={16} /> : <Eye size={16} />}
                        </button>
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
        <div className="fixed bottom-8 right-8 bg-emerald-600 text-white px-4 py-2 rounded-lg shadow-xl flex items-center gap-2 animate-in slide-in-from-bottom-4 duration-300">
          <Check size={18} />
          <span className="text-sm font-bold">Alterações salvas localmente</span>
        </div>
      )}
    </div>
  );
};
