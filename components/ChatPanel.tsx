
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
      const response = await sendMessageToAgent(agentId, [...messages, userMessage], settings);
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
  );
};
