
import { GoogleGenAI } from "@google/genai";
import { AgentId, ChatMessage, AgentSettings } from "../types";
import { AGENTS_MAP } from "../constants";
import { useSettingsStore } from "../store/useSettingsStore";

export async function sendMessageToAgent(
  agentId: AgentId,
  messages: ChatMessage[],
  settings: AgentSettings
): Promise<ChatMessage> {
  // Obtém a chave manual do store se ela existir
  const customKey = useSettingsStore.getState().customApiKey;
  const apiKey = customKey || process.env.API_KEY;

  if (!apiKey) {
    throw new Error("API Key não configurada. Por favor, insira sua chave na tela de Configurações.");
  }

  const ai = new GoogleGenAI({ apiKey });
  const agentDef = AGENTS_MAP[agentId];
  
  const history = messages.slice(0, -1).map(m => ({
    role: m.role === 'user' ? 'user' : 'model',
    parts: [{ text: m.content }]
  }));

  const lastMessage = messages[messages.length - 1].content;

  try {
    const response = await ai.models.generateContent({
      model: settings.model || 'gemini-3-pro-preview',
      contents: [
        ...history,
        { role: 'user', parts: [{ text: lastMessage }] }
      ],
      config: {
        systemInstruction: agentDef.systemPrompt,
        temperature: settings.temperature ?? 0.7,
      },
    });

    const text = response.text || "Desculpe, não consegui processar sua solicitação.";
    
    return {
      id: crypto.randomUUID(),
      role: 'assistant',
      content: text,
      timestamp: Date.now(),
    };
  } catch (error: any) {
    console.error("Gemini API Error:", error);
    if (error.message?.includes("API key not valid")) {
       throw new Error("A chave de API inserida é inválida. Verifique em Configurações.");
    }
    throw new Error(error.message || "Falha na comunicação com a IA.");
  }
}
