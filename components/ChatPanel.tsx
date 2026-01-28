
import React, { useState, useRef, useEffect, useMemo } from 'react';
import { Send, Trash2, Settings, AlertCircle, Loader2, Bot, User } from 'lucide-react';
import { AgentId, ChatMessage } from '../types';
import { useChatStore } from '../store/useChatStore';
import { useSettingsStore } from '../store/useSettingsStore';
import { sendMessageToAgent } from '../services/geminiService';
import { AGENTS_MAP } from '../constants';
import { Link } from 'react-router-dom';

interface ChatPanelProps {
  agentId: AgentId;
  projectId?: string;
}

// Array constante para evitar novas referências a cada render
const EMPTY_MESSAGES: ChatMessage[] = [];

export const ChatPanel: React.FC<ChatPanelProps> = ({ agentId, projectId }) => {
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  const chatId = useMemo(() => 
    projectId ? `${projectId}-${agentId}` : `standalone-${agentId}`, 
    [projectId, agentId]
  );

  // Seletor estabilizado: Retorna undefined se não existir e usamos EMPTY_MESSAGES constante
  const rawMessages = useChatStore((state) => state.chats[chatId]);
  const messages = rawMessages || EMPTY_MESSAGES;
  
  const addMessage = useChatStore((state) => state.addMessage);
  const clearChat = useChatStore((state) => state.clearChat);
  const settings = useSettingsStore((state) => state.settingsByAgent[agentId]);
  const agentDef = AGENTS_MAP[agentId];

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    if (!settings.apiKey) {
      setError("Por favor, configure a chave de API nas configurações.");
      return;
    }

    const userMessage: ChatMessage = {
      id: crypto.randomUUID(),
      role: 'user' as const,
      content: input,
      timestamp: Date.now(),
    };

    addMessage(chatId, userMessage);
    setInput('');
    setIsLoading(true);
    setError(null);

    try {
      const allMessages = [...messages, userMessage];
      const response = await sendMessageToAgent(agentId, allMessages, settings);
      addMessage(chatId, response);
    } catch (err: any) {
      setError(err.message || "Falha ao obter resposta da IA.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-slate-900 border border-slate-800 rounded-[32px] overflow-hidden shadow-2xl relative">
      {/* Header do Agente */}
      <div className="px-6 py-5 bg-slate-800/40 border-b border-slate-700/50 flex items-center justify-between backdrop-blur-md">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-emerald-500/10 rounded-2xl text-emerald-400">
            <Bot size={22} />
          </div>
          <div className="min-w-0">
            <h3 className="text-sm font-black text-slate-100 uppercase tracking-tight truncate">{agentDef.displayName}</h3>
            <p className="text-[10px] text-slate-500 uppercase tracking-widest font-black opacity-60">{agentDef.category}</p>
          </div>
        </div>
        <button 
          onClick={() => clearChat(chatId)}
          className="p-2.5 text-slate-600 hover:text-red-400 hover:bg-red-500/10 rounded-xl transition-all"
          title="Limpar histórico"
        >
          <Trash2 size={18} />
        </button>
      </div>

      {/* Área de Mensagens */}
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-hide"
      >
        {messages.length === 0 && (
          <div className="h-full flex flex-col items-center justify-center text-center px-8 opacity-40">
            <div className="w-16 h-16 bg-slate-800 rounded-3xl flex items-center justify-center mb-6 border border-slate-700">
              <Bot size={32} className="text-emerald-500" />
            </div>
            <p className="text-slate-100 font-black uppercase text-xs tracking-widest">Inicie a Sessão</p>
            <p className="text-[11px] text-slate-500 mt-2 max-w-[200px] leading-relaxed font-medium">Fale com o {agentDef.displayName} para gerar artefatos ou tirar dúvidas.</p>
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
              <div className={`p-4 rounded-3xl text-sm leading-relaxed whitespace-pre-wrap shadow-sm ${
                m.role === 'user' 
                  ? 'bg-blue-600/10 text-blue-100 border border-blue-500/20 rounded-tr-none' 
                  : 'bg-slate-800/80 text-slate-200 border border-slate-700/50 rounded-tl-none'
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
              <div className="p-4 bg-slate-800/50 rounded-3xl rounded-tl-none border border-slate-700/50 text-slate-400 text-xs font-bold uppercase tracking-widest flex items-center gap-3">
                <Loader2 size={16} className="animate-spin" />
                Processando...
              </div>
            </div>
          </div>
        )}

        {error && (
          <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-3xl flex gap-3 text-red-200 text-xs font-medium">
            <AlertCircle className="flex-shrink-0" size={18} />
            <div>
              <p className="font-black uppercase tracking-widest mb-1">Aviso do Sistema</p>
              <p>{error}</p>
              {!settings.apiKey && (
                <Link to="/settings" className="mt-3 inline-flex items-center gap-2 text-red-400 hover:text-red-300 font-black uppercase tracking-widest text-[10px] bg-red-500/10 px-3 py-1.5 rounded-lg border border-red-500/20">
                  <Settings size={14} /> Configurar API Key
                </Link>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Input de Comando */}
      <div className="p-6 bg-slate-800/40 border-t border-slate-700/50 backdrop-blur-md">
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
            className="flex-1 bg-slate-950 border border-slate-700 rounded-2xl px-5 py-3 text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 resize-none h-14 transition-all"
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || isLoading}
            className="w-14 bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-800 disabled:text-slate-600 text-white rounded-2xl transition-all flex items-center justify-center shadow-lg shadow-emerald-600/20 active:scale-95 flex-shrink-0"
          >
            <Send size={20} strokeWidth={2.5} />
          </button>
        </div>
      </div>
    </div>
  );
};
