
import { GoogleGenAI } from "@google/genai";
import { AgentId, ChatMessage, AgentSettings } from "../types";
import { AGENTS_MAP } from "../constants";

export async function sendMessageToAgent(
  agentId: AgentId,
  messages: ChatMessage[],
  settings: AgentSettings
): Promise<ChatMessage> {
  const apiKey = settings.apiKey || process.env.API_KEY;

  if (!apiKey) {
    throw new Error("API_KEY_MISSING");
  }

  const agentDef = AGENTS_MAP[agentId];
  const modelToUse = settings.model;

  // 1. GOOGLE AI STUDIO (GEMINI)
  if (settings.provider === 'google-ai-studio') {
    const ai = new GoogleGenAI({ apiKey });
    const history = messages.slice(0, -1).map(m => ({
      role: m.role === 'user' ? 'user' : 'model',
      parts: [{ text: m.content }]
    }));
    const lastMessage = messages[messages.length - 1].content;

    try {
      const response = await ai.models.generateContent({
        model: modelToUse,
        contents: [...history, { role: 'user', parts: [{ text: lastMessage }] }],
        config: {
          systemInstruction: agentDef.systemPrompt,
          temperature: settings.temperature ?? 0.7,
        },
      });
      return {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: response.text || "Sem resposta do Gemini.",
        timestamp: Date.now(),
      };
    } catch (error: any) {
      handleApiErrors(error);
    }
  }

  // 2. ANTHROPIC (CLAUDE) - Formato de mensagens específico
  if (settings.provider === 'anthropic') {
    try {
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': apiKey,
          'anthropic-version': '2023-06-01',
          'dangerously-allow-browser': 'true' // Em ambiente real isso deve ser via proxy
        },
        body: JSON.stringify({
          model: modelToUse,
          system: agentDef.systemPrompt,
          messages: messages.map(m => ({ role: m.role, content: m.content })),
          max_tokens: 4096,
          temperature: settings.temperature ?? 0.7
        })
      });

      const data = await response.json();
      if (data.error) throw new Error(data.error.message);

      return {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: data.content[0].text,
        timestamp: Date.now(),
      };
    } catch (error: any) {
      handleApiErrors(error);
    }
  }

  // 3. PROVEDORES COMPATÍVEIS COM OPENAI (OpenAI, Grok, Perplexity, DeepSeek, Groq)
  const OPENAI_COMPATIBLE_ENDPOINTS: Record<string, string> = {
    'openai': 'https://api.openai.com/v1/chat/completions',
    'xai': 'https://api.x.ai/v1/chat/completions',
    'perplexity': 'https://api.perplexity.ai/chat/completions',
    'groq': 'https://api.groq.com/openai/v1/chat/completions',
    'deepseek': 'https://api.deepseek.com/chat/completions',
  };

  const endpoint = OPENAI_COMPATIBLE_ENDPOINTS[settings.provider];

  if (endpoint) {
    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model: modelToUse,
          messages: [
            { role: 'system', content: agentDef.systemPrompt },
            ...messages.map(m => ({ role: m.role, content: m.content }))
          ],
          temperature: settings.temperature ?? 0.7
        })
      });

      const data = await response.json();
      if (data.error) throw new Error(data.error.message);

      return {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: data.choices[0].message.content,
        timestamp: Date.now(),
      };
    } catch (error: any) {
      handleApiErrors(error);
    }
  }

  throw new Error("PROVIDER_NOT_SUPPORTED");
}

function handleApiErrors(error: any) {
  console.error("AI Service Error:", error);
  const msg = error.message || "";
  if (msg.includes("429") || msg.includes("quota") || msg.includes("rate limit")) throw new Error("QUOTA_EXCEEDED");
  if (msg.includes("key") || msg.includes("invalid") || msg.includes("unauthorized")) throw new Error("INVALID_KEY");
  throw new Error(msg || "Erro na comunicação com a IA.");
}
