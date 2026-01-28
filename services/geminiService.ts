
import { GoogleGenAI } from "@google/genai";
import { AgentId, ChatMessage, AgentSettings } from "../types";
import { AGENTS_MAP } from "../constants";

export async function sendMessageToAgent(
  agentId: AgentId,
  messages: ChatMessage[],
  settings: AgentSettings
): Promise<ChatMessage> {
  // Use process.env.API_KEY directly as per guidelines.
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const agentDef = AGENTS_MAP[agentId];
  
  const history = messages.slice(0, -1).map(m => ({
    role: m.role === 'user' ? 'user' : 'model',
    parts: [{ text: m.content }]
  }));

  const lastMessage = messages[messages.length - 1].content;

  try {
    const response = await ai.models.generateContent({
      // Use 'gemini-3-pro-preview' for complex reasoning tasks in project management.
      model: 'gemini-3-pro-preview',
      contents: [
        ...history,
        { role: 'user', parts: [{ text: lastMessage }] }
      ],
      config: {
        systemInstruction: agentDef.systemPrompt,
        temperature: settings.temperature ?? 0.7,
        // Removed maxOutputTokens to prevent potential blocking without thinkingBudget.
      },
    });

    // Directly access the text property as per guidelines.
    const text = response.text || "Desculpe, não consegui processar sua solicitação.";
    
    return {
      id: crypto.randomUUID(),
      role: 'assistant',
      content: text,
      timestamp: Date.now(),
    };
  } catch (error: any) {
    console.error("Gemini API Error:", error);
    throw new Error(error.message || "Failed to communicate with AI");
  }
}
