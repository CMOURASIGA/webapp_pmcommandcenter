
import React, { useState } from 'react';
import { AGENTS_DEFINITIONS } from '../constants';
import { useThemeStore } from '../store/useThemeStore';
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
  const theme = useThemeStore((state) => state.theme);
  const isLight = theme === 'light';

  return (
    <div className="space-y-8 h-full flex flex-col animate-in fade-in duration-700">
      {!selectedAgentId ? (
        <>
          <header>
            <h2 className={`text-4xl font-black tracking-tighter uppercase flex items-center gap-4 ${isLight ? 'text-slate-900' : 'text-slate-100'}`}>
              <Cpu className="text-emerald-500" size={32} /> Agents Lab
            </h2>
            <p className="text-slate-500 mt-2 font-bold uppercase text-[11px] tracking-widest">Acesso direto às inteligências especialistas</p>
          </header>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 overflow-y-auto pr-2 pb-8 scrollbar-hide">
            {AGENTS_DEFINITIONS.map((agent) => {
              const Icon = ICON_MAP[agent.icon] || Bot;
              return (
                <button
                  key={agent.id}
                  onClick={() => setSelectedAgentId(agent.id)}
                  className={`group relative border rounded-[32px] p-8 text-left transition-all flex flex-col h-full shadow-lg ${
                    isLight 
                      ? 'bg-white border-slate-200 hover:border-emerald-500 shadow-slate-200/50' 
                      : 'bg-slate-900 border-slate-800 hover:border-emerald-500/50 hover:shadow-emerald-500/5'
                  }`}
                >
                  <div className="flex items-center gap-4 mb-6">
                    <div className={`p-4 rounded-2xl transition-all shadow-inner ${
                      isLight ? 'bg-slate-50 text-emerald-600 border border-slate-100' : 'bg-slate-800 text-emerald-400 border border-slate-700'
                    } group-hover:bg-emerald-500 group-hover:text-white group-hover:border-emerald-400`}>
                      <Icon size={24} />
                    </div>
                    <div>
                      <h3 className={`text-lg font-black uppercase tracking-tight transition-colors ${isLight ? 'text-slate-900' : 'text-slate-100'} group-hover:text-emerald-500`}>{agent.displayName}</h3>
                      <span className="text-[9px] text-slate-500 uppercase tracking-[0.2em] font-black opacity-60">{agent.category}</span>
                    </div>
                  </div>
                  <p className={`text-[11px] leading-relaxed mb-8 flex-1 font-bold uppercase tracking-tight ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                    {agent.shortDescription}
                  </p>
                  <div className="flex flex-wrap gap-2 mb-8">
                    {agent.usageTips.slice(0, 2).map((tip, idx) => (
                      <span key={idx} className={`text-[9px] px-3 py-1.5 rounded-lg border font-black uppercase tracking-widest ${
                        isLight ? 'bg-slate-50 border-slate-200 text-slate-400' : 'bg-slate-800 border-slate-700 text-slate-500'
                      }`}>
                        {tip.length > 35 ? tip.substring(0, 35) + '...' : tip}
                      </span>
                    ))}
                  </div>
                  <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-[0.2em] text-emerald-600 group-hover:translate-x-1 transition-transform">
                    <span>Ativar Módulo</span>
                    <ChevronRight size={16} strokeWidth={3} />
                  </div>
                </button>
              );
            })}
          </div>
        </>
      ) : (
        <div className="flex-1 flex flex-col min-h-0">
          <div className="flex items-center justify-between mb-6">
            <button 
              onClick={() => setSelectedAgentId(null)}
              className={`flex items-center gap-2 font-black uppercase text-[10px] tracking-widest transition-all ${
                isLight ? 'text-slate-500 hover:text-emerald-600' : 'text-slate-400 hover:text-emerald-400'
              }`}
            >
              <ChevronRight size={18} className="rotate-180" strokeWidth={3} /> Voltar ao Lab
            </button>
            <div className={`flex items-center gap-2 text-[9px] font-black uppercase tracking-widest ${isLight ? 'text-slate-400' : 'text-slate-500'}`}>
              <Zap size={14} className="text-amber-500" />
              <span>Modo Sandbox Ativo</span>
            </div>
          </div>
          
          <div className={`flex-1 min-h-0 border rounded-[40px] overflow-hidden shadow-2xl flex flex-col lg:flex-row ${
            isLight ? 'bg-white border-slate-200' : 'bg-slate-900 border-slate-800'
          }`}>
            <div className="flex-1 h-full min-h-[500px]">
              <ChatPanel agentId={selectedAgentId} />
            </div>
            
            {/* Dicas e Settings Lateral */}
            <div className={`w-full lg:w-80 border-t lg:border-t-0 lg:border-l p-8 overflow-y-auto ${
              isLight ? 'bg-slate-50/50 border-slate-200' : 'bg-slate-800/30 border-slate-800'
            }`}>
              <h4 className={`text-xs font-black uppercase tracking-[0.2em] mb-6 flex items-center gap-2 ${isLight ? 'text-slate-900' : 'text-slate-100'}`}>
                <Zap size={16} className="text-emerald-500" /> Prompting Tips
              </h4>
              <div className="space-y-4">
                {AGENTS_DEFINITIONS.find(a => a.id === selectedAgentId)?.usageTips.map((tip, idx) => (
                  <div key={idx} className={`p-4 rounded-2xl text-[10px] font-bold uppercase leading-relaxed tracking-tight border transition-all hover:border-emerald-500/30 ${
                    isLight ? 'bg-white border-slate-200 text-slate-500' : 'bg-slate-900/50 border-slate-800 text-slate-400'
                  }`}>
                    {tip}
                  </div>
                ))}
              </div>
              <div className="mt-10 pt-10 border-t border-slate-200 dark:border-slate-800">
                <h4 className={`text-xs font-black uppercase tracking-[0.2em] mb-4 ${isLight ? 'text-slate-900' : 'text-slate-100'}`}>Status do Motor</h4>
                <div className={`p-4 rounded-2xl space-y-3 border ${isLight ? 'bg-white border-slate-200' : 'bg-slate-950/50 border-slate-800'}`}>
                  <div className="flex justify-between text-[9px] font-black uppercase tracking-widest">
                    <span className="text-slate-400">Modelo</span>
                    <span className="text-emerald-600">Gemini 3 Pro</span>
                  </div>
                  <div className="flex justify-between text-[9px] font-black uppercase tracking-widest">
                    <span className="text-slate-400">Contexto</span>
                    <span className={isLight ? 'text-slate-900' : 'text-slate-300'}>Ativo</span>
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
