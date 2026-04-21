import React from 'react';
import { useWorkspaceStore } from '../store/useWorkspaceStore';
import { SettingsPanel } from '../components/SettingsPanel';
import { useThemeStore } from '../store/useThemeStore';

export const Settings: React.FC = () => {
  const theme = useThemeStore((state) => state.theme);
  const settings = useWorkspaceStore((state) => state.settings);
  const updateAgentLink = useWorkspaceStore((state) => state.updateAgentLink);
  const setFlag = useWorkspaceStore((state) => state.setFlag);

  return (
    <div className="space-y-5">
      <header>
        <p className="text-xs font-black uppercase tracking-[0.2em] text-brand-500">Configuracoes</p>
        <h1 className="text-3xl font-black">Painel de configuracao do ambiente</h1>
      </header>

      <SettingsPanel
        settings={settings}
        onAgentLinkChange={updateAgentLink}
        onFlagChange={setFlag}
      />

      <section className={`rounded-3xl border p-5 ${theme === 'light' ? 'border-slate-200 bg-white' : 'border-slate-800 bg-slate-900'}`}>
        <h2 className="text-lg font-black">Variaveis de ambiente em uso</h2>
        <div className="mt-3 grid grid-cols-1 gap-3 md:grid-cols-2">
          <div className={`rounded-2xl border p-3 text-sm ${theme === 'light' ? 'border-slate-200 bg-slate-50' : 'border-slate-700 bg-slate-800/40'}`}>
            <p><strong>App:</strong> {settings.appName}</p>
            <p><strong>Env:</strong> {settings.appEnv}</p>
            <p><strong>Base URL:</strong> {settings.webappBaseUrl}</p>
          </div>
          <div className={`rounded-2xl border p-3 text-sm ${theme === 'light' ? 'border-slate-200 bg-slate-50' : 'border-slate-700 bg-slate-800/40'}`}>
            <p><strong>Drive root:</strong> {settings.driveRootFolderName}</p>
            <p><strong>Sheet:</strong> {settings.projectsMasterSheetName}</p>
            <p><strong>Google Client ID:</strong> {settings.googleClientId ? 'configurado' : 'nao configurado'}</p>
          </div>
        </div>
      </section>
    </div>
  );
};
