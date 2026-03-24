export type AgentId =
  | 'pmAiPartner'
  | 'bpmnMasterArchitect'
  | 'uiScreensDesigner'
  | 'riskDecisionAnalyst'
  | 'stakeholderCommsWriter'
  | 'metricsReportingArchitect'
  | 'meetingDocsCopilot'
  | 'techArchitect';

export type OrchestrationSuggestion = {
  nextAgent: 'BPMN' | 'RISK' | 'UI' | 'COMMS' | 'DELIVERY' | 'TECH';
  reason: string;
  confidence: 'baixa' | 'media' | 'alta';
};

export type ProjectStatus = 'Ativo' | 'Suspenso' | 'Concluido' | 'Em Risco';
export type Methodology = 'Agile' | 'Waterfall' | 'Hybrid';
export type MaturityLevel = 'exploratorio' | 'estruturado' | 'execucao' | 'otimizacao';

export interface Project {
  id: string;
  name: string;
  objective: string;
  methodology: Methodology;
  status: ProjectStatus;
  startDate: string;
  endDate?: string;
  budget?: string;
}

export interface Risk {
  id: string;
  projectId: string;
  description: string;
  impact: 1 | 2 | 3 | 4 | 5;
  probability: 1 | 2 | 3 | 4 | 5;
  exposure: number;
  mitigation: string;
  owner: string;
  reviewDate?: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
}

export interface AgentSettings {
  provider:
    | 'google-ai-studio'
    | 'openai'
    | 'anthropic'
    | 'xai'
    | 'perplexity'
    | 'groq'
    | 'deepseek'
    | 'custom-api';
  model: string;
  temperature?: number;
  apiKey?: string;
}

export interface AgentDefinition {
  id: AgentId;
  displayName: string;
  shortDescription: string;
  category:
    | 'Planejamento & Execucao'
    | 'Processos & BPMN'
    | 'Design & UX'
    | 'Riscos & Decisoes'
    | 'Comunicacao'
    | 'Metricas & Relatorios'
    | 'Reunioes & Documentos';
  usageTips: string[];
  systemPrompt: string;
  icon: string;
}

export interface UserStory {
  id: string;
  epico: string;
  historia: string;
  criteriosAceite: string;
  valor?: string;
  prioridade?: string;
}

export interface ContextRisk {
  id: string;
  risco: string;
  probabilidade: number;
  impacto: number;
  score: number;
  mitigacao: string;
  responsavel?: string;
}

export interface ProcessEntry {
  id: string;
  passo: string;
  ator: string;
  tipo: 'Humano' | 'Sistema';
  entrada: string;
  saida: string;
  regra?: string;
  visao?: 'AS_IS' | 'TO_BE';
}

export interface DecisionEntry {
  id: string;
  decisao: string;
  responsavel?: string;
  prazo?: string;
  status?: string;
}

export type ProjectContext = {
  id: string;
  nome: string;
  objetivo: string;
  valor: {
    descricao: string;
    stakeholders: string[];
    metricas: string[];
    prazo: string;
  };
  escopo: string;
  stakeholders: string[];
  userStories: UserStory[];
  risks: ContextRisk[];
  processes: ProcessEntry[];
  decisions: DecisionEntry[];
  maturidade: MaturityLevel;
  metricas: any[];
  atualizadoEm: string;
};

export type Interaction = {
  id: string;
  input: string;
  agente: string;
  output: string;
  data: string;
  etapa?: string;
};

export type ProjectProfile = {
  id: string;
  nome: string;
  contexto: {
    objetivo: string;
    escopo: string;
    stakeholders: string[];
  };
  historico: Interaction[];
  etapa?: string;
  ultimaAcao?: string;
  execucoes?: Execution[];
};

export type Execution = {
  tipo: 'TECH';
  resumo: string;
  data: string;
};

export type AgentType =
  | 'PM_AI'
  | 'BPMN'
  | 'RISK'
  | 'UI'
  | 'COMMS'
  | 'DELIVERY'
  | 'TECH';
