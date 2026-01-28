
import React, { useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useProjectsStore } from '../store/useProjectsStore';
import { useChatStore } from '../store/useChatStore';
import { 
  Layout, 
  Workflow, 
  AlertTriangle, 
  LayoutTemplate, 
  MessageSquare, 
  BarChart3, 
  FileText,
  ChevronLeft,
  Target,
  Zap,
  Clock,
  Box,
  TrendingUp,
  ClipboardList,
  Eye,
  Calendar
} from 'lucide-react';
import { ChatPanel } from '../components/ChatPanel';
import { AgentId } from '../types';

type TabId = 'overview' | 'planning' | 'processes' | 'risks' | 'design' | 'comms' | 'metrics' | 'meetings';

interface TabConfig {
  id: TabId;
  label: string;
  icon: any;
  agentId: AgentId;
  description: string;
}

const TABS: TabConfig[] = [
  { id: 'overview', label: 'Geral', icon: Layout, description: 'Visão executiva e status atual.', agentId: 'pmAiPartner' },
  { id: 'planning', label: 'Backlog', icon: Target, description: 'Histórias de usuário e épicos.', agentId: 'pmAiPartner' },
  { id: 'processes', label: 'BPMN', icon: Workflow, description: 'Fluxos e regras de negócio.', agentId: 'bpmnMasterArchitect' },
  { id: 'risks', label: 'Riscos', icon: AlertTriangle, description: 'Matriz de riscos e mitigação.', agentId: 'riskDecisionAnalyst' },
  { id: 'design', label: 'Design', icon: LayoutTemplate, description: 'Mockups e fluxos de tela.', agentId: 'uiScreensDesigner' },
  { id: 'comms', label: 'Comunicação', icon: MessageSquare, description: 'Status reports e e-mails.', agentId: 'stakeholderCommsWriter' },
  { id: 'metrics', label: 'Métricas', icon: BarChart3, description: 'KPIs e saúde do projeto.', agentId: 'metricsReportingArchitect' },
  { id: 'meetings', label: 'Atas', icon: FileText, description: 'Registros de decisões e ações.', agentId: 'meetingDocsCopilot' },
];

export const ProjectWorkspace: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const projects = useProjectsStore((state) => state.projects);
  const project = useMemo(() => projects.find(p => p.id === id), [projects, id]);
  
  const [activeTab, setActiveTab] = useState<TabId>('overview');

  const activeAgent = useMemo(() => 
    TABS.find(t => t.id === activeTab) || TABS[0], 
    [activeTab]
  );

  const chatId = useMemo(() => 
    `${id}-${activeTab === 'overview' ? 'pmAiPartner' : activeAgent.agentId}`,
    [id, activeTab, activeAgent]
  );

  const hasStarted = useChatStore((state) => (state.chats[chatId]?.length || 0) > 0);

  // Lógica de Cálculo de Datas e Saúde
  const metrics = useMemo(() => {
    if (!project) return null;

    const parseDate = (str: string) => {
      const [d, m, y] = str.split('/').map(Number);
      return new Date(y, m - 1, d);
    };

    const now = new Date();
    const start = parseDate(project.startDate);
    const end = project.endDate ? parseDate(project.endDate) : null;

    let timeProgress = 0;
    let healthStatus = 'Em Planejamento';
    let healthColor = 'text-blue-500';

    if (end) {
      const totalDuration = end.getTime() - start.getTime();
      const elapsed = now.getTime() - start.getTime();
      timeProgress = Math.min(100, Math.max(0, Math.round((elapsed / totalDuration) * 100)));

      if (timeProgress > 90 && !hasStarted) {
        healthStatus = 'Atrasado';
        healthColor = 'text-red-500';
      } else if (timeProgress > 50 && !hasStarted) {
        healthStatus = 'Atenção';
        healthColor = 'text-yellow-500';
      } else {
        healthStatus = 'Em Dia';
        healthColor = 'text-emerald-500';
      }
    } else {
      timeProgress = hasStarted ? 10 : 0; // Fallback se não houver data de término
      healthStatus = hasStarted ? 'Em Execução' : 'Início';
    }

    return { timeProgress, healthStatus, healthColor };
  }, [project, hasStarted]);

  if (!project) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center bg-slate-950 min-h-[60vh]">
        <div className="bg-slate-900 p-6 rounded-full text-slate-500 mb-4 border border-slate-800">
          <AlertTriangle size={48} />
        </div>
        <h2 className="text-2xl font-bold text-slate-100 uppercase tracking-tighter">Projeto não encontrado</h2>
        <button 
          onClick={() => navigate('/projects')} 
          className="bg-emerald-600 hover:bg-emerald-500 text-white px-6 py-2 rounded-lg font-black uppercase text-xs mt-6 transition-all"
        >
          Voltar para Projetos
        </button>
      </div>
    );
  }

  const renderVisualArea = () => {
    switch (activeTab) {
      case 'overview':
        return (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl space-y-4 shadow-lg">
                <h3 className="text-emerald-500 font-black flex items-center gap-2 text-xs uppercase tracking-wider"><Zap size={18}/> Saúde do Projeto</h3>
                <div className="flex items-center gap-4">
                  <div className={`w-16 h-16 rounded-full border-4 flex items-center justify-center transition-colors ${metrics?.healthColor.replace('text-', 'border-')} ${hasStarted ? 'animate-pulse' : ''}`}>
                    <span className={`text-sm font-black ${metrics?.healthColor}`}>
                      {hasStarted ? 'OK' : '--'}
                    </span>
                  </div>
                  <div>
                    <p className="text-xs text-slate-400 font-bold uppercase tracking-tight">Análise Preditiva</p>
                    <p className={`text-[10px] uppercase font-black mt-1 tracking-widest ${metrics?.healthColor}`}>
                      {metrics?.healthStatus}
                    </p>
                  </div>
                </div>
              </div>
              <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl space-y-4 shadow-lg">
                <h3 className="text-blue-500 font-black flex items-center gap-2 text-xs uppercase tracking-wider"><Clock size={18}/> Cronograma</h3>
                <div className="space-y-2">
                  <div className="flex justify-between text-[10px] uppercase font-black text-slate-500">
                    <span>Tempo Decorrido</span>
                    <span className="text-slate-100">{metrics?.timeProgress}%</span>
                  </div>
                  <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-blue-500 transition-all duration-1000" 
                      style={{ width: `${metrics?.timeProgress}%` }}
                    ></div>
                  </div>
                  <div className="flex items-center justify-between mt-1">
                    <p className="text-[9px] text-slate-600 font-bold uppercase tracking-tighter">Início: {project.startDate}</p>
                    <p className="text-[9px] text-slate-600 font-bold uppercase tracking-tighter">Fim: {project.endDate || 'S/ Data'}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-[32px] p-8 space-y-6">
              <h3 className="text-sm font-black text-slate-100 uppercase tracking-widest flex items-center gap-2">
                <ClipboardList size={18} className="text-emerald-500" /> Resumo Estratégico
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="p-4 bg-slate-950/50 rounded-2xl border border-slate-800/50">
                  <p className="text-[9px] font-black text-slate-500 uppercase mb-2">Metodologia</p>
                  <p className="text-xs font-bold text-slate-200">{project.methodology}</p>
                </div>
                <div className="p-4 bg-slate-950/50 rounded-2xl border border-slate-800/50">
                  <p className="text-[9px] font-black text-slate-500 uppercase mb-2">Budget Alocado</p>
                  <p className="text-xs font-bold text-slate-200">{project.budget || 'Não definido'}</p>
                </div>
                <div className="p-4 bg-slate-950/50 rounded-2xl border border-slate-800/50">
                  <p className="text-[9px] font-black text-slate-500 uppercase mb-2">Prazo Final</p>
                  <p className="text-xs font-bold text-slate-200">{project.endDate || 'Pendente'}</p>
                </div>
              </div>
            </div>
          </div>
        );
      case 'processes':
        return (
          <div className="bg-slate-900 border border-slate-800 rounded-[32px] p-12 flex flex-col items-center justify-center text-center space-y-6 min-h-[400px] animate-in zoom-in-95 duration-500 relative overflow-hidden">
             <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-5"></div>
            <div className="p-6 bg-blue-500/10 rounded-full text-blue-400 relative z-10 border border-blue-500/20 shadow-2xl">
              <Workflow size={48} />
            </div>
            <div className="space-y-2 relative z-10">
              <h3 className="text-xl font-black text-slate-100 uppercase tracking-tight">Arquitetura de Processos BPMN</h3>
              <p className="text-sm text-slate-500 max-w-sm font-medium">
                Utilize o chat para descrever o fluxo. O <span className="text-blue-400">BPMN Master Architect</span> criará a lógica estruturada compatível com o Bizagi.
              </p>
            </div>
          </div>
        );
      case 'risks':
        return (
          <div className="bg-slate-900 border border-slate-800 rounded-[32px] p-8 space-y-6 animate-in fade-in duration-500">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-black text-slate-100 uppercase tracking-widest flex items-center gap-2">
                <AlertTriangle size={18} className="text-red-500" /> Radar de Riscos
              </h3>
              <div className="px-3 py-1 bg-red-500/10 text-red-500 text-[10px] font-black rounded-lg border border-red-500/20 uppercase tracking-widest">Monitoramento Ativo</div>
            </div>
            <div className="h-64 border-2 border-dashed border-slate-800 rounded-3xl flex items-center justify-center text-slate-600 bg-slate-950/20">
              <div className="text-center space-y-2">
                <TrendingUp size={32} className="mx-auto mb-2 opacity-20" />
                <p className="text-[10px] font-black uppercase tracking-[0.2em]">Matriz de Calor Vazia</p>
                <p className="text-[10px] font-bold text-slate-500 uppercase max-w-[200px]">Peça ao agente para mapear os riscos iniciais.</p>
              </div>
            </div>
          </div>
        );
      default:
        return (
          <div className="bg-slate-900 border border-slate-800 rounded-[32px] p-12 flex flex-col items-center justify-center text-center space-y-6 min-h-[400px] animate-in fade-in duration-500">
             <div className="p-6 bg-slate-800 rounded-full text-slate-600 border border-slate-700 shadow-xl">
              <Box size={48} />
            </div>
            <div className="space-y-2">
              <h3 className="text-xl font-black text-slate-100 uppercase tracking-tight">Aguardando Documentação</h3>
              <p className="text-sm text-slate-500 max-w-sm font-medium">
                Este espaço será preenchido com artefatos, tabelas e visualizações conforme o chat evolui.
              </p>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="space-y-8 pb-20 animate-in fade-in duration-700">
      <header className="flex flex-col gap-6">
        <button onClick={() => navigate('/projects')} className="group flex items-center gap-2 text-slate-500 hover:text-emerald-500 transition-all text-xs font-black uppercase tracking-widest w-fit">
          <ChevronLeft size={16} className="group-hover:-translate-x-1 transition-transform" /> Voltar aos Projetos
        </button>
        
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 bg-slate-900 border border-slate-800 p-8 rounded-[40px] shadow-2xl relative overflow-hidden transition-colors group">
          <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 blur-3xl rounded-full -mr-32 -mt-32"></div>
          
          <div className="relative z-10 flex-1 min-w-0 space-y-4">
            <div className="flex items-center gap-3">
              <span className="px-3 py-1 bg-emerald-500/10 text-emerald-400 text-[10px] font-black rounded-lg border border-emerald-500/20 uppercase tracking-widest">{project.methodology}</span>
              <div className="w-1.5 h-1.5 rounded-full bg-slate-700"></div>
              <span className="text-slate-500 text-[10px] font-black uppercase tracking-widest">ID: {project.id.slice(0, 8)}</span>
            </div>
            
            <h2 className="text-4xl md:text-5xl font-black text-slate-100 tracking-tighter leading-tight uppercase group-hover:text-emerald-50 transition-colors">
              {project.name}
            </h2>
            
            <div className="flex items-start gap-3 text-slate-500">
               <Target size={20} className="text-emerald-500 mt-1 flex-shrink-0" /> 
               <p className="text-base font-bold uppercase tracking-tight leading-relaxed text-slate-400">
                 {project.objective}
               </p>
            </div>
          </div>

          <div className="relative z-10 flex flex-col items-end gap-4 flex-shrink-0">
             <div className={`px-6 py-2 rounded-2xl text-[10px] font-black uppercase tracking-widest border shadow-xl transition-all ${
              !hasStarted ? 'bg-slate-800 text-slate-500 border-slate-700' :
              project.status === 'Ativo' ? 'bg-emerald-600 text-white border-emerald-400' :
              'bg-red-600 text-white border-red-400'
            }`}>
              {hasStarted ? project.status : 'Aguardando Início'}
            </div>
            {project.budget && (
              <div className="bg-slate-950/50 px-4 py-2 rounded-xl border border-slate-800/50">
                 <p className="text-[9px] text-slate-600 font-black uppercase tracking-widest text-right mb-0.5">Budget</p>
                 <p className="text-base font-black text-slate-100 leading-none">{project.budget}</p>
              </div>
            )}
          </div>
        </div>
      </header>

      <div className="sticky top-4 z-40">
        <div className="flex items-center gap-1 bg-slate-900/90 backdrop-blur-xl p-2 rounded-[28px] border border-slate-800 overflow-x-auto whitespace-nowrap scrollbar-hide shadow-2xl">
          {TABS.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button 
                key={tab.id} 
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-6 py-3.5 rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all ${
                  isActive 
                    ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-500/20' 
                    : 'text-slate-500 hover:bg-slate-800 hover:text-slate-200'
                }`}
              >
                <Icon size={16} strokeWidth={isActive ? 3 : 2} /> 
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        <div className="lg:col-span-7 xl:col-span-8 space-y-6 min-h-[600px]">
          <div className="bg-slate-900 border border-slate-800 p-6 rounded-[32px] border-l-4 border-l-emerald-500 shadow-xl">
             <div className="flex items-center gap-4">
                <div className="p-3 bg-slate-800 rounded-2xl text-emerald-400">
                  <Eye size={22} />
                </div>
                <div>
                  <h4 className="text-sm font-black text-slate-100 uppercase tracking-widest">Monitoramento Operacional</h4>
                  <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-0.5">Artefatos e insights gerados por IA</p>
                </div>
             </div>
          </div>
          <div className="flex-1">
            {renderVisualArea()}
          </div>
        </div>

        <div className="lg:col-span-5 xl:col-span-4">
          <div className="h-[750px] sticky top-28">
            <ChatPanel 
              agentId={activeAgent.agentId} 
              projectId={id} 
              key={chatId}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
