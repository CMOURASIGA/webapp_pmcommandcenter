
import React, { useState } from 'react';
import { useSettingsStore } from '../store/useSettingsStore';
import { AGENTS_DEFINITIONS } from '../constants';
import { 
  ShieldCheck, 
  Cpu, 
  Check, 
  Info
} from 'lucide-react';
import { AgentId } from '../types';

export const Settings: React.FC = () => {
  const { settingsByAgent, updateAgentSettings } = useSettingsStore();
  const [saveStatus, setSaveStatus] = useState<string | null>(null);

  const handleUpdate = (agentId: AgentId, field: string, value: any) => {
    updateAgentSettings(agentId, { [field]: value });
    setSaveStatus(`Atualizado: ${agentId}`);
    setTimeout(() => setSaveStatus(null), 2000);
  };

  return (
    <div className="space-y-8 pb-20 max-w-4xl mx-auto">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-6">
        <div>
          <h2 className="text-3xl font-bold text-slate-100">Configurações</h2>
          <p className="text-slate-400 mt-1">Gerencie preferências e parâmetros dos agentes de IA.</p>
        </div>
      </header>

      {/* Info Box */}
      <div className="bg-blue-500/10 border border-blue-500/20 p-5 rounded-xl flex gap-4 text-blue-100">
        <Info className="flex-shrink-0 text-blue-400" size={24} />
        <div className="text-sm space-y-2">
          <p className="font-bold">Segurança e Operação</p>
          <p className="leading-relaxed">
            As chaves de API são gerenciadas de forma segura pelo ambiente de execução. 
            Você pode ajustar parâmetros de comportamento como a criatividade (temperatura) para cada especialista.
          </p>
        </div>
      </div>

      <section className="space-y-6">
        <div className="flex items-center gap-2 text-emerald-400">
          <Cpu size={24} />
          <h3 className="text-xl font-bold">Parâmetros por Agente</h3>
        </div>

        <div className="space-y-4">
          {AGENTS_DEFINITIONS.map((agent) => {
            const settings = settingsByAgent[agent.id];
            
            return (
              <div key={agent.id} className="bg-slate-900 border border-slate-800 rounded-xl p-6 transition-all hover:border-slate-700">
                <div className="flex flex-col md:flex-row gap-6">
                  <div className="md:w-1/3">
                    <h4 className="font-bold text-slate-100">{agent.displayName}</h4>
                    <p className="text-xs text-slate-500 mt-1 leading-relaxed">{agent.shortDescription}</p>
                    <div className="mt-4 flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-sm shadow-emerald-500"></div>
                      <span className="text-[10px] uppercase font-bold text-slate-500">
                        Ativo & Conectado
                      </span>
                    </div>
                  </div>

                  <div className="flex-1 space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-[10px] font-bold text-slate-500 uppercase flex items-center gap-1">
                          Temperatura (Criatividade)
                        </label>
                        <input 
                          type="range"
                          min="0"
                          max="1"
                          step="0.1"
                          value={settings.temperature ?? 0.7}
                          onChange={(e) => handleUpdate(agent.id, 'temperature', parseFloat(e.target.value))}
                          className="w-full accent-emerald-500"
                        />
                        <div className="flex justify-between text-[10px] text-slate-500 font-bold">
                          <span>Focado (0.0)</span>
                          <span>Criativo (1.0)</span>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-bold text-slate-500 uppercase">Modelo Atribuído</label>
                        <div className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-400">
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
        <div className="fixed bottom-8 right-8 bg-emerald-600 text-white px-4 py-2 rounded-lg shadow-xl flex items-center gap-2 animate-in slide-in-from-bottom-4 duration-300">
          <Check size={18} />
          <span className="text-sm font-bold">Preferências salvas</span>
        </div>
      )}
    </div>
  );
};
