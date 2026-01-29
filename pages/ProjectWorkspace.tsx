
import React, { useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useProjectsStore } from '../store/useProjectsStore';
import { useChatStore } from '../store/useChatStore';
import { useThemeStore } from '../store/useThemeStore';
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
  Calendar,
  RefreshCw
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
  { id: 'overview', label: 'Geral', icon: Layout, description: 'Visão executiva.', agentId: 'pmAiPartner' },
  { id: 'planning', label: 'Backlog', icon: Target, description: 'Histórias INVEST.', agentId: 'pmAiPartner' },
  { id: 'processes', label: 'BPMN', icon: Workflow, description: 'Modelos compatíveis.', agentId: 'bpmnMasterArchitect' },
  { id: 'risks', label: 'Riscos', icon: AlertTriangle, description: 'Matriz de calor.', agentId: 'riskDecisionAnalyst' },
  { id: 'design', label: 'Design', icon: LayoutTemplate, description: 'UX/UI flows.', agentId: 'uiScreensDesigner' },
  { id: 'comms', label: 'Comunicação', icon: MessageSquare, description: 'Updates semanais.', agentId: 'stakeholderCommsWriter' },
  { id: 'metrics', label: 'Métricas', icon: BarChart3, description: 'KPIs e saúde.', agentId: 'metricsReportingArchitect' },
  { id: 'meetings', label: 'Atas', icon: FileText, description: 'Decisões e ações.', agentId: 'meetingDocsCopilot' },
];

export const ProjectWorkspace: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const theme = useThemeStore((state) => state.theme);
  
  const projects = useProjectsStore((state) => state.projects);
  const project = useMemo(() => projects.find(p => p.id === id), [projects, id]);
  
  const [activeTab, setActiveTab] = useState<TabId>('overview');
  const clearChat = useChatStore((state) => state.clearChat);

  const activeAgent = useMemo(() => 
    TABS.find(t => t.id === activeTab) || TABS[0], 
    [activeTab]
  );

  const chatId = useMemo(() => 
    `${id}-${activeTab === 'overview' ? 'pmAiPartner' : activeAgent.agentId}`,
    [id, activeTab, activeAgent]
  );

  // Função para limpar todos os chats do projeto de uma vez
  const handleGlobalReset = () => {
    if (confirm("Deseja limpar o histórico de TODOS os especialistas deste projeto? Isso economiza tokens e reinicia o contexto da IA para novas diretrizes.")) {
      TABS.forEach(tab => {
        const tid = `${id}-${tab.id === 'overview' ? 'pmAiPartner' : tab.agentId}`;
        clearChat(tid);
      });
      alert("Sistema de IA reiniciado. Contexto limpo.");
    }
  };

  const hasStarted = useChatStore((state) => (state.chats[chatId]?.length || 0) > 0);

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
    let healthColor = 'text-blue-600';

    if (end) {
      const totalDuration = end.getTime() - start.getTime();
      const elapsed = now.getTime() - start.getTime();
      timeProgress = Math.min(100, Math.max(0, Math.round((elapsed / totalDuration) * 100)));
      if (timeProgress > 90 && !hasStarted) { healthStatus = 'Atrasado'; healthColor = 'text-red-600'; }
      else if (timeProgress > 50 && !hasStarted) { healthStatus = 'Atenção'; healthColor = 'text-amber-600'; }
      else { healthStatus = 'Em Dia'; healthColor = 'text-emerald-600'; }
    } else {
      timeProgress = hasStarted ? 10 : 0;
      healthStatus = hasStarted ? 'Em Execução' : 'Início';
    }
    return { timeProgress, healthStatus, healthColor };
  }, [project, hasStarted]);

  if (!project) return <div>Projeto não encontrado.</div>;

  const renderVisualArea = () => {
    const cardBase = `border p-6 rounded-3xl space-y-4 shadow-lg ${theme === 'light' ? 'bg-white border-slate-200' : 'bg-slate-900 border-slate-800'}`;
    
    switch (activeTab) {
      case 'overview':
        return (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className={cardBase}>
                <h3 className="text-emerald-600 font-black flex items-center gap-2 text-xs uppercase tracking-wider"><Zap size={18}/> Saúde do Projeto</h3>
                <div className="flex items-center gap-4">
                  <div className={`w-16 h-16 rounded-full border-4 flex items-center justify-center transition-colors ${metrics?.healthColor.replace('text-', 'border-')} ${hasStarted ? 'animate-pulse' : ''}`}>
                    <span className={`text-sm font-black ${metrics?.healthColor}`}>
                      {hasStarted ? 'OK' : '--'}
                    </span>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 font-bold uppercase tracking-tight">Análise Preditiva</p>
                    <p className={`text-[10px] uppercase font-black mt-1 tracking-widest ${metrics?.healthColor}`}>
                      {metrics?.healthStatus}
                    </p>
                  </div>
                </div>
              </div>
              <div className={cardBase}>
                <h3 className="text-blue-600 font-black flex items-center gap-2 text-xs uppercase tracking-wider"><Clock size={18}/> Cronograma</h3>
                <div className="space-y-2">
                  <div className="flex justify-between text-[10px] uppercase font-black text-slate-500">
                    <span>Tempo Decorrido</span>
                    <span className={theme === 'light' ? 'text-slate-900' : 'text-slate-100'}>{metrics?.timeProgress}%</span>
                  </div>
                  <div className={`h-1.5 w-full rounded-full overflow-hidden ${theme === 'light' ? 'bg-slate-100' : 'bg-slate-800'}`}>
                    <div className="h-full bg-blue-600 transition-all duration-1000" style={{ width: `${metrics?.timeProgress}%` }}></div>
                  </div>
                </div>
              </div>
            </div>

            <div className={`border rounded-[32px] p-8 space-y-6 shadow-xl ${theme === 'light' ? 'bg-white border-slate-200 shadow-slate-200/50' : 'bg-slate-900 border-slate-800'}`}>
              <h3 className={`text-sm font-black uppercase tracking-widest flex items-center gap-2 ${theme === 'light' ? 'text-slate-900' : 'text-slate-100'}`}>
                <ClipboardList size={18} className="text-emerald-600" /> Resumo Estratégico
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {[
                  { label: 'Metodologia', value: project.methodology },
                  { label: 'Budget Alocado', value: project.budget || 'Não definido' },
                  { label: 'Prazo Final', value: project.endDate || 'Pendente' }
                ].map((item, i) => (
                  <div key={i} className={`p-4 rounded-2xl border transition-colors ${theme === 'light' ? 'bg-slate-50 border-slate-100' : 'bg-slate-950/50 border-slate-800/50'}`}>
                    <p className="text-[9px] font-black text-slate-500 uppercase mb-2">{item.label}</p>
                    <p className={`text-xs font-bold ${theme === 'light' ? 'text-slate-800' : 'text-slate-200'}`}>{item.value}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );
      default:
        return (
          <div className={`border rounded-[32px] p-12 flex flex-col items-center justify-center text-center space-y-6 min-h-[400px] animate-in fade-in duration-500 ${
            theme === 'light' ? 'bg-white border-slate-200' : 'bg-slate-900 border-slate-800'
          }`}>
             <div className={`p-6 rounded-full border shadow-xl ${theme === 'light' ? 'bg-slate-50 border-slate-200 text-slate-400' : 'bg-slate-800 border-slate-700 text-slate-600'}`}>
              <Box size={48} />
            </div>
            <div className="space-y-2">
              <h3 className={`text-xl font-black uppercase tracking-tight ${theme === 'light' ? 'text-slate-900' : 'text-slate-100'}`}>Aguardando Documentação</h3>
              <p className="text-sm text-slate-500 max-w-sm font-medium">
                Este espaço será preenchido conforme o chat evolui e o especialista gera artefatos.
              </p>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="space-y-8 pb-20 animate-in fade-in duration-700">
      <header className="flex flex-col gap-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <button onClick={() => navigate('/projects')} className="group flex items-center gap-2 text-slate-500 hover:text-emerald-600 transition-all text-xs font-black uppercase tracking-widest w-fit">
            <ChevronLeft size={16} className="group-hover:-translate-x-1 transition-transform" /> Voltar aos Projetos
          </button>
          
          <button 
            onClick={handleGlobalReset}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl border text-[9px] font-black uppercase tracking-widest transition-all ${
              theme === 'light' 
                ? 'text-slate-400 border-slate-200 hover:text-red-500 hover:bg-red-50' 
                : 'text-slate-500 border-slate-700 hover:text-red-400 hover:bg-red-500/10'
            }`}
            title="Limpa o contexto de todos os especialistas deste projeto"
          >
            <RefreshCw size={14} /> Reiniciar Sistema de IA
          </button>
        </div>
        
        <div className={`border p-8 rounded-[40px] shadow-2xl relative overflow-hidden transition-colors group ${
          theme === 'light' ? 'bg-white border-slate-200' : 'bg-slate-900 border-slate-800'
        }`}>
          <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 blur-3xl rounded-full -mr-32 -mt-32"></div>
          
          <div className="relative z-10 flex-1 min-w-0 space-y-4">
            <div className="flex items-center gap-3">
              <span className="px-3 py-1 bg-emerald-500/10 text-emerald-600 text-[10px] font-black rounded-lg border border-emerald-500/20 uppercase tracking-widest">{project.methodology}</span>
              <div className="w-1.5 h-1.5 rounded-full bg-slate-300 dark:bg-slate-700"></div>
              <span className="text-slate-500 text-[10px] font-black uppercase tracking-widest">ID: {project.id.slice(0, 8)}</span>
            </div>
            
            <h2 className={`text-4xl md:text-5xl font-black tracking-tighter leading-tight uppercase group-hover:text-emerald-600 transition-colors ${theme === 'light' ? 'text-slate-900' : 'text-slate-100'}`}>
              {project.name}
            </h2>
            
            <p className={`text-base font-bold uppercase tracking-tight leading-relaxed max-w-3xl ${theme === 'light' ? 'text-slate-600' : 'text-slate-400'}`}>
              {project.objective}
            </p>
          </div>
        </div>
      </header>

      <div className="sticky top-4 z-40">
        <div className={`flex items-center gap-1 p-2 rounded-[28px] border overflow-x-auto whitespace-nowrap scrollbar-hide shadow-2xl backdrop-blur-xl ${
          theme === 'light' ? 'bg-white/90 border-slate-200' : 'bg-slate-900/90 border-slate-800'
        }`}>
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
                    : `hover:bg-slate-100 dark:hover:bg-slate-800 ${theme === 'light' ? 'text-slate-500' : 'text-slate-500 hover:text-slate-200'}`
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
          <div className={`border p-6 rounded-[32px] border-l-4 border-l-emerald-600 shadow-xl transition-colors ${
            theme === 'light' ? 'bg-white border-slate-200 shadow-slate-200/50' : 'bg-slate-900 border-slate-800'
          }`}>
             <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className={`p-3 rounded-2xl ${theme === 'light' ? 'bg-slate-50 text-emerald-600 border border-slate-100' : 'bg-slate-800 text-emerald-400'}`}>
                    <Eye size={22} />
                  </div>
                  <div>
                    <h4 className={`text-sm font-black uppercase tracking-widest ${theme === 'light' ? 'text-slate-900' : 'text-slate-100'}`}>Monitoramento Operacional</h4>
                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-0.5">Artefatos e insights gerados por IA</p>
                  </div>
                </div>
                <div className="hidden md:flex flex-col items-end">
                  <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">Sincronizado</span>
                  <span className="text-[8px] text-slate-500 uppercase">Live Engine Active</span>
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
