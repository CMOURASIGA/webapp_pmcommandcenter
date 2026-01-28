
import React from 'react';
import { AGENTS_DEFINITIONS } from '../constants';
import { useThemeStore } from '../store/useThemeStore';
import { 
  HelpCircle, 
  BookOpen, 
  Zap, 
  Copy, 
  Check, 
  ShieldCheck,
  Cpu,
  Bot,
  FolderKanban,
  Target,
  Layers,
  MousePointer2,
  ArrowRight
} from 'lucide-react';

const AgentDocCard = ({ agent, isLight }: any) => {
  const [copied, setCopied] = React.useState(false);

  const copyPrompt = () => {
    navigator.clipboard.writeText(agent.systemPrompt);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className={`border rounded-[32px] overflow-hidden shadow-lg transition-all ${isLight ? 'bg-white border-slate-200 shadow-slate-200/50' : 'bg-slate-900 border-slate-800'}`}>
      <div className={`p-8 border-b flex items-center justify-between ${isLight ? 'bg-slate-50/50 border-slate-100' : 'bg-slate-800/30 border-slate-800'}`}>
        <div className="flex items-center gap-5">
          <div className={`p-3 rounded-2xl border ${isLight ? 'bg-white border-slate-200 text-emerald-600' : 'bg-slate-800 border-slate-700 text-emerald-400'}`}>
            <Bot size={28} />
          </div>
          <div>
            <h3 className={`text-xl font-black uppercase tracking-tight ${isLight ? 'text-slate-900' : 'text-slate-100'}`}>{agent.displayName}</h3>
            <span className="text-[10px] text-slate-500 uppercase tracking-widest font-black opacity-60">{agent.category}</span>
          </div>
        </div>
      </div>
      <div className="p-8 space-y-8">
        <div>
          <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-3">Contexto de Operação</h4>
          <p className={`text-sm leading-relaxed font-bold uppercase tracking-tight ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>{agent.shortDescription}</p>
        </div>
        <div>
          <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-4">Diretrizes de Prompting</h4>
          <ul className="space-y-3">
            {agent.usageTips.map((tip: string, i: number) => (
              <li key={i} className={`flex gap-3 text-xs font-bold uppercase tracking-tight ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                <div className="w-2 h-2 rounded-full bg-emerald-500 mt-1 flex-shrink-0 shadow-[0_0_8px_rgba(16,185,129,0.5)]"></div>
                {tip}
              </li>
            ))}
          </ul>
        </div>
        <div className={`pt-8 border-t ${isLight ? 'border-slate-100' : 'border-slate-800'}`}>
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Cérebro do Agente (System Prompt)</h4>
            <button 
              onClick={copyPrompt}
              className={`flex items-center gap-2 text-[9px] font-black uppercase px-4 py-2 rounded-xl border transition-all ${
                copied 
                  ? 'bg-emerald-600 text-white border-emerald-500' 
                  : (isLight ? 'bg-slate-100 text-slate-600 border-slate-200 hover:bg-slate-200' : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-slate-200 hover:bg-slate-700')
              }`}
            >
              {copied ? <Check size={14} strokeWidth={3} /> : <Copy size={14} />}
              {copied ? 'Copiado' : 'Copiar DNA'}
            </button>
          </div>
          <div className={`p-5 rounded-2xl border font-mono text-[11px] leading-relaxed whitespace-pre-wrap max-h-48 overflow-y-auto scrollbar-hide ${
            isLight ? 'bg-slate-50 border-slate-100 text-slate-500' : 'bg-slate-950 border-slate-800 text-slate-500'
          }`}>
            {agent.systemPrompt}
          </div>
        </div>
      </div>
    </div>
  );
};

export const Help: React.FC = () => {
  const theme = useThemeStore((state) => state.theme);
  const isLight = theme === 'light';

  return (
    <div className="space-y-20 pb-20 max-w-5xl mx-auto animate-in fade-in duration-700">
      <header className="text-center space-y-6">
        <div className="inline-flex p-5 bg-emerald-500/10 text-emerald-500 rounded-[32px] shadow-2xl shadow-emerald-500/10">
          <HelpCircle size={64} />
        </div>
        <h2 className={`text-6xl font-black tracking-tighter uppercase ${isLight ? 'text-slate-900' : 'text-slate-100'}`}>Command Help</h2>
        <p className="text-slate-500 max-w-2xl mx-auto text-xl font-bold leading-relaxed uppercase tracking-tight">
          O guia definitivo para operar seu cockpit de inteligência artificial.
        </p>
      </header>

      {/* Operação */}
      <section className="space-y-12">
        <div className={`flex items-center gap-4 border-b pb-6 ${isLight ? 'border-slate-200 text-slate-900' : 'border-slate-800 text-slate-100'}`}>
          <FolderKanban className="text-emerald-500" size={32} />
          <h3 className="text-3xl font-black uppercase tracking-tight">Fluxo Operacional</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            { step: 1, icon: Target, title: 'Iniciação', color: 'text-emerald-500', text: 'Crie seu projeto e defina os objetivos centrais.' },
            { step: 2, icon: Layers, title: 'Workspace', color: 'text-blue-500', text: 'Acesse o ambiente e alterne entre os especialistas.' },
            { step: 3, icon: MousePointer2, title: 'Interação', color: 'text-amber-500', text: 'Delegue tarefas complexas para as IAs via chat.' }
          ].map((item) => (
            <div key={item.step} className={`p-10 rounded-[40px] border relative group transition-all ${isLight ? 'bg-white border-slate-200 shadow-sm hover:shadow-xl' : 'bg-slate-900 border-slate-800'}`}>
              <div className="absolute -top-5 -left-5 w-12 h-12 bg-emerald-600 rounded-2xl flex items-center justify-center font-black text-white shadow-xl shadow-emerald-600/30 text-lg z-10">
                {item.step}
              </div>
              <item.icon size={48} className={`${item.color} mb-8 group-hover:scale-110 transition-transform`} />
              <h4 className={`text-xl font-black uppercase tracking-tight mb-4 ${isLight ? 'text-slate-900' : 'text-slate-100'}`}>{item.title}</h4>
              <p className={`text-xs font-bold uppercase tracking-tight leading-relaxed ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                {item.text}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Agentes */}
      <section className="space-y-12">
        <div className={`flex items-center gap-4 border-b pb-6 ${isLight ? 'border-slate-200 text-slate-900' : 'border-slate-800 text-slate-100'}`}>
          <BookOpen className="text-emerald-500" size={32} />
          <h3 className="text-3xl font-black uppercase tracking-tight">Manual dos Especialistas</h3>
        </div>
        
        <div className="space-y-8">
          {AGENTS_DEFINITIONS.map(agent => (
            <AgentDocCard key={agent.id} agent={agent} isLight={isLight} />
          ))}
        </div>
      </section>

      {/* Footer */}
      <div className={`p-16 rounded-[60px] text-center space-y-8 shadow-2xl relative overflow-hidden group ${isLight ? 'bg-white border border-slate-200' : 'bg-slate-900 border border-slate-800'}`}>
        <div className={`absolute top-0 right-0 w-96 h-96 blur-[120px] rounded-full -mr-48 -mt-48 transition-all ${isLight ? 'bg-emerald-500/5' : 'bg-emerald-500/10'}`}></div>
        <h4 className={`text-4xl font-black tracking-tight uppercase ${isLight ? 'text-slate-900' : 'text-slate-100'}`}>Decolagem Imediata</h4>
        <p className="text-slate-500 max-w-lg mx-auto font-black uppercase text-xs tracking-[0.2em] leading-relaxed">
          Sua equipe de IAs especialistas está configurada e pronta para processar dados estratégicos.
        </p>
        <div className="pt-6 flex flex-col sm:flex-row justify-center gap-6 relative z-10">
          <a href="/#/projects" className="bg-emerald-600 hover:bg-emerald-500 text-white font-black py-5 px-12 rounded-3xl transition-all shadow-2xl shadow-emerald-500/20 active:scale-95 uppercase tracking-widest text-xs flex items-center justify-center gap-3">
            Explorar Projetos <ArrowRight size={20} />
          </a>
          <a href="/#/settings" className={`font-black py-5 px-12 rounded-3xl transition-all active:scale-95 uppercase tracking-widest text-xs border flex items-center justify-center gap-3 ${isLight ? 'bg-slate-100 border-slate-200 text-slate-600 hover:bg-slate-200' : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-slate-200'}`}>
            Configurar API
          </a>
        </div>
      </div>
    </div>
  );
};
