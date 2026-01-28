
import React, { useState } from 'react';
import { AGENTS_DEFINITIONS } from '../constants';
import { 
  Briefcase, 
  Workflow, 
  LayoutTemplate, 
  AlertTriangle, 
  MessageSquare, 
  BarChart3, 
  FileText,
  ChevronRight,
  Cpu,
  Bot,
  Zap
} from 'lucide-react';
import { ChatPanel } from '../components/ChatPanel';
import { AgentId } from '../types';

const ICON_MAP: Record<string, any> = {
  Briefcase,
  Workflow,
  Layout: LayoutTemplate,
  AlertTriangle,
  MessageSquare,
  BarChart3,
  FileText
};

export const AgentsLab: React.FC = () => {
  const [selectedAgentId, setSelectedAgentId] = useState<AgentId | null>(null);

  return (
    <div className="space-y-8 h-full flex flex-col">
      {!selectedAgentId ? (
        <>
          <header>
            <h2 className="text-3xl font-bold text-slate-100 flex items-center gap-3">
              <Cpu className="text-emerald-500" /> Agents Lab
            </h2>
            <p className="text-slate-400 mt-1">Converse diretamente com as inteligências especialistas fora do contexto de um projeto.</p>
          </header>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 overflow-y-auto pr-2 pb-8">
            {AGENTS_DEFINITIONS.map((agent) => {
              const Icon = ICON_MAP[agent.icon] || Bot;
              return (
                <button
                  key={agent.id}
                  onClick={() => setSelectedAgentId(agent.id)}
                  className="group relative bg-slate-900 border border-slate-800 rounded-2xl p-6 text-left hover:border-emerald-500/50 transition-all hover:shadow-2xl hover:shadow-emerald-500/5 flex flex-col h-full"
                >
                  <div className="flex items-center gap-4 mb-4">
                    <div className="p-3 bg-slate-800 text-emerald-400 rounded-xl group-hover:bg-emerald-500/10 transition-colors">
                      <Icon size={24} />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-slate-100 group-hover:text-emerald-400 transition-colors">{agent.displayName}</h3>
                      <span className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">{agent.category}</span>
                    </div>
                  </div>
                  <p className="text-sm text-slate-400 leading-relaxed mb-6 flex-1">
                    {agent.shortDescription}
                  </p>
                  <div className="flex flex-wrap gap-2 mb-6">
                    {agent.usageTips.slice(0, 2).map((tip, idx) => (
                      <span key={idx} className="text-[10px] bg-slate-800 text-slate-500 px-2 py-1 rounded-full border border-slate-700">
                        {tip.length > 30 ? tip.substring(0, 30) + '...' : tip}
                      </span>
                    ))}
                  </div>
                  <div className="flex items-center justify-between text-sm font-bold text-emerald-400 group-hover:translate-x-1 transition-transform">
                    <span>Iniciar Chat</span>
                    <ChevronRight size={18} />
                  </div>
                </button>
              );
            })}
          </div>
        </>
      ) : (
        <div className="flex-1 flex flex-col min-h-0">
          <div className="flex items-center justify-between mb-4">
            <button 
              onClick={() => setSelectedAgentId(null)}
              className="text-slate-400 hover:text-emerald-400 flex items-center gap-1 font-medium transition-colors"
            >
              <ChevronRight size={18} className="rotate-180" /> Voltar para o Laboratório
            </button>
            <div className="flex items-center gap-2 text-slate-500 text-sm">
              <Zap size={14} className="text-yellow-500" />
              <span>Modo Experimental Ativado</span>
            </div>
          </div>
          
          <div className="flex-1 min-h-0 bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl flex flex-col lg:flex-row">
            <div className="flex-1 h-full min-h-[500px]">
              <ChatPanel agentId={selectedAgentId} />
            </div>
            
            {/* Sidebar with tips */}
            <div className="w-full lg:w-80 bg-slate-800/30 border-t lg:border-t-0 lg:border-l border-slate-800 p-6 overflow-y-auto">
              <h4 className="text-slate-100 font-bold mb-4 flex items-center gap-2">
                <Zap size={16} className="text-emerald-400" /> Dicas Rápidas
              </h4>
              <div className="space-y-3">
                {AGENTS_DEFINITIONS.find(a => a.id === selectedAgentId)?.usageTips.map((tip, idx) => (
                  <div key={idx} className="p-3 bg-slate-900/50 rounded-lg text-xs text-slate-400 leading-relaxed border border-slate-800">
                    {tip}
                  </div>
                ))}
              </div>
              <div className="mt-8">
                <h4 className="text-slate-100 font-bold mb-4">Configurações Atuais</h4>
                <div className="p-3 bg-slate-900/50 rounded-lg space-y-2">
                  <div className="flex justify-between text-[10px]">
                    <span className="text-slate-500">Modelo</span>
                    <span className="text-emerald-400 font-bold">Gemini 3 Flash</span>
                  </div>
                  <div className="flex justify-between text-[10px]">
                    <span className="text-slate-500">Provider</span>
                    <span className="text-slate-300">Google AI</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
