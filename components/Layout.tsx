
import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  FolderKanban, 
  Cpu, 
  Settings, 
  HelpCircle, 
  Menu, 
  X, 
  ChevronRight,
  PlusCircle,
  Briefcase,
  Sun,
  Moon
} from 'lucide-react';
import { useThemeStore } from '../store/useThemeStore';

const SidebarItem = ({ to, icon: Icon, label, active, collapsed }: any) => (
  <Link
    to={to}
    className={`flex items-center p-3 rounded-xl transition-all group ${
      active 
        ? 'bg-emerald-500/10 text-emerald-400 shadow-[inset_0_0_0_1px_rgba(16,185,129,0.2)]' 
        : 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-200'
    }`}
  >
    <Icon size={20} className={active ? 'text-emerald-400' : 'text-slate-500 group-hover:text-slate-300'} />
    {!collapsed && <span className="ml-3 font-bold text-xs uppercase tracking-widest">{label}</span>}
  </Link>
);

export const MainLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { theme, toggleTheme } = useThemeStore();

  const menuItems = [
    { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/projects', icon: FolderKanban, label: 'Projetos' },
    { to: '/agents', icon: Cpu, label: 'Agents Lab' },
    { to: '/help', icon: HelpCircle, label: 'Ajuda' },
    { to: '/settings', icon: Settings, label: 'Configurações' },
  ];

  const currentPath = location.pathname;

  // Seleção dinâmica do logo baseado no tema
  const logoUrl = theme === 'light' 
    ? 'https://i.imgur.com/JU8v63w.png' 
    : 'https://i.imgur.com/UVeg7Nr.png';

  return (
    <div className="flex h-screen bg-slate-950 overflow-hidden text-slate-200">
      {/* Mobile Backdrop */}
      {mobileOpen && (
        <div 
          className="fixed inset-0 bg-black/70 backdrop-blur-sm z-40 lg:hidden" 
          onClick={() => setMobileOpen(false)} 
        />
      )}

      {/* Sidebar */}
      <aside 
        className={`fixed inset-y-0 left-0 z-50 bg-slate-900 border-r border-slate-800/50 transition-all duration-300 transform 
          ${mobileOpen ? 'translate-x-0' : '-translate-x-full'} 
          lg:translate-x-0 lg:static 
          ${collapsed ? 'w-24' : 'w-72'}`}
      >
        <div className="flex flex-col h-full">
          <div className="flex items-center justify-between h-24 px-6 border-b border-slate-800/50">
            {!collapsed ? (
              <div className="flex items-center gap-4">
                <img 
                  src={logoUrl} 
                  alt="PM Command Center Logo" 
                  className="h-14 w-auto object-contain transition-transform hover:scale-105 duration-300"
                />
                <div className="flex flex-col">
                  <span className="text-sm font-black text-slate-100 leading-tight tracking-tighter uppercase">PM COMMAND</span>
                  <span className="text-[10px] font-bold text-emerald-500 tracking-[0.2em] uppercase opacity-80">CENTER</span>
                </div>
              </div>
            ) : (
              <img 
                src={logoUrl} 
                alt="Logo" 
                className="h-11 w-auto mx-auto object-contain transition-transform hover:scale-110 duration-300"
              />
            )}
            <button 
              onClick={() => setCollapsed(!collapsed)}
              className="hidden lg:flex p-1.5 rounded-lg text-slate-500 hover:bg-slate-800 transition-colors ml-2"
            >
              {collapsed ? <ChevronRight size={18} /> : <ChevronRight size={18} className="rotate-180" />}
            </button>
            <button 
              onClick={() => setMobileOpen(false)}
              className="lg:hidden p-1.5 rounded-lg text-slate-500 hover:bg-slate-800"
            >
              <X size={24} />
            </button>
          </div>

          <nav className="flex-1 px-4 py-8 space-y-2 overflow-y-auto scrollbar-hide">
            {menuItems.map((item) => (
              <SidebarItem 
                key={item.to}
                {...item} 
                active={currentPath === item.to || (item.to !== '/' && currentPath.startsWith(item.to))}
                collapsed={collapsed}
              />
            ))}
          </nav>

          <div className="p-6 border-t border-slate-800/50 bg-slate-900/50">
            <button 
              onClick={() => navigate('/projects')}
              className={`w-full flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white font-black py-3 px-4 rounded-xl transition-all shadow-lg shadow-emerald-500/10 active:scale-95 ${collapsed ? 'px-2' : ''}`}
            >
              <PlusCircle size={20} />
              {!collapsed && <span className="text-xs uppercase tracking-widest">Novo Projeto</span>}
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
        {/* Topbar */}
        <header className="h-20 bg-slate-900/80 backdrop-blur-xl border-b border-slate-800/50 flex items-center justify-between px-8 z-30">
          <div className="flex items-center">
            <button 
              onClick={() => setMobileOpen(true)}
              className="lg:hidden mr-4 p-2 text-slate-400 hover:text-white bg-slate-800 rounded-xl"
            >
              <Menu size={20} />
            </button>
            <div className="flex flex-col">
              <h1 className="text-sm font-black text-slate-100 uppercase tracking-widest">
                {menuItems.find(i => currentPath === i.to)?.label || 'Operacional'}
              </h1>
              <div className="flex items-center gap-2 mt-0.5">
                <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></div>
                <span className="text-[10px] text-slate-500 font-bold uppercase tracking-tighter">Sistemas Online</span>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-6">
            {/* Theme Toggle Button */}
            <button 
              onClick={toggleTheme}
              className="p-3 bg-slate-800/50 hover:bg-slate-800 rounded-2xl border border-slate-700/50 text-slate-400 hover:text-emerald-400 transition-all active:scale-90"
              title={theme === 'light' ? 'Ativar Modo Escuro' : 'Ativar Modo Claro'}
            >
              {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
            </button>

            {/* User Profile Badge - CONTRASTE GARANTIDO */}
            <div className="hidden sm:flex items-center gap-4 px-4 py-2 bg-slate-800/50 rounded-2xl border border-slate-700/50 shadow-sm transition-colors group">
              <div className="text-right">
                <p className="text-[9px] text-slate-500 font-black uppercase tracking-widest leading-none mb-1">Usuário</p>
                <p className="text-[11px] text-slate-100 font-black uppercase tracking-tight">Project Manager</p>
              </div>
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-blue-600 flex items-center justify-center text-white font-black text-xs shadow-lg ring-2 ring-white/10 group-hover:scale-105 transition-transform">
                PM
              </div>
            </div>
          </div>
        </header>

        {/* Scrollable Area */}
        <div className="flex-1 overflow-y-auto bg-slate-950 p-6 lg:p-10">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
};
