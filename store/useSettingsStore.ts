
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { AgentId, AgentSettings } from '../types';

interface SettingsState {
  settingsByAgent: Record<AgentId, AgentSettings>;
  updateAgentSettings: (agentId: AgentId, partial: Partial<AgentSettings>) => void;
}

const defaultSettings: AgentSettings = {
  provider: 'Google Gemini',
  model: 'gemini-3-pro-preview',
  temperature: 0.7,
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
    }),
    { name: 'pm-command-center-settings' }
  )
);
