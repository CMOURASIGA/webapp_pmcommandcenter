
import React, { useState, useRef, useEffect, useMemo } from 'react';
import { Send, Trash2, AlertTriangle, Loader2, Bot, User, Settings as SettingsIcon, RefreshCw, Activity, Zap } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { AgentId, ChatMessage } from '../types';
import { useChatStore } from '../store/useChatStore';
import { useSettingsStore } from '../store/useSettingsStore';
import { useThemeStore } from '../store/useThemeStore';
import { sendMessageToAgent } from '../services/aiService';
import { AGENTS_MAP } from '../constants';
import { useNavigate } from 'react-router-dom';
import { getContext, validateContext } from '../services/contextService';

interface ChatPanelProps {
  agentId: AgentId;
  projectId?: string;
}

const EMPTY_MESSAGES: ChatMessage[] = [];

export const ChatPanel: React.FC<ChatPanelProps> = ({ agentId, projectId }) => {
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [errorType, setErrorType] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const navigate = useNavigate();
  const theme = useThemeStore((state) => state.theme);
  const context = useMemo(() => getContext(), []);
  const contextIssues = useMemo(() => validateContext(context), [context]);

  const chatId = useMemo(() => 
    projectId ? `${projectId}-${agentId}` : `standalone-${agentId}`, 
    [projectId, agentId]
  );

  const rawMessages = useChatStore((state) => state.chats[chatId]);
  const messages = rawMessages || EMPTY_MESSAGES;
  
  const addMessage = useChatStore((state) => state.addMessage);
  const clearChat = useChatStore((state) => state.clearChat);
  const settingsByAgent = useSettingsStore((state) => state.settingsByAgent);
  const settings = settingsByAgent[agentId];
  const agentDef = AGENTS_MAP[agentId];

  const contextDensity = useMemo(() => {
    const count = messages.length;
    if (count === 0) return { label: 'Vazio', color: 'text-slate-400', icon: Activity };
    if (count < 5) return { label: 'Otimizado', color: 'text-emerald-500', icon: Zap };
    if (count < 12) return { label: 'Médio', color: 'text-amber-500', icon: Activity };
    return { label: 'Pesado', color: 'text-red-500', icon: AlertTriangle };
  }, [messages]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading, errorType]);

  const handleSend = async () => {
    if (contextIssues.length > 0) {
      setErrorType(`Contexto incompleto: ${contextIssues.join(', ')}. Atualize o contexto antes de enviar.`);
      return;
    }
    if (!input.trim() || isLoading) return;

    const userMessage: ChatMessage = {
      id: crypto.randomUUID(),
      role: 'user' as const,
      content: input,
      timestamp: Date.now(),
    };

    addMessage(chatId, userMessage);
    setInput('');
    setIsLoading(true);
    setErrorType(null);

    try {
      const response = await sendMessageToAgent(agentId, [...messages, userMessage], settings, projectId);
      addMessage(chatId, response);
    } catch (err: any) {
      setErrorType(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const renderError = () => {
    if (!errorType) return null;
    return (
      <div className={`mx-6 mb-6 p-5 border rounded-[24px] shadow-2xl ${theme === 'light' ? 'bg-white border-slate-200' : 'bg-slate-950/80 border-slate-800'}`}>
        <div className="flex gap-4">
          <div className="p-3 bg-red-500/10 text-red-500 rounded-2xl h-fit">
            <AlertTriangle size={20} />
          </div>
          <div className="flex-1">
            <h4 className="text-[10px] font-black uppercase text-red-500">Erro no Processamento</h4>
            <p className="text-[11px] font-bold uppercase text-slate-400 mt-1">{errorType}</p>
            <button onClick={() => navigate('/settings')} className="mt-3 text-[10px] font-black uppercase text-blue-500 underline">Ajustar Credenciais</button>
          </div>
        </div>
      </div>
    );
  };

  const lastAssistantMessage = useMemo(
    () => [...messages].reverse().find((m) => m.role === 'assistant'),
    [messages]
  );

  const bottleneckSignals = useMemo(() => {
    const text = (lastAssistantMessage?.content || '').toLowerCase();
    if (!text) return { manual: false, retrabalho: false, complexo: false };
    const manual = /manual|humano|planilha|digitar|entrada manual/.test(text);
    const retrabalho = /retrabalho|refazer|rework|correcao|corrigir/.test(text);
    const gatewayCount = (text.match(/gateway|decisao/g) || []).length;
    const arrowCount = (text.match(/->/g) || []).length;
    const lineCount = text.split('\n').length;
    const complexo = gatewayCount >= 2 || arrowCount >= 6 || lineCount >= 30;
    return { manual, retrabalho, complexo };
  }, [lastAssistantMessage]);

  const sendQuickAction = async (targetAgent: AgentId, instruction: string) => {
    const targetSettings = settingsByAgent[targetAgent];
    if (!targetSettings) return;
    if (contextIssues.length > 0) {
      setErrorType(`Contexto incompleto: ${contextIssues.join(', ')}. Atualize o contexto antes de enviar.`);
      return;
    }
    const actionChatId = projectId ? `${projectId}-${targetAgent}` : `standalone-${targetAgent}`;

    const userMessage: ChatMessage = {
      id: crypto.randomUUID(),
      role: 'user',
      content: `${instruction}\n\nResumo anterior:\n${lastAssistantMessage?.content || 'Sem resposta anterior.'}`,
      timestamp: Date.now(),
    };

    addMessage(actionChatId, userMessage);
    setIsLoading(true);
    setErrorType(null);
    try {
      const response = await sendMessageToAgent(targetAgent, [userMessage], targetSettings, projectId);
      addMessage(actionChatId, response);
      // feedback visual: opcional, não limpa input principal
    } catch (err: any) {
      setErrorType(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const renderActions = () => {
    if (!lastAssistantMessage) return null;
    if (agentId === 'pmAiPartner') {
      return (
        <div className="flex flex-wrap gap-2 mb-3">
          <button
            onClick={() => sendQuickAction('bpmnMasterArchitect', 'Gerar modelo BPMN com base na analise do PM. AS IS vs TO BE, Humano/Sistema e gargalos.')}
            className="px-3 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border bg-blue-600/10 text-blue-600 border-blue-500/30 hover:bg-blue-600/20 transition-all"
          >
            Gerar BPMN
          </button>
          <button
            onClick={() => sendQuickAction('pmAiPartner', 'A partir do contexto e do resumo, gere backlog INVEST detalhado.')}
            className="px-3 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border bg-emerald-600/10 text-emerald-600 border-emerald-500/30 hover:bg-emerald-600/20 transition-all"
          >
            Gerar backlog
          </button>
          <button
            onClick={() => sendQuickAction('riskDecisionAnalyst', 'Analise de riscos com base no resumo anterior e contexto.')}
            className="px-3 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border bg-amber-500/10 text-amber-600 border-amber-500/30 hover:bg-amber-500/20 transition-all"
          >
            Analisar risco
          </button>
        </div>
      );
    }

    if (agentId === 'bpmnMasterArchitect') {
      return (
        <div className="flex flex-wrap gap-2 mb-3">
          <button
            onClick={() => sendQuickAction('pmAiPartner', 'Com base no modelo BPMN, sugira melhorias de backlog e entregaveis.')}
            className="px-3 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border bg-emerald-600/10 text-emerald-600 border-emerald-500/30 hover:bg-emerald-600/20 transition-all"
          >
            Enviar melhorias PM
          </button>
        </div>
      );
    }
    return null;
  };

  const renderSmartSuggestions = () => {
    const { manual, retrabalho, complexo } = bottleneckSignals;
    const hasSignals = manual || retrabalho || complexo;
    if (!hasSignals) return null;

    return (
      <div className={`mb-3 p-4 rounded-2xl border text-[10px] font-black uppercase tracking-widest ${theme === 'light' ? 'bg-blue-50 border-blue-200 text-blue-700' : 'bg-blue-900/20 border-blue-800 text-blue-200'}`}>
        <div className="flex items-center justify-between mb-2">
          <span>Sinais de gargalo detectados:</span>
          <div className="flex gap-2 text-[9px]">
            {manual && <span className="px-2 py-1 rounded bg-emerald-600/10 text-emerald-600 border border-emerald-500/30">Manual</span>}
            {retrabalho && <span className="px-2 py-1 rounded bg-amber-500/10 text-amber-600 border border-amber-500/30">Retrabalho</span>}
            {complexo && <span className="px-2 py-1 rounded bg-red-500/10 text-red-600 border border-red-500/30">Fluxo complexo</span>}
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => sendQuickAction('bpmnMasterArchitect', 'Modelar BPMN para automatizar gargalos e reduzir manual/retrabalho.')}
            className="px-3 py-2 rounded-xl border bg-blue-600/10 text-blue-700 border-blue-500/30 hover:bg-blue-600/20 transition-all"
          >
            Sugerir BPMN
          </button>
          <button
            onClick={() => sendQuickAction('pmAiPartner', 'Avaliar automacao e simplificacao de fluxo; priorizar user stories de automacao.')}
            className="px-3 py-2 rounded-xl border bg-emerald-600/10 text-emerald-700 border-emerald-500/30 hover:bg-emerald-600/20 transition-all"
          >
            Sugerir automacao
          </button>
        </div>
      </div>
    );
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploading(true);
    setErrorType(null);
    try {
      const text = await file.text();
      const userMessage: ChatMessage = {
        id: crypto.randomUUID(),
        role: 'user',
        content: `Conteudo do anexo (${file.name}):\n\n${text}`,
        timestamp: Date.now(),
      };
      addMessage(chatId, userMessage);
      setIsLoading(true);
      const response = await sendMessageToAgent(agentId, [...messages, userMessage], settings, projectId);
      addMessage(chatId, response);
    } catch (err: any) {
      setErrorType(err.message || 'Erro ao ler anexo.');
    } finally {
      setIsUploading(false);
      setIsLoading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  return (
    <div className={`flex flex-col h-full border rounded-[32px] overflow-hidden shadow-2xl relative ${
      theme === 'light' ? 'bg-white border-slate-200' : 'bg-slate-900 border-slate-800'
    }`}>
      <div className={`px-6 py-4 border-b flex items-center justify-between ${
        theme === 'light' ? 'bg-slate-50/80 border-slate-200' : 'bg-slate-800/40 border-slate-700/50'
      }`}>
        <div className="flex items-center gap-4">
          <div className="p-2.5 bg-emerald-500/10 rounded-2xl text-emerald-500">
            <Bot size={20} />
          </div>
          <div>
            <h3 className="text-[11px] font-black uppercase tracking-tight truncate">{agentDef.displayName}</h3>
            <div className="flex items-center gap-2 mt-0.5">
              <contextDensity.icon size={10} className={contextDensity.color} />
              <span className={`text-[8px] font-black uppercase ${contextDensity.color}`}>Contexto: {contextDensity.label}</span>
            </div>
          </div>
        </div>
        <button onClick={() => clearChat(chatId)} className="p-2 hover:bg-red-500/10 text-slate-500 hover:text-red-500 rounded-lg transition-colors">
          <Trash2 size={16} />
        </button>
      </div>

      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-6 custom-scrollbar">
        {messages.map((m) => (
          <div key={m.id} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-bottom-2 duration-300`}>
            <div className={`flex gap-3 w-full ${m.role === 'user' ? 'flex-row-reverse max-w-[85%]' : 'max-w-full'}`}>
              <div className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 mt-1 shadow-lg ${m.role === 'user' ? 'bg-blue-600' : 'bg-emerald-600'}`}>
                {m.role === 'user' ? <User size={16} className="text-white" /> : <Bot size={16} className="text-white" />}
              </div>
              <div className={`p-5 rounded-3xl border shadow-sm markdown-content w-full ${
                m.role === 'user' 
                  ? 'bg-blue-600/10 text-blue-100 border-blue-500/20' 
                  : (theme === 'light' ? 'bg-slate-50 text-slate-800 border-slate-200' : 'bg-slate-900/60 text-slate-200 border-slate-700/50')
              }`}>
                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                  {m.content}
                </ReactMarkdown>
              </div>
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex items-center gap-3 animate-pulse p-4">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/20 flex items-center justify-center">
              <RefreshCw size={14} className="text-emerald-500 animate-spin" />
            </div>
            <span className="text-[10px] font-black uppercase text-emerald-500 tracking-widest">Processando Inteligência...</span>
          </div>
        )}
        {renderError()}
      </div>

      <div className={`p-6 border-t ${theme === 'light' ? 'bg-slate-50 border-slate-200' : 'bg-slate-800/40 border-slate-700/50'}`}>
        {contextIssues.length > 0 && (
          <div className={`mb-3 p-4 rounded-2xl text-[10px] font-black uppercase tracking-widest border ${theme === 'light' ? 'bg-amber-50 border-amber-200 text-amber-700' : 'bg-amber-900/20 border-amber-800 text-amber-200'}`}>
            <div className="flex items-center justify-between">
              <span>Contexto incompleto: {contextIssues.join(', ')}</span>
              <button onClick={() => navigate('/projects')} className="underline text-[10px]">Ajustar</button>
            </div>
          </div>
        )}
        {renderSmartSuggestions()}
        {renderActions()}
        <div className="flex gap-3">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), handleSend())}
            placeholder={`Envie ordens para ${agentDef.displayName}...`}
            className={`flex-1 border rounded-2xl px-5 py-4 text-sm focus:outline-none resize-none h-16 shadow-inner transition-all focus:ring-2 focus:ring-emerald-500/20 ${
              theme === 'light' ? 'bg-white border-slate-300 text-slate-900 placeholder-slate-400' : 'bg-slate-950 border-slate-700 text-white placeholder-slate-600'
            }`}
          />
          <div className="flex flex-col gap-2">
            <input
              type="file"
              ref={fileInputRef}
              className="hidden"
              accept=".txt,.md,.csv,.json,.log"
              onChange={handleFileSelect}
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading || isLoading}
              className="px-4 py-2 rounded-xl border text-[10px] font-black uppercase tracking-widest transition-all bg-slate-100 dark:bg-slate-800 border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:border-emerald-400 hover:text-emerald-500 disabled:opacity-50"
            >
              {isUploading ? 'Lendo...' : 'Anexar'}
            </button>
            <button 
              onClick={handleSend} 
              disabled={!input.trim() || isLoading} 
              className="w-16 bg-emerald-600 hover:bg-emerald-500 text-white rounded-2xl flex items-center justify-center shadow-xl shadow-emerald-600/20 transition-all active:scale-95 disabled:opacity-50 disabled:grayscale"
            >
              <Send size={20} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
