import React, { useEffect, useMemo, useState } from 'react';
import { ShieldCheck, ArrowRight, AlertCircle } from 'lucide-react';
import { AuthUser } from '../types';
import { authMode } from '../services/envService';
import { useThemeStore } from '../store/useThemeStore';
import { useWorkspaceStore } from '../store/useWorkspaceStore';

interface LoginProps {
  onAuthenticated: (user: AuthUser) => void;
}

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (options: Record<string, unknown>) => void;
          renderButton: (element: HTMLElement, options: Record<string, unknown>) => void;
          prompt: () => void;
        };
      };
    };
  }
}

const decodeJwt = (token: string): Record<string, unknown> | null => {
  try {
    const payload = token.split('.')[1];
    if (!payload) return null;
    const decoded = atob(payload.replace(/-/g, '+').replace(/_/g, '/'));
    return JSON.parse(decoded);
  } catch {
    return null;
  }
};

export const Login: React.FC<LoginProps> = ({ onAuthenticated }) => {
  const theme = useThemeStore((state) => state.theme);
  const settings = useWorkspaceStore((state) => state.settings);
  const [googleReady, setGoogleReady] = useState(false);
  const [googleError, setGoogleError] = useState<string | null>(null);
  const runtimeAuthMode = useMemo(() => authMode(), []);

  useEffect(() => {
    if (runtimeAuthMode !== 'google') return;
    if (!settings.googleClientId) {
      setGoogleError('VITE_GOOGLE_CLIENT_ID nao configurado. Use modo local para validar.');
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    script.onload = () => {
      const google = window.google;
      if (!google) {
        setGoogleError('Google Identity nao foi carregado.');
        return;
      }

      const handleCredential = (response: { credential: string }) => {
        const decoded = decodeJwt(response.credential);
        if (!decoded) {
          setGoogleError('Falha ao ler credencial do Google.');
          return;
        }

        onAuthenticated({
          email: String(decoded.email || 'google.user@local'),
          name: String(decoded.name || 'Google User'),
          picture: decoded.picture ? String(decoded.picture) : undefined,
          provider: 'google',
        });
      };

      google.accounts.id.initialize({
        client_id: settings.googleClientId,
        callback: handleCredential,
      });

      const target = document.getElementById('google-login-button');
      if (target) {
        google.accounts.id.renderButton(target, {
          theme: theme === 'light' ? 'outline' : 'filled_black',
          size: 'large',
          shape: 'pill',
          text: 'signin_with',
          width: 290,
        });
      }

      setGoogleReady(true);
      google.accounts.id.prompt();
    };

    script.onerror = () => setGoogleError('Nao foi possivel carregar o script de autenticacao do Google.');
    document.body.appendChild(script);

    return () => {
      if (script.parentNode) script.parentNode.removeChild(script);
    };
  }, [onAuthenticated, runtimeAuthMode, settings.googleClientId, theme]);

  const handleLocalAccess = () => {
    onAuthenticated({
      email: 'local.admin@7c.local',
      name: 'Admin Local',
      provider: 'local',
    });
  };

  return (
    <div className={`flex min-h-screen items-center justify-center px-4 ${theme === 'light' ? 'bg-slate-50' : 'bg-slate-950'}`}>
      <div className={`w-full max-w-md rounded-3xl border p-8 shadow-2xl ${theme === 'light' ? 'border-slate-200 bg-white' : 'border-slate-800 bg-slate-900'}`}>
        <div className="mb-8 text-center">
          <img src={settings.brandLogoUrl} alt="7C Commander" className="mx-auto mb-4 h-16 w-16 rounded-2xl object-cover" />
          <p className="text-xs font-black uppercase tracking-[0.22em] text-brand-500">7C Commander</p>
          <h1 className={`mt-2 text-2xl font-black ${theme === 'light' ? 'text-slate-900' : 'text-slate-100'}`}>
            Plataforma de Gestao por Projeto
          </h1>
          <p className={`mt-2 text-sm ${theme === 'light' ? 'text-slate-600' : 'text-slate-400'}`}>
            Login principal com Google e fallback local para validacao do desenvolvimento.
          </p>
        </div>

        <div className="space-y-4">
          {runtimeAuthMode === 'google' ? (
            <div className={`rounded-2xl border p-4 ${theme === 'light' ? 'border-slate-200 bg-slate-50' : 'border-slate-700 bg-slate-800/40'}`}>
              <p className="mb-3 text-[11px] font-semibold uppercase tracking-wider text-brand-500">Acesso Google</p>
              <div id="google-login-button" className="flex justify-center" />
              {!googleReady && !googleError && (
                <p className={`mt-2 text-center text-xs ${theme === 'light' ? 'text-slate-500' : 'text-slate-400'}`}>
                  Carregando autenticacao Google...
                </p>
              )}
              {googleError && (
                <p className="mt-2 flex items-center justify-center gap-1 text-xs text-amber-500">
                  <AlertCircle size={14} />
                  {googleError}
                </p>
              )}
            </div>
          ) : (
            <div className={`rounded-2xl border p-4 text-sm ${theme === 'light' ? 'border-slate-200 bg-slate-50 text-slate-600' : 'border-slate-700 bg-slate-800/40 text-slate-300'}`}>
              Modo de autenticacao ativo: <strong>local</strong> (`VITE_AUTH_MODE=local`).
            </div>
          )}

          <button
            onClick={handleLocalAccess}
            data-testid="login-local-button"
            className="flex w-full items-center justify-center gap-2 rounded-2xl bg-brand-600 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-brand-600/30 hover:bg-brand-500"
          >
            <ShieldCheck size={16} />
            Entrar no ambiente local
            <ArrowRight size={16} />
          </button>
        </div>
      </div>
    </div>
  );
};
