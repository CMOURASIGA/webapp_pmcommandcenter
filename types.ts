
export type AgentId =
  | 'pmAiPartner'
  | 'bpmnMasterArchitect'
  | 'uiScreensDesigner'
  | 'riskDecisionAnalyst'
  | 'stakeholderCommsWriter'
  | 'metricsReportingArchitect'
  | 'meetingDocsCopilot';

export type ProjectStatus = 'Ativo' | 'Suspenso' | 'Concluído' | 'Em Risco';
export type Methodology = 'Agile' | 'Waterfall' | 'Hybrid';

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
  provider: string;
  apiBaseUrl?: string;
  apiKey?: string;
  model: string;
  temperature?: number;
  maxTokens?: number;
}

export interface AgentDefinition {
  id: AgentId;
  displayName: string;
  shortDescription: string;
  category:
    | 'Planejamento & Execução'
    | 'Processos & BPMN'
    | 'Design & UX'
    | 'Riscos & Decisões'
    | 'Comunicação'
    | 'Métricas & Relatórios'
    | 'Reuniões & Documentos';
  usageTips: string[];
  systemPrompt: string;
  icon: string;
}
