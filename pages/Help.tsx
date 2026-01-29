
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
  ArrowRight,
  LayoutDashboard,
  Settings as SettingsIcon,
  Sparkles,
  Key,
  ExternalLink,
  Settings2,
  BrainCircuit,
  Wand2,
  Database
} from 'lucide-react';
import { Link } from 'react-router-dom';

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
          <HelpCircle size={48} />
        </div>
        <h2 className={`text-4xl md:text-6xl font-black tracking-tighter uppercase ${isLight ? 'text-slate-900' : 'text-slate-100'}`}>Manual do Operador</h2>
        <p className="text-slate-500 max-w-2xl mx-auto text-base md:text-xl font-bold leading-relaxed uppercase tracking-tight">
          Configure o "DNA" de cada especialista e defina como o cockpit deve processar suas ordens.
        </p>
      </header>

      {/* Orquestração Granular */}
      <section className="space-y-12 px-4">
        <div className={`flex items-center gap-4 border-b pb-6 ${isLight ? 'border-slate-200 text-slate-900' : 'border-slate-800 text-slate-100'}`}>
          <BrainCircuit className="text-emerald-500" size={32} />
          <h3 className="text-2xl md:text-3xl font-black uppercase tracking-tight">Definindo a Inteligência</h3>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className={`p-8 md:p-12 rounded-[48px] border relative overflow-hidden flex flex-col justify-between ${isLight ? 'bg-white border-slate-200' : 'bg-slate-900 border-slate-800'}`}>
            <div className="space-y-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-emerald-500/10 text-emerald-500 rounded-2xl">
                  <Database size={24} />
                </div>
                <h4 className={`text-xl font-black uppercase tracking-tighter ${isLight ? 'text-slate-900' : 'text-slate-100'}`}>Especialistas Agnósticos</h4>
              </div>
              <p className={`text-xs font-bold uppercase leading-relaxed tracking-tight ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
                No Cockpit, cada agente pode ter sua própria configuração de API. Você pode usar o <b>Google AI Studio</b> globalmente ou definir modelos específicos para tarefas diferentes:
              </p>
              <ul className="space-y-3">
                <li className="flex items-center gap-3 text-[10px] font-black uppercase text-emerald-500 bg-emerald-500/5 p-3 rounded-xl border border-emerald-500/10">
                  <Wand2 size={14} /> UI Designer &rarr; Gemini 2.5 Flash Image (Design)
                </li>
                <li className="flex items-center gap-3 text-[10px] font-black uppercase text-blue-500 bg-blue-500/5 p-3 rounded-xl border border-blue-500/10">
                  <Zap size={14} /> PM Partner &rarr; Gemini 3 Pro (Raciocínio)
                </li>
              </ul>
            </div>
            <div className="mt-8">
              <Link to="/settings" className="bg-emerald-600 hover:bg-emerald-500 text-white font-black py-4 px-8 rounded-2xl transition-all shadow-xl shadow-emerald-600/20 active:scale-95 uppercase tracking-widest text-[10px] flex items-center justify-center gap-2">
                Definir APIs Agora <Settings2 size={16} />
              </Link>
            </div>
          </div>

          <div className={`p-8 md:p-12 rounded-[48px] border relative overflow-hidden ${isLight ? 'bg-slate-50 border-slate-100' : 'bg-slate-950 border-slate-800'}`}>
            <div className="space-y-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-blue-500/10 text-blue-500 rounded-2xl">
                  <Key size={24} />
                </div>
                <h4 className={`text-xl font-black uppercase tracking-tighter ${isLight ? 'text-slate-900' : 'text-slate-100'}`}>Busca no AI Studio</h4>
              </div>
              <p className={`text-[11px] font-bold uppercase leading-relaxed tracking-tight ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
                Para que as ferramentas funcionem, você deve buscar sua chave no portal do Google. No cockpit, você pode:
              </p>
              <div className="space-y-4">
                <div className="flex gap-4">
                  <div className="w-6 h-6 rounded-full bg-slate-200 dark:bg-slate-800 flex items-center justify-center text-[10px] font-black flex-shrink-0">1</div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">Acessar o Google AI Studio e gerar uma chave gratuita ou paga.</p>
                </div>
                <div className="flex gap-4">
                  <div className="w-6 h-6 rounded-full bg-slate-200 dark:bg-slate-800 flex items-center justify-center text-[10px] font-black flex-shrink-0">2</div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">Usar o botão "Selecionar Chave Cloud" para vincular projetos com faturamento ativo.</p>
                </div>
              </div>
              <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-[10px] font-black uppercase text-blue-500 hover:underline">
                Portal Google AI Studio <ExternalLink size={14} />
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Manual dos Agentes */}
      <section className="space-y-12 px-4">
        <div className={`flex items-center gap-4 border-b pb-6 ${isLight ? 'border-slate-200 text-slate-900' : 'border-slate-800 text-slate-100'}`}>
          <BookOpen className="text-emerald-500" size={32} />
          <h3 className="text-2xl md:text-3xl font-black uppercase tracking-tight">Manual dos Especialistas</h3>
        </div>
        
        <div className="grid grid-cols-1 gap-8">
          {AGENTS_DEFINITIONS.map(agent => (
            <AgentDocCard key={agent.id} agent={agent} isLight={isLight} />
          ))}
        </div>
      </section>

      {/* Footer Final */}
      <div className={`mx-4 p-8 md:p-16 rounded-[40px] md:rounded-[60px] text-center space-y-8 shadow-2xl relative overflow-hidden group ${isLight ? 'bg-white border border-slate-200' : 'bg-slate-900 border border-slate-800'}`}>
        <div className={`absolute top-0 right-0 w-96 h-96 blur-[120px] rounded-full -mr-48 -mt-48 transition-all ${isLight ? 'bg-emerald-500/5' : 'bg-emerald-500/10'}`}></div>
        <h4 className={`text-3xl md:text-4xl font-black tracking-tight uppercase ${isLight ? 'text-slate-900' : 'text-slate-100'}`}>Configuração Concluída?</h4>
        <p className="text-slate-500 max-w-lg mx-auto font-black uppercase text-[10px] md:text-xs tracking-[0.2em] leading-relaxed">
          Salve suas configurações na tela de Inteligência para que as ferramentas usem os provedores corretos.
        </p>
        <div className="pt-6 flex flex-col sm:flex-row justify-center gap-4 md:gap-6 relative z-10">
          <Link to="/settings" className="bg-emerald-600 hover:bg-emerald-500 text-white font-black py-4 md:py-5 px-8 md:px-12 rounded-2xl md:rounded-3xl transition-all shadow-2xl shadow-emerald-600/20 active:scale-95 uppercase tracking-widest text-[10px] md:text-xs flex items-center justify-center gap-3">
            Ir para Configurações <Settings2 size={20} />
          </Link>
          <Link to="/projects" className={`font-black py-4 md:py-5 px-8 md:px-12 rounded-2xl md:rounded-3xl transition-all active:scale-95 uppercase tracking-widest text-[10px] md:text-xs border flex items-center justify-center gap-3 ${isLight ? 'bg-slate-100 border-slate-200 text-slate-600 hover:bg-slate-200' : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-white'}`}>
            Acessar Projetos <ArrowRight size={20} />
          </Link>
        </div>
      </div>
    </div>
  );
};
