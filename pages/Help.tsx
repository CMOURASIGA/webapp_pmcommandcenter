
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
  ArrowRight,
  LayoutDashboard,
  Settings as SettingsIcon,
  MessageSquare,
  Workflow,
  Sparkles
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
      <div className={`p-6 md:p-8 border-b flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 ${isLight ? 'bg-slate-50/50 border-slate-100' : 'bg-slate-800/30 border-slate-800'}`}>
        <div className="flex items-center gap-5">
          <div className={`p-3 rounded-2xl border ${isLight ? 'bg-white border-slate-200 text-emerald-600' : 'bg-slate-800 border-slate-700 text-emerald-400'}`}>
            <Bot size={28} />
          </div>
          <div>
            <h3 className={`text-xl font-black uppercase tracking-tight ${isLight ? 'text-slate-900' : 'text-slate-100'}`}>{agent.displayName}</h3>
            <span className="text-[10px] text-slate-500 uppercase tracking-widest font-black opacity-60">{agent.category}</span>
          </div>
        </div>
        <button 
          onClick={copyPrompt}
          className={`flex items-center gap-2 text-[9px] font-black uppercase px-4 py-2 rounded-xl border transition-all w-full sm:w-auto justify-center ${
            copied 
              ? 'bg-emerald-600 text-white border-emerald-500' 
              : (isLight ? 'bg-slate-100 text-slate-600 border-slate-200 hover:bg-slate-200' : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-slate-200 hover:bg-slate-700')
          }`}
        >
          {copied ? <Check size={14} strokeWidth={3} /> : <Copy size={14} />}
          {copied ? 'Copiado' : 'Copiar Prompt'}
        </button>
      </div>
      <div className="p-6 md:p-8 space-y-8">
        <div>
          <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-3">Especialidade</h4>
          <p className={`text-sm leading-relaxed font-bold uppercase tracking-tight ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>{agent.shortDescription}</p>
        </div>
        <div>
          <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-4">Dicas de Uso</h4>
          <ul className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {agent.usageTips.map((tip: string, i: number) => (
              <li key={i} className={`flex gap-3 text-[11px] font-bold uppercase tracking-tight p-3 rounded-xl border ${isLight ? 'bg-slate-50 border-slate-100 text-slate-500' : 'bg-slate-800/40 border-slate-700/50 text-slate-400'}`}>
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1 flex-shrink-0"></div>
                {tip}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export const Help: React.FC = () => {
  const theme = useThemeStore((state) => state.theme);
  const isLight = theme === 'light';

  return (
    <div className="space-y-16 md:space-y-24 pb-20 max-w-6xl mx-auto animate-in fade-in duration-700">
      <header className="text-center space-y-6 px-4">
        <div className="inline-flex p-5 bg-emerald-500/10 text-emerald-500 rounded-[32px] shadow-2xl shadow-emerald-500/10 mb-4">
          <HelpCircle size={48} className="md:size-64" />
        </div>
        <h2 className={`text-4xl md:text-6xl font-black tracking-tighter uppercase ${isLight ? 'text-slate-900' : 'text-slate-100'}`}>Central de Comando</h2>
        <p className="text-slate-500 max-w-2xl mx-auto text-base md:text-xl font-bold leading-relaxed uppercase tracking-tight">
          Guia completo para dominar a inteligência artificial na gestão dos seus projetos.
        </p>
      </header>

      {/* Como Funciona o Cockpit */}
      <section className="space-y-8 px-4">
        <div className={`flex items-center gap-4 border-b pb-6 ${isLight ? 'border-slate-200 text-slate-900' : 'border-slate-800 text-slate-100'}`}>
          <LayoutDashboard className="text-emerald-500" size={32} />
          <h3 className="text-2xl md:text-3xl font-black uppercase tracking-tight">Arquitetura do Sistema</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { 
              icon: LayoutDashboard, 
              title: 'Dashboard', 
              desc: 'Visão executiva e rápida de todos os projetos em andamento e zonas de risco.' 
            },
            { 
              icon: FolderKanban, 
              title: 'Projetos', 
              desc: 'Lista central onde você cria e gerencia os workspaces individuais de cada iniciativa.' 
            },
            { 
              icon: Cpu, 
              title: 'Agents Lab', 
              desc: 'Ambiente sandbox para falar diretamente com qualquer IA sem estar vinculado a um projeto.' 
            },
            { 
              icon: SettingsIcon, 
              title: 'Configurações', 
              desc: 'Onde você insere sua API Key do Gemini e ajusta o comportamento de cada agente.' 
            }
          ].map((item, i) => (
            <div key={i} className={`p-8 rounded-[32px] border transition-all ${isLight ? 'bg-white border-slate-200 shadow-sm' : 'bg-slate-900 border-slate-800'}`}>
              <item.icon size={32} className="text-emerald-500 mb-6" />
              <h4 className={`text-sm font-black uppercase tracking-widest mb-3 ${isLight ? 'text-slate-900' : 'text-slate-100'}`}>{item.title}</h4>
              <p className="text-[11px] font-bold text-slate-500 leading-relaxed uppercase tracking-tight">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Fluxo de Trabalho em Projetos */}
      <section className="space-y-12 px-4">
        <div className={`flex items-center gap-4 border-b pb-6 ${isLight ? 'border-slate-200 text-slate-900' : 'border-slate-800 text-slate-100'}`}>
          <Target className="text-emerald-500" size={32} />
          <h3 className="text-2xl md:text-3xl font-black uppercase tracking-tight">Workflow de Projetos</h3>
        </div>

        <div className="space-y-6">
          <div className={`p-8 md:p-12 rounded-[48px] border relative overflow-hidden ${isLight ? 'bg-white border-slate-200' : 'bg-slate-900 border-slate-800'}`}>
            <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div className="space-y-6">
                <div className="inline-flex px-4 py-2 bg-emerald-500 text-white rounded-xl text-[10px] font-black uppercase tracking-widest">Passo a Passo</div>
                <h4 className={`text-3xl font-black uppercase tracking-tighter ${isLight ? 'text-slate-900' : 'text-slate-100'}`}>O Poder do Workspace</h4>
                <p className={`text-sm leading-relaxed font-bold uppercase tracking-tight ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
                  Ao abrir um projeto, você entra no **Workspace**. Lá, o sistema divide a inteligência em abas especializadas. 
                  O chat lateral sempre carrega o agente correspondente à aba selecionada.
                </p>
                <div className="space-y-4">
                  {[
                    { icon: Workflow, text: 'Aba BPMN: Especialista em processos modela seus fluxos.' },
                    { icon: MessageSquare, text: 'Aba Comms: Gera e-mails e updates para stakeholders.' },
                    { icon: Sparkles, text: 'Aba Design: Transforma ideias em fluxos de telas detalhados.' }
                  ].map((feat, idx) => (
                    <div key={idx} className="flex items-center gap-4">
                      <div className="p-2 bg-emerald-500/10 text-emerald-600 rounded-lg"><feat.icon size={18} /></div>
                      <span className={`text-[11px] font-black uppercase tracking-widest ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>{feat.text}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className={`rounded-3xl border p-4 aspect-video flex items-center justify-center relative ${isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-950 border-slate-800'}`}>
                 <div className="text-center space-y-2 opacity-40">
                    <LayoutDashboard size={48} className="mx-auto text-emerald-500" />
                    <p className="text-[10px] font-black uppercase tracking-widest">Interface do Workspace</p>
                 </div>
                 {/* Elementos decorativos simulando a UI */}
                 <div className="absolute top-4 left-4 right-4 h-6 bg-slate-400/10 rounded-lg"></div>
                 <div className="absolute top-14 left-4 w-1/4 bottom-4 bg-slate-400/10 rounded-lg"></div>
                 <div className="absolute top-14 right-4 w-2/3 bottom-4 bg-emerald-500/5 border border-emerald-500/20 rounded-lg flex items-center justify-center">
                    <MessageSquare size={24} className="text-emerald-500 animate-pulse" />
                 </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Manual dos Especialistas */}
      <section className="space-y-12 px-4">
        <div className={`flex items-center gap-4 border-b pb-6 ${isLight ? 'border-slate-200 text-slate-900' : 'border-slate-800 text-slate-100'}`}>
          <BookOpen className="text-emerald-500" size={32} />
          <h3 className="text-2xl md:text-3xl font-black uppercase tracking-tight">Manual dos Agentes</h3>
        </div>
        
        <div className="grid grid-cols-1 gap-8">
          {AGENTS_DEFINITIONS.map(agent => (
            <AgentDocCard key={agent.id} agent={agent} isLight={isLight} />
          ))}
        </div>
      </section>

      {/* Footer Mobile Friendly */}
      <div className={`mx-4 p-8 md:p-16 rounded-[40px] md:rounded-[60px] text-center space-y-8 shadow-2xl relative overflow-hidden group ${isLight ? 'bg-white border border-slate-200' : 'bg-slate-900 border border-slate-800'}`}>
        <div className={`absolute top-0 right-0 w-96 h-96 blur-[120px] rounded-full -mr-48 -mt-48 transition-all ${isLight ? 'bg-emerald-500/5' : 'bg-emerald-500/10'}`}></div>
        <h4 className={`text-3xl md:text-4xl font-black tracking-tight uppercase ${isLight ? 'text-slate-900' : 'text-slate-100'}`}>Pronto para Decolar?</h4>
        <p className="text-slate-500 max-w-lg mx-auto font-black uppercase text-[10px] md:text-xs tracking-[0.2em] leading-relaxed">
          Tudo o que você precisa é da sua API Key configurada. Seus projetos esperam por você.
        </p>
        <div className="pt-6 flex flex-col sm:flex-row justify-center gap-4 md:gap-6 relative z-10">
          <a href="/#/projects" className="bg-emerald-600 hover:bg-emerald-500 text-white font-black py-4 md:py-5 px-8 md:px-12 rounded-2xl md:rounded-3xl transition-all shadow-2xl shadow-emerald-600/20 active:scale-95 uppercase tracking-widest text-[10px] md:text-xs flex items-center justify-center gap-3">
            Acessar Projetos <ArrowRight size={20} />
          </a>
          <a href="/#/settings" className={`font-black py-4 md:py-5 px-8 md:px-12 rounded-2xl md:rounded-3xl transition-all active:scale-95 uppercase tracking-widest text-[10px] md:text-xs border flex items-center justify-center gap-3 ${isLight ? 'bg-slate-100 border-slate-200 text-slate-600 hover:bg-slate-200' : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-slate-200'}`}>
            Configurar API
          </a>
        </div>
      </div>
    </div>
  );
};
