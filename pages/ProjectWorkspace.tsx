
import React, { useState, useMemo, useEffect } from 'react';
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
  Box,
  Eye,
  RefreshCw,
  Download,
  Paperclip
} from 'lucide-react';
import { ChatPanel } from '../components/ChatPanel';
import { AgentId, ProjectContext } from '../types';
import { getContext, updateContext, getHistory } from '../services/contextService';
import { AGENTS_MAP } from '../constants';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

type TabId = 'overview' | 'planning' | 'processes' | 'risks' | 'design' | 'comms' | 'metrics' | 'meetings';

interface TabConfig {
  id: TabId;
  label: string;
  icon: any;
  agentId: AgentId;
  description: string;
}

const TABS: TabConfig[] = [
  { id: 'overview', label: AGENTS_MAP.pmAiPartner.displayName, icon: Layout, description: 'Vis�o executiva.', agentId: 'pmAiPartner' },
  { id: 'planning', label: AGENTS_MAP.pmAiPartner.displayName, icon: Target, description: 'Hist�rias INVEST.', agentId: 'pmAiPartner' },
  { id: 'processes', label: AGENTS_MAP.bpmnMasterArchitect.displayName, icon: Workflow, description: 'Modelos compat�veis.', agentId: 'bpmnMasterArchitect' },
  { id: 'risks', label: AGENTS_MAP.riskDecisionAnalyst.displayName, icon: AlertTriangle, description: 'Matriz de calor.', agentId: 'riskDecisionAnalyst' },
  { id: 'design', label: AGENTS_MAP.uiScreensDesigner.displayName, icon: LayoutTemplate, description: 'UX/UI flows.', agentId: 'uiScreensDesigner' },
  { id: 'comms', label: AGENTS_MAP.stakeholderCommsWriter.displayName, icon: MessageSquare, description: 'Updates semanais.', agentId: 'stakeholderCommsWriter' },
  { id: 'metrics', label: AGENTS_MAP.metricsReportingArchitect.displayName, icon: BarChart3, description: 'KPIs e sa�de.', agentId: 'metricsReportingArchitect' },
  { id: 'meetings', label: AGENTS_MAP.meetingDocsCopilot.displayName, icon: FileText, description: 'Decis�es e a��es.', agentId: 'meetingDocsCopilot' },
];

export const ProjectWorkspace: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const theme = useThemeStore((state) => state.theme);
  
  const [activeTab, setActiveTab] = useState<TabId>('overview');
  const clearChat = useChatStore((state) => state.clearChat);
  const projects = useProjectsStore((state) => state.projects);
  const project = useMemo(() => projects.find(p => p.id === id), [projects, id]);
  const [projectContext, setProjectContext] = useState<ProjectContext>(() => getContext(id));
  const [valorDescricao, setValorDescricao] = useState(projectContext.valor.descricao);
  const [valorStakeholders, setValorStakeholders] = useState(projectContext.valor.stakeholders.join(', '));
  const [valorMetricas, setValorMetricas] = useState(projectContext.valor.metricas.join(', '));
  const [valorPrazo, setValorPrazo] = useState(projectContext.valor.prazo);

  useEffect(() => {
    setProjectContext(getContext(id));
  }, [activeTab, id]);

  const activeAgent = useMemo(() => 
    TABS.find(t => t.id === activeTab) || TABS[0], 
    [activeTab]
  );

  const chatId = useMemo(() => 
    `${id}-${activeTab === 'overview' ? 'pmAiPartner' : activeAgent.agentId}`,
    [id, activeTab, activeAgent]
  );

  const docMessages = useChatStore((state) => state.chats[chatId] || []);
  const lastAssistantDoc = useMemo(() => [...docMessages].reverse().find((m) => m.role === 'assistant') || null, [docMessages]);
  const lastAttachments = useMemo(
    () =>
      docMessages
        .filter((m) => m.role === 'user' && m.content.startsWith('Conteudo do anexo'))
        .map((m) => {
          const firstLine = m.content.split('\n')[0] || '';
          return firstLine.replace('Conteudo do anexo (', '').replace('):', '') || 'Anexo';
        }),
    [docMessages]
  );

  // Fun��o para limpar todos os chats do projeto de uma vez
  const handleGlobalReset = () => {
    if (confirm("Deseja limpar o hist�rico de TODOS os especialistas deste projeto? Isso economiza tokens e reinicia o contexto da IA para novas diretrizes.")) {
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
      else if (timeProgress > 50 && !hasStarted) { healthStatus = 'Aten��o'; healthColor = 'text-amber-600'; }
      else { healthStatus = 'Em Dia'; healthColor = 'text-emerald-600'; }
    } else {
      timeProgress = hasStarted ? 10 : 0;
      healthStatus = hasStarted ? 'Em Execu��o' : 'In�cio';
    }
    return { timeProgress, healthStatus, healthColor };
  }, [project, hasStarted]);

  if (!project) return <div>Projeto nao encontrado.</div>;

  const docPanelTitle = useMemo(() => {
    switch (activeTab) {
      case 'processes':
        return 'Documentos de Processo';
      case 'risks':
        return 'Analises de Risco';
      case 'design':
        return 'Entregas de Design';
      case 'metrics':
        return 'Relatorios de Metricas';
      case 'meetings':
        return 'Atas e Decisoes';
      default:
        return 'Documentacao Gerada';
    }
  }, [activeTab]);

  const artifactInfo = useMemo(() => {
    const baseName = project?.name || 'artefato';
    switch (activeTab) {
      case 'processes':
        return { filename: `${baseName}-processo.bpmn`, mime: 'application/xml' };
      case 'planning':
        return { filename: `${baseName}-backlog.md`, mime: 'text/markdown' };
      case 'risks':
        return { filename: `${baseName}-riscos.md`, mime: 'text/markdown' };
      case 'design':
        return { filename: `${baseName}-design.md`, mime: 'text/markdown' };
      default:
        return { filename: `${baseName}-artefato.md`, mime: 'text/markdown' };
    }
  }, [activeTab, project]);

  const renderValueCard = () => (
    <div className={`border p-6 rounded-[32px] space-y-6 shadow-xl ${theme === 'light' ? 'bg-white border-slate-200 shadow-slate-200/50' : 'bg-slate-900 border-slate-800'}`}>
      <h3 className="text-emerald-600 font-black flex items-center gap-2 text-xs uppercase tracking-wider"><Target size={18}/> Valor do Projeto</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="text-[9px] font-black text-slate-500 uppercase tracking-[0.2em]">Descricao de Valor</label>
          <textarea 
            value={valorDescricao} 
            onChange={(e) => setValorDescricao(e.target.value)}
            className={`w-full border rounded-2xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 h-24 resize-none transition-colors ${theme === 'light' ? 'bg-white border-slate-200 text-slate-900' : 'bg-slate-900 border-slate-800 text-slate-100'}`}
            placeholder="Descreva o valor esperado..."
          />
        </div>
        <div className="space-y-4">
          <div>
            <label className="text-[9px] font-black text-slate-500 uppercase tracking-[0.2em]">Stakeholders (separar por virgula)</label>
            <input 
              value={valorStakeholders} 
              onChange={(e) => setValorStakeholders(e.target.value)}
              className={`w-full border rounded-2xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition-colors ${theme === 'light' ? 'bg-white border-slate-200 text-slate-900' : 'bg-slate-900 border-slate-800 text-slate-100'}`}
              placeholder="PM, Cliente, Suporte"
            />
          </div>
          <div>
            <label className="text-[9px] font-black text-slate-500 uppercase tracking-[0.2em]">Metricas (separar por virgula)</label>
            <input 
              value={valorMetricas} 
              onChange={(e) => setValorMetricas(e.target.value)}
              className={`w-full border rounded-2xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition-colors ${theme === 'light' ? 'bg-white border-slate-200 text-slate-900' : 'bg-slate-900 border-slate-800 text-slate-100'}`}
              placeholder="NPS, CSAT, Adocao"
            />
          </div>
          <div>
            <label className="text-[9px] font-black text-slate-500 uppercase tracking-[0.2em]">Prazo</label>
            <input 
              value={valorPrazo} 
              onChange={(e) => setValorPrazo(e.target.value)}
              className={`w-full border rounded-2xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition-colors ${theme === 'light' ? 'bg-white border-slate-200 text-slate-900' : 'bg-slate-900 border-slate-800 text-slate-100'}`}
              placeholder="90 dias"
            />
          </div>
        </div>
      </div>
      <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">
        <span>Atualizado em {new Date(projectContext.atualizadoEm).toLocaleString()}</span>
        <button
          onClick={() => {
            const sanitizeList = (raw: string) => raw.split(',').map((item) => item.trim()).filter(Boolean);
            const updated = updateContext(
              {
                valor: {
                  descricao: valorDescricao,
                  stakeholders: sanitizeList(valorStakeholders),
                  metricas: sanitizeList(valorMetricas),
                  prazo: valorPrazo,
                }
              },
              id
            );
            setProjectContext(updated);
          }}
          className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white transition-all shadow-md shadow-emerald-500/20"
        >
          Salvar Valor
        </button>
      </div>
    </div>
  );

  const renderDocumentationPanel = () => {
    const hasDoc = Boolean(lastAssistantDoc);
    return (
      <div className={`border rounded-[32px] p-6 shadow-xl h-full flex flex-col gap-4 ${
        theme === 'light' ? 'bg-white border-slate-200 shadow-slate-200/50' : 'bg-slate-900 border-slate-800'
      }`}>
        <div className="flex items-center justify-between gap-3 border-b pb-3">
          <div>
            <p className="text-[9px] font-black uppercase tracking-widest text-emerald-500">Sincronizado</p>
            <h4 className={`text-lg font-black uppercase tracking-tight ${theme === 'light' ? 'text-slate-900' : 'text-slate-100'}`}>
              {docPanelTitle}
            </h4>
          </div>
          <div className="flex gap-2">
            <div className="px-3 py-1 rounded-xl text-[10px] font-black uppercase tracking-widest bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">
              Live Engine Active
            </div>
            <button
              disabled={!hasDoc}
              onClick={() => {
                if (!lastAssistantDoc) return;
                const blob = new Blob([lastAssistantDoc.content], { type: artifactInfo.mime });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = artifactInfo.filename;
                a.click();
                URL.revokeObjectURL(url);
              }}
              className={`flex items-center gap-2 px-3 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-colors ${
                hasDoc 
                  ? 'bg-emerald-600 text-white hover:bg-emerald-500 shadow shadow-emerald-500/30' 
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-400 border-slate-200 dark:border-slate-700 cursor-not-allowed'
              }`}
              title="Baixar a ultima versao do artefato"
            >
              <Download size={14} /> Baixar
            </button>
          </div>
        </div>

        {lastAttachments.length > 0 && (
          <div className={`p-4 rounded-2xl border ${theme === 'light' ? 'bg-slate-50 border-slate-100' : 'bg-slate-950/40 border-slate-800'}`}>
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2">Anexos usados</p>
            <div className="flex flex-wrap gap-2">
              {lastAttachments.map((name, idx) => (
                <span key={idx} className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest border bg-blue-600/10 text-blue-700 dark:text-blue-200 border-blue-500/30">
                  <Paperclip size={12} /> {name}
                </span>
              ))}
            </div>
          </div>
        )}

        {hasDoc ? (
          <div className={`flex-1 overflow-auto rounded-2xl border p-4 markdown-content custom-scrollbar ${
            theme === 'light' ? 'bg-slate-50 border-slate-100' : 'bg-slate-950/50 border-slate-800'
          }`}>
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {lastAssistantDoc?.content || ''}
            </ReactMarkdown>
          </div>
        ) : (
          <div className={`flex-1 border rounded-2xl p-10 text-center flex flex-col items-center justify-center gap-4 ${
            theme === 'light' ? 'bg-slate-50 border-slate-200' : 'bg-slate-950/50 border-slate-800'
          }`}>
            <div className={`p-6 rounded-full border shadow-xl ${theme === 'light' ? 'bg-white border-slate-200 text-slate-400' : 'bg-slate-900 border-slate-800 text-slate-600'}`}>
              <Box size={48} />
            </div>
            <div className="space-y-2">
              <h3 className={`text-lg font-black uppercase tracking-tight ${theme === 'light' ? 'text-slate-900' : 'text-slate-100'}`}>Aguardando Documentacao</h3>
              <p className="text-sm text-slate-500 max-w-sm font-medium">
                Assim que o especialista responder, a documentacao aparece aqui e voce pode baixar o artefato.
              </p>
            </div>
          </div>
        )}
      </div>
    );
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
              <div className="hidden md:flex items-center gap-4 text-right">
                <div className="flex flex-col">
                  <span className="text-[10px] font-black text-slate-500 uppercase">Saude</span>
                  <span className={`text-[11px] font-black ${metrics?.healthColor || 'text-slate-500'}`}>{metrics?.healthStatus || '--'}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-[10px] font-black text-slate-500 uppercase">Progresso</span>
                  <span className="text-[11px] font-black text-emerald-500">{metrics?.timeProgress || 0}%</span>
                </div>
              </div>
            </div>
          </div>

          {renderValueCard()}

          <div className="h-[750px]">
            <ChatPanel 
              agentId={activeAgent.agentId} 
              projectId={id} 
              key={chatId}
            />
          </div>
        </div>

        <div className="lg:col-span-5 xl:col-span-4">
          <div className="sticky top-28 space-y-4">
            {renderDocumentationPanel()}
          </div>
        </div>
      </div>
    </div>
  );
};
