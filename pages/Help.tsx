
import React from 'react';
import { AGENTS_DEFINITIONS } from '../constants';
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

const AgentDocCard = ({ agent }: any) => {
  const [copied, setCopied] = React.useState(false);

  const copyPrompt = () => {
    navigator.clipboard.writeText(agent.systemPrompt);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-sm transition-colors">
      <div className="p-6 border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="p-2.5 bg-slate-800 text-emerald-400 rounded-xl transition-colors">
            <Bot size={24} />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-100 uppercase tracking-tight">{agent.displayName}</h3>
            <span className="text-[10px] text-slate-500 uppercase tracking-widest font-black">{agent.category}</span>
          </div>
        </div>
      </div>
      <div className="p-6 space-y-6">
        <div>
          <h4 className="text-xs font-black text-slate-500 uppercase tracking-wider mb-2">Descrição</h4>
          <p className="text-sm text-slate-400 leading-relaxed font-medium">{agent.shortDescription}</p>
        </div>
        <div>
          <h4 className="text-xs font-black text-slate-500 uppercase tracking-wider mb-3">Melhores tipos de pergunta</h4>
          <ul className="space-y-2">
            {agent.usageTips.map((tip: string, i: number) => (
              <li key={i} className="flex gap-2 text-sm text-slate-400 items-start font-medium">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 flex-shrink-0"></div>
                {tip}
              </li>
            ))}
          </ul>
        </div>
        <div className="pt-4 border-t border-slate-800">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-xs font-black text-slate-500 uppercase tracking-wider">System Prompt Base</h4>
            <button 
              onClick={copyPrompt}
              className={`flex items-center gap-1.5 text-[10px] font-black uppercase py-1 px-2 rounded border transition-all ${
                copied ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-slate-200'
              }`}
            >
              {copied ? <Check size={12} /> : <Copy size={12} />}
              {copied ? 'Copiado!' : 'Copiar Prompt'}
            </button>
          </div>
          <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 max-h-40 overflow-y-auto scrollbar-hide transition-colors">
            <code className="text-[11px] text-slate-500 font-mono leading-relaxed whitespace-pre-wrap">
              {agent.systemPrompt}
            </code>
          </div>
        </div>
      </div>
    </div>
  );
};

export const Help: React.FC = () => {
  return (
    <div className="space-y-16 pb-20 max-w-5xl mx-auto animate-in fade-in duration-700">
      <header className="text-center space-y-4">
        <div className="inline-flex p-3 bg-emerald-500/10 text-emerald-400 rounded-full mb-2">
          <HelpCircle size={48} />
        </div>
        <h2 className="text-5xl font-black text-slate-100 tracking-tighter uppercase">Command Center Help</h2>
        <p className="text-slate-400 max-w-2xl mx-auto text-lg font-bold leading-relaxed">
          O guia definitivo para operar seu cockpit de gestão e extrair o máximo das IAs especialistas.
        </p>
      </header>

      {/* Seção Operacional de Projetos */}
      <section className="space-y-10">
        <div className="flex items-center gap-3 border-b border-slate-800 pb-4">
          <FolderKanban className="text-emerald-400" />
          <h3 className="text-2xl font-black text-slate-100 uppercase tracking-tight">O Fluxo Operacional de Projetos</h3>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="bg-slate-900/50 border border-slate-800 p-8 rounded-3xl relative group transition-colors">
            <div className="absolute -top-4 -left-4 w-10 h-10 bg-emerald-600 rounded-full flex items-center justify-center font-black text-white shadow-lg shadow-emerald-600/20">1</div>
            <Target size={32} className="text-emerald-400 mb-6 group-hover:scale-110 transition-transform" />
            <h4 className="text-lg font-black text-slate-100 mb-3 uppercase tracking-tight">Definição do Projeto</h4>
            <p className="text-sm text-slate-500 leading-relaxed font-bold">
              Tudo começa no botão <strong className="text-slate-100">"Novo Projeto"</strong>. Aqui você define o DNA da iniciativa: nome, objetivo central, metodologia e orçamento previsto. Estes dados alimentam o contexto inicial de todos os agentes.
            </p>
          </div>

          <div className="bg-slate-900/50 border border-slate-800 p-8 rounded-3xl relative group transition-colors">
            <div className="absolute -top-4 -left-4 w-10 h-10 bg-emerald-600 rounded-full flex items-center justify-center font-black text-white shadow-lg shadow-emerald-600/20">2</div>
            <Layers size={32} className="text-blue-400 mb-6 group-hover:scale-110 transition-transform" />
            <h4 className="text-lg font-black text-slate-100 mb-3 uppercase tracking-tight">Navegação no Cockpit</h4>
            <p className="text-sm text-slate-500 leading-relaxed font-bold">
              Ao abrir um projeto, você entra no <strong className="text-slate-100">Workspace</strong>. Use as abas superiores para alternar entre as dimensões do projeto (Backlog, BPMN, Design, Riscos). Cada aba muda o layout e o agente de IA disponível.
            </p>
          </div>

          <div className="bg-slate-900/50 border border-slate-800 p-8 rounded-3xl relative group transition-colors">
            <div className="absolute -top-4 -left-4 w-10 h-10 bg-emerald-600 rounded-full flex items-center justify-center font-black text-white shadow-lg shadow-emerald-600/20">3</div>
            <MousePointer2 size={32} className="text-yellow-400 mb-6 group-hover:scale-110 transition-transform" />
            <h4 className="text-lg font-black text-slate-100 mb-3 uppercase tracking-tight">Interação Especializada</h4>
            <p className="text-sm text-slate-500 leading-relaxed font-bold">
              O chat à direita é contextual. Se estiver na aba <strong className="text-slate-100">Riscos</strong>, você falará com o Analista de Riscos. Peça para ele mapear ameaças ou sugerir planos de mitigação baseados no objetivo do projeto.
            </p>
          </div>
        </div>

        <div className="bg-emerald-500/5 border border-emerald-500/10 p-8 rounded-[32px] space-y-4 transition-colors">
          <h4 className="text-sm font-black text-emerald-400 uppercase tracking-widest flex items-center gap-2">
            <Zap size={16} /> Dica de Ouro
          </h4>
          <p className="text-slate-400 leading-relaxed font-bold">
            O Command Center salva seu progresso automaticamente no navegador. Você pode sair, fechar o computador e, ao voltar, seus projetos e históricos de chat estarão exatamente onde você os deixou. <strong className="text-slate-100">Não esqueça de configurar sua API Key em "Configurações" para que as IAs funcionem!</strong>
          </p>
        </div>
      </section>

      {/* Guia de Agentes */}
      <section className="space-y-10">
        <div className="flex items-center gap-3 border-b border-slate-800 pb-4">
          <BookOpen className="text-emerald-400" />
          <h3 className="text-2xl font-black text-slate-100 uppercase tracking-tight">Guia de Especialistas</h3>
        </div>
        
        <div className="grid grid-cols-1 gap-8">
          {AGENTS_DEFINITIONS.map(agent => (
            <AgentDocCard key={agent.id} agent={agent} />
          ))}
        </div>
      </section>

      {/* Footer Info */}
      <div className="bg-slate-900 border border-slate-800 p-12 rounded-[40px] text-center space-y-6 shadow-2xl transition-colors">
        <h4 className="text-3xl font-black text-slate-100 tracking-tight uppercase">Pronto para a decolagem?</h4>
        <p className="text-slate-400 max-w-lg mx-auto font-black uppercase text-xs tracking-widest">
          Crie seu primeiro projeto, selecione uma dimensão e comece a delegar tarefas para sua equipe de IAs especialistas.
        </p>
        <div className="pt-4 flex flex-col sm:flex-row justify-center gap-4">
          <a href="/#/projects" className="inline-flex items-center gap-3 bg-emerald-600 hover:bg-emerald-500 text-white font-black py-4 px-10 rounded-2xl transition-all shadow-xl shadow-emerald-500/20 active:scale-95 uppercase tracking-widest text-xs">
            Ir para Projetos <ArrowRight size={16} />
          </a>
          <a href="/#/settings" className="inline-flex items-center gap-3 bg-slate-800 hover:bg-slate-700 text-slate-400 font-black py-4 px-10 rounded-2xl transition-all active:scale-95 uppercase tracking-widest text-xs border border-slate-700">
            Configurações
          </a>
        </div>
      </div>
    </div>
  );
};
