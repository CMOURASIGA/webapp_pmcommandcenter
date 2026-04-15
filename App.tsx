import React, { useEffect } from 'react';
import { HashRouter as Router, Navigate, Route, Routes } from 'react-router-dom';
import { AppShell } from './components/AppShell';
import { Login } from './components/Login';
import { Dashboard } from './pages/Dashboard';
import { Clients } from './pages/Clients';
import { Projects } from './pages/Projects';
import { ProjectWorkspace } from './pages/ProjectWorkspace';
import { ArtifactsPage } from './pages/Artifacts';
import { ProjectArtifactsPage } from './pages/ProjectArtifacts';
import { AgentsLab } from './pages/AgentsLab';
import { Help } from './pages/Help';
import { Settings } from './pages/Settings';
import { useAuthStore } from './store/useAuthStore';
import { useThemeStore } from './store/useThemeStore';
import { useWorkspaceStore } from './store/useWorkspaceStore';
import { AuthUser } from './types';
import { FeedbackProvider } from './components/FeedbackProvider';

const App: React.FC = () => {
  const theme = useThemeStore((state) => state.theme);
  const user = useAuthStore((state) => state.user);
  const login = useAuthStore((state) => state.login);
  const seedDemoData = useWorkspaceStore((state) => state.seedDemoData);

  useEffect(() => {
    document.documentElement.className = theme === 'light' ? 'light-theme' : 'dark-theme';
  }, [theme]);

  useEffect(() => {
    seedDemoData();
  }, [seedDemoData]);

  const handleAuthenticated = (authenticatedUser: AuthUser) => {
    login(authenticatedUser);
  };

  return (
    <FeedbackProvider>
      {!user ? (
        <Login onAuthenticated={handleAuthenticated} />
      ) : (
        <Router>
          <AppShell>
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/clients" element={<Clients />} />
              <Route path="/projects" element={<Projects />} />
              <Route path="/projects/:id" element={<ProjectWorkspace />} />
              <Route path="/artifacts" element={<ArtifactsPage />} />
              <Route path="/artifacts/project/:id" element={<ProjectArtifactsPage />} />
              <Route path="/agents" element={<AgentsLab />} />
              <Route path="/help" element={<Help />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </AppShell>
        </Router>
      )}
    </FeedbackProvider>
  );
};

export default App;
