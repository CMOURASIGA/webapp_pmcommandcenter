
import { GoogleGenAI } from "@google/genai";
import { AgentId, ChatMessage, AgentSettings } from "../types";
import { AGENTS_MAP } from "../constants";
import { useSettingsStore } from "../store/useSettingsStore";

export async function sendMessageToAgent(
  agentId: AgentId,
  messages: ChatMessage[],
  settings: AgentSettings
): Promise<ChatMessage> {
  const customKey = useSettingsStore.getState().customApiKey;
  const apiKey = customKey || process.env.API_KEY;

  if (!apiKey) {
    throw new Error("API_KEY_MISSING");
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

    const text = response.text || "O sistema não retornou uma resposta válida.";
    
    return {
      id: crypto.randomUUID(),
      role: 'assistant',
      content: text,
      timestamp: Date.now(),
    };
  } catch (error: any) {
    console.error("Gemini API Error Context:", error);
    
    const errorMessage = error.message || "";

    // Tratamento de Cota Excedida (429)
    if (errorMessage.includes("429") || errorMessage.includes("RESOURCE_EXHAUSTED") || errorMessage.includes("quota")) {
      throw new Error("QUOTA_EXCEEDED");
    }

    // Tratamento de Chave Inválida (401/403)
    if (errorMessage.includes("API key not valid") || errorMessage.includes("INVALID_ARGUMENT")) {
      throw new Error("INVALID_KEY");
    }

    // Tratamento de Modelo Ocupado (503/504)
    if (errorMessage.includes("503") || errorMessage.includes("overloaded")) {
      throw new Error("MODEL_BUSY");
    }

    throw new Error(errorMessage || "Erro desconhecido na rede neural.");
  }
}
