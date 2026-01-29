
import React, { useState, useRef, useEffect, useMemo } from 'react';
import { Send, Trash2, AlertTriangle, Loader2, Bot, User, Settings as SettingsIcon, RefreshCw, Sparkles, Activity, Zap } from 'lucide-react';
import { AgentId, ChatMessage } from '../types';
import { useChatStore } from '../store/useChatStore';
import { useSettingsStore } from '../store/useSettingsStore';
import { useThemeStore } from '../store/useThemeStore';
import { sendMessageToAgent } from '../services/geminiService';
import { AGENTS_MAP } from '../constants';
import { useNavigate } from 'react-router-dom';

interface ChatPanelProps {
  agentId: AgentId;
  projectId?: string;
}

const EMPTY_MESSAGES: ChatMessage[] = [];

export const ChatPanel: React.FC<ChatPanelProps> = ({ agentId, projectId }) => {
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorType, setErrorType] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const theme = useThemeStore((state) => state.theme);

  const chatId = useMemo(() => 
    projectId ? `${projectId}-${agentId}` : `standalone-${agentId}`, 
    [projectId, agentId]
  );

  const rawMessages = useChatStore((state) => state.chats[chatId]);
  const messages = rawMessages || EMPTY_MESSAGES;
  
  const addMessage = useChatStore((state) => state.addMessage);
  const clearChat = useChatStore((state) => state.clearChat);
  const settings = useSettingsStore((state) => state.settingsByAgent[agentId]);
  const agentDef = AGENTS_MAP[agentId];

  // Simulador de densidade de contexto para educar o usuário sobre o uso de tokens
  const contextDensity = useMemo(() => {
    const count = messages.length;
    if (count === 0) return { label: 'Vazio', color: 'text-slate-400', icon: Activity, description: 'Sem histórico. Performance máxima.' };
    if (count < 5) return { label: 'Otimizado', color: 'text-emerald-500', icon: Zap, description: 'Contexto ideal para respostas precisas.' };
    if (count < 12) return { label: 'Médio', color: 'text-amber-500', icon: Activity, description: 'Volume moderado de histórico.' };
    return { label: 'Pesado', color: 'text-red-500', icon: AlertTriangle, description: 'Contexto longo. Considere resetar para economizar tokens.' };
  }, [messages]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading, errorType]);

  const handleSend = async () => {
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
      const allMessages = [...messages, userMessage];
      const response = await sendMessageToAgent(agentId, allMessages, settings);
      addMessage(chatId, response);
    } catch (err: any) {
      setErrorType(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const renderError = () => {
    if (!errorType) return null;

    let title = "Notificação do Sistema";
    let message = "Ocorreu um erro inesperado no processamento.";
    let icon = <AlertTriangle className="text-red-400" size={20} />;
    let action = null;

    if (errorType === "QUOTA_EXCEEDED") {
      title = "Capacidade Temporária Atingida";
      message = "Sua cota de uso do Gemini foi atingida. Limpar o chat pode ajudar a reduzir o tamanho das próximas requisições.";
      icon = <RefreshCw className="text-amber-500 animate-spin-slow" size={20} />;
      action = (
        <button 
          onClick={() => clearChat(chatId)}
          className="mt-3 flex items-center gap-2 text-[10px] font-black uppercase text-amber-500 hover:text-amber-600 transition-colors"
        >
          Limpar Contexto Atual <Trash2 size={12} />
        </button>
      );
    } else if (errorType === "INVALID_KEY") {
      title = "Falha de Autenticação";
      message = "Sua Chave de API parece estar incorreta. Verifique as credenciais nas configurações.";
      icon = <SettingsIcon className="text-blue-500" size={20} />;
      action = (
        <button 
          onClick={() => navigate('/settings')}
          className="mt-3 flex items-center gap-2 text-[10px] font-black uppercase text-blue-500 hover:text-blue-600 transition-colors"
        >
          Ir para Configurações <SettingsIcon size={12} />
        </button>
      );
    }

    return (
      <div className={`mx-6 mb-6 p-5 border rounded-[24px] shadow-2xl animate-in fade-in zoom-in-95 duration-300 relative overflow-hidden group ${
        theme === 'light' ? 'bg-white border-slate-200 shadow-slate-200/50' : 'bg-slate-950/80 border-slate-800 shadow-black/40'
      }`}>
        <div className="flex gap-4 relative z-10">
          <div className={`p-3 rounded-2xl border h-fit ${theme === 'light' ? 'bg-slate-50 border-slate-100' : 'bg-slate-900 border-slate-800'}`}>
            {icon}
          </div>
          <div className="flex-1">
            <h4 className={`text-[10px] font-black uppercase tracking-[0.2em] mb-1 ${theme === 'light' ? 'text-slate-900' : 'text-slate-100'}`}>{title}</h4>
            <p className={`text-[11px] font-bold uppercase leading-relaxed tracking-tight ${theme === 'light' ? 'text-slate-500' : 'text-slate-400'}`}>
              {message}
            </p>
            {action}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className={`flex flex-col h-full border rounded-[32px] overflow-hidden shadow-2xl relative ${
      theme === 'light' ? 'bg-white border-slate-200' : 'bg-slate-900 border-slate-800'
    }`}>
      {/* Header do Agente */}
      <div className={`px-6 py-4 border-b flex items-center justify-between backdrop-blur-md ${
        theme === 'light' ? 'bg-slate-50/80 border-slate-200' : 'bg-slate-800/40 border-slate-700/50'
      }`}>
        <div className="flex items-center gap-4">
          <div className="p-2.5 bg-emerald-500/10 rounded-2xl text-emerald-500">
            <Bot size={20} />
          </div>
          <div className="min-w-0">
            <h3 className={`text-[11px] font-black uppercase tracking-tight truncate ${theme === 'light' ? 'text-slate-900' : 'text-slate-100'}`}>{agentDef.displayName}</h3>
            
            {/* Monitor de Contexto */}
            <div className="flex items-center gap-2 mt-0.5" title={contextDensity.description}>
              <contextDensity.icon size={10} className={contextDensity.color} />
              <span className={`text-[8px] font-black uppercase tracking-widest ${contextDensity.color}`}>
                Contexto: {contextDensity.label}
              </span>
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <button 
            onClick={() => {
              if (messages.length > 0) {
                clearChat(chatId);
              }
            }}
            className={`flex items-center gap-2 px-3 py-2 rounded-xl border text-[9px] font-black uppercase tracking-widest transition-all ${
              theme === 'light' 
                ? 'text-slate-400 border-slate-200 hover:text-red-500 hover:border-red-200 hover:bg-red-50' 
                : 'text-slate-500 border-slate-700 hover:text-red-400 hover:border-red-900/50 hover:bg-red-500/10'
            }`}
            title="Reiniciar contexto para economizar tokens"
          >
            <Trash2 size={14} />
            <span className="hidden sm:inline">Reset Context</span>
          </button>
        </div>
      </div>

      {/* Área de Mensagens */}
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-hide"
      >
        {messages.length === 0 && (
          <div className="h-full flex flex-col items-center justify-center text-center px-8 opacity-40">
            <div className={`w-16 h-16 rounded-3xl flex items-center justify-center mb-6 border ${
              theme === 'light' ? 'bg-slate-50 border-slate-200' : 'bg-slate-800 border-slate-700'
            }`}>
              <Bot size={32} className="text-emerald-500" />
            </div>
            <p className={`font-black uppercase text-xs tracking-widest ${theme === 'light' ? 'text-slate-900' : 'text-slate-100'}`}>Sessão Limpa</p>
            <p className="text-[11px] text-slate-500 mt-2 max-w-[200px] leading-relaxed font-medium">Histórico vazio. Otimização máxima de performance e custos ativa.</p>
          </div>
        )}

        {messages.map((m) => (
          <div 
            key={m.id} 
            className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'} animate-in slide-in-from-bottom-2 duration-300`}
          >
            <div className={`flex gap-3 max-w-[90%] ${m.role === 'user' ? 'flex-row-reverse' : ''}`}>
              <div className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 mt-1 shadow-lg ${
                m.role === 'user' ? 'bg-blue-600' : 'bg-emerald-600'
              }`}>
                {m.role === 'user' ? <User size={16} className="text-white" /> : <Bot size={16} className="text-white" />}
              </div>
              <div className={`p-4 rounded-3xl text-sm leading-relaxed whitespace-pre-wrap shadow-sm border ${
                m.role === 'user' 
                  ? 'bg-blue-600/10 text-blue-900 dark:text-blue-100 border-blue-500/20 rounded-tr-none' 
                  : (theme === 'light' ? 'bg-slate-100 text-slate-800 border-slate-200' : 'bg-slate-800/80 text-slate-200 border-slate-700/50') + ' rounded-tl-none'
              }`}>
                {m.content}
              </div>
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex justify-start animate-pulse">
            <div className="flex gap-3">
              <div className="w-8 h-8 rounded-xl bg-emerald-600/50 flex items-center justify-center">
                <Bot size={16} className="text-white" />
              </div>
              <div className={`p-4 rounded-3xl rounded-tl-none border text-xs font-bold uppercase tracking-widest flex items-center gap-3 ${
                theme === 'light' ? 'bg-slate-100 border-slate-200 text-slate-500' : 'bg-slate-800/50 border-slate-700/50 text-slate-400'
              }`}>
                <Loader2 size={16} className="animate-spin" />
                Processando...
              </div>
            </div>
          </div>
        )}

        {renderError()}
      </div>

      {/* Input de Comando */}
      <div className={`p-6 border-t backdrop-blur-md ${
        theme === 'light' ? 'bg-slate-50 border-slate-200' : 'bg-slate-800/40 border-slate-700/50'
      }`}>
        <div className="flex gap-3">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
            placeholder={`Comando para ${agentDef.displayName}...`}
            className={`flex-1 border rounded-2xl px-5 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/30 resize-none h-14 transition-all ${
              theme === 'light' 
                ? 'bg-white border-slate-300 text-slate-900 placeholder-slate-400' 
                : 'bg-slate-950 border-slate-700 text-slate-200 placeholder-slate-600'
            }`}
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || isLoading}
            className="w-14 bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-300 dark:disabled:bg-slate-800 disabled:text-slate-500 text-white rounded-2xl transition-all flex items-center justify-center shadow-lg shadow-emerald-600/20 active:scale-95 flex-shrink-0"
          >
            <Send size={20} strokeWidth={2.5} />
          </button>
        </div>
      </div>
    </div>
  );
};
