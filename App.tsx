
import React, { useEffect, useState } from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { MainLayout } from './components/Layout';
import { Login } from './components/Login';
import { Dashboard } from './pages/Dashboard';
import { Projects } from './pages/Projects';
import { ProjectWorkspace } from './pages/ProjectWorkspace';
import { AgentsLab } from './pages/AgentsLab';
import { Settings } from './pages/Settings';
import { Help } from './pages/Help';
import { useThemeStore } from './store/useThemeStore';

const App: React.FC = () => {
  const theme = useThemeStore((state) => state.theme);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    // Aplica o tema diretamente ao body para efeitos globais
    document.documentElement.className = theme === 'light' ? 'light-theme' : 'dark-theme';
    
    // Check if user has "logged in" in this session (optional)
    const sessionAuth = sessionStorage.getItem('pm-cockpit-auth');
    if (sessionAuth === 'true') {
      setIsAuthenticated(true);
    }
  }, [theme]);

  const handleEnter = () => {
    setIsAuthenticated(true);
    sessionStorage.setItem('pm-cockpit-auth', 'true');
  };

  if (!isAuthenticated) {
    return <Login onEnter={handleEnter} />;
  }

  return (
    <div className={theme === 'light' ? 'light-theme' : 'dark-theme'}>
      <Router>
        <MainLayout>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/projects" element={<Projects />} />
            <Route path="/projects/:id" element={<ProjectWorkspace />} />
            <Route path="/agents" element={<AgentsLab />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/help" element={<Help />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </MainLayout>
      </Router>
    </div>
  );
};

export default App;
