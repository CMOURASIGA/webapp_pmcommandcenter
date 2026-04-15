import React from 'react';
import { WorkspaceSettings } from '../types';
import { useThemeStore } from '../store/useThemeStore';

interface SettingsPanelProps {
  settings: WorkspaceSettings;
  onAgentLinkChange: (key: keyof WorkspaceSettings['agentLinks'], value: string) => void;
  onFlagChange: (key: keyof WorkspaceSettings['flags'], value: boolean) => void;
}

export const SettingsPanel: React.FC<SettingsPanelProps> = ({ settings, onAgentLinkChange, onFlagChange }) => {
  const theme = useThemeStore((state) => state.theme);

  return (
    <section className={`rounded-3xl border p-5 ${theme === 'light' ? 'border-slate-200 bg-white' : 'border-slate-800 bg-slate-900'}`}>
      <h3 className="text-lg font-black">Configuracoes principais</h3>
      <p className="mt-1 text-sm text-slate-500">Links dos agentes e flags de comportamento.</p>

      <div className="mt-4 space-y-3">
        {(Object.keys(settings.agentLinks) as Array<keyof WorkspaceSettings['agentLinks']>).map((key) => (
          <label key={key} className="block text-sm">
            <span className="font-semibold">{key}</span>
            <input
              value={settings.agentLinks[key]}
              onChange={(event) => onAgentLinkChange(key, event.target.value)}
              className="mt-1 w-full rounded-xl border border-slate-300 bg-transparent px-3 py-2 text-xs dark:border-slate-700"
            />
          </label>
        ))}
      </div>

      <div className="mt-5 grid grid-cols-1 gap-2 md:grid-cols-2">
        {(Object.keys(settings.flags) as Array<keyof WorkspaceSettings['flags']>).map((key) => (
          <label key={key} className={`flex items-center justify-between rounded-xl border px-3 py-2 text-sm ${theme === 'light' ? 'border-slate-200 bg-slate-50' : 'border-slate-700 bg-slate-800/40'}`}>
            {key}
            <input
              type="checkbox"
              checked={settings.flags[key]}
              onChange={(event) => onFlagChange(key, event.target.checked)}
              className="h-4 w-4"
            />
          </label>
        ))}
      </div>
    </section>
  );
};
