
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { AgentId, AgentSettings } from '../types';

interface SettingsState {
  settingsByAgent: Record<AgentId, AgentSettings>;
  updateAgentSettings: (agentId: AgentId, partial: Partial<AgentSettings>) => void;
  clearAllKeys: () => void;
}

const defaultSettings: AgentSettings = {
  provider: 'Google Gemini',
  model: 'gemini-3-flash-preview',
  temperature: 0.7,
  maxTokens: 2048,
};

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      settingsByAgent: {
        pmAiPartner: { ...defaultSettings },
        bpmnMasterArchitect: { ...defaultSettings },
        uiScreensDesigner: { ...defaultSettings },
        riskDecisionAnalyst: { ...defaultSettings },
        stakeholderCommsWriter: { ...defaultSettings },
        metricsReportingArchitect: { ...defaultSettings },
        meetingDocsCopilot: { ...defaultSettings },
      },
      updateAgentSettings: (agentId, partial) =>
        set((state) => ({
          settingsByAgent: {
            ...state.settingsByAgent,
            [agentId]: { ...state.settingsByAgent[agentId], ...partial },
          },
        })),
      clearAllKeys: () =>
        set((state) => {
          const newSettings = { ...state.settingsByAgent };
          // FIX: Criar novas referências de objeto para cada agente para evitar mutação direta
          Object.keys(newSettings).forEach((key) => {
            const k = key as AgentId;
            newSettings[k] = { ...newSettings[k], apiKey: '' };
          });
          return { settingsByAgent: newSettings };
        }),
    }),
    { name: 'pm-command-center-settings' }
  )
);
