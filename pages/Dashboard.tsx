
import React from 'react';
import { useProjectsStore } from '../store/useProjectsStore';
import { useThemeStore } from '../store/useThemeStore';
import { 
  TrendingUp, 
  AlertCircle, 
  CheckCircle2, 
  Clock, 
  Plus, 
  ChevronRight,
  Briefcase,
  Cpu
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

const StatCard = ({ icon: Icon, label, value, colorClass, theme }: any) => (
  <div className={`border p-6 rounded-[24px] shadow-sm transition-all ${
    theme === 'light' 
      ? 'bg-white border-slate-200 hover:shadow-lg shadow-slate-200/50' 
      : 'bg-slate-900 border-slate-800 hover:shadow-emerald-500/5'
  }`}>
    <div className="flex items-center justify-between mb-4">
      <div className={`p-3 rounded-xl ${colorClass}`}>
        <Icon size={22} />
      </div>
      <div className={`text-[10px] font-black uppercase tracking-widest ${theme === 'light' ? 'text-slate-400' : 'text-slate-600'}`}>Agora</div>
    </div>
    <p className={`text-[10px] font-black uppercase tracking-widest ${theme === 'light' ? 'text-slate-500' : 'text-slate-500'}`}>{label}</p>
    <p className={`text-3xl font-black mt-1 tracking-tighter ${theme === 'light' ? 'text-slate-900' : 'text-slate-100'}`}>{value}</p>
  </div>
);

export const Dashboard: React.FC = () => {
  const projects = useProjectsStore((state) => state.projects);
  const navigate = useNavigate();
  const theme = useThemeStore((state) => state.theme);

  const activeProjects = projects.filter(p => p.status === 'Ativo').length;
  const atRiskProjects = projects.filter(p => p.status === 'Em Risco').length;
  const completedProjects = projects.filter(p => p.status === 'Concluído').length;

  return (
    <div className="space-y-10 animate-slide-up">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className={`text-4xl font-black tracking-tighter uppercase ${theme === 'light' ? 'text-slate-900' : 'text-slate-100'}`}>Command Dashboard</h2>
          <p className="text-slate-500 mt-2 font-bold uppercase text-[11px] tracking-widest">Visão Geral de Operações e Inteligência Artificial</p>
        </div>
        <button 
          onClick={() => navigate('/projects')}
          className="flex items-center gap-3 bg-emerald-600 hover:bg-emerald-500 text-white px-6 py-4 rounded-2xl font-black text-xs uppercase tracking-widest transition-all shadow-xl shadow-emerald-600/20 active:scale-95"
        >
          <Plus size={18} strokeWidth={3} />
          Nova Iniciativa
        </button>
      </header>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          icon={Briefcase} 
          label="Iniciativas Totais" 
          value={projects.length} 
          colorClass="bg-blue-500/10 text-blue-500 border border-blue-500/20" 
          theme={theme}
        />
        <StatCard 
          icon={Clock} 
          label="Workspaces Ativos" 
          value={activeProjects} 
          colorClass="bg-emerald-500/10 text-emerald-500 border border-emerald-500/20" 
          theme={theme}
        />
        <StatCard 
          icon={AlertCircle} 
          label="Zonas de Risco" 
          value={atRiskProjects} 
          colorClass="bg-red-500/10 text-red-500 border border-red-500/20" 
          theme={theme}
        />
        <StatCard 
          icon={CheckCircle2} 
          label="Metas Concluídas" 
          value={completedProjects} 
          colorClass="bg-indigo-500/10 text-indigo-500 border border-indigo-500/20" 
          theme={theme}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-8 space-y-6">
          <div className="flex items-center justify-between">
            <h3 className={`text-sm font-black uppercase tracking-[0.2em] flex items-center gap-2 ${theme === 'light' ? 'text-slate-900' : 'text-slate-100'}`}>
              <TrendingUp size={16} className="text-emerald-500" /> Operações Recentes
            </h3>
            <Link to="/projects" className="text-[10px] font-black text-emerald-600 hover:text-emerald-700 uppercase tracking-widest flex items-center gap-1 transition-all">
              Ver Tudo <ChevronRight size={12} />
            </Link>
          </div>
          
          <div className="space-y-4">
            {projects.slice(0, 3).map(p => (
              <Link 
                key={p.id}
                to={`/projects/${p.id}`}
                className={`block border p-5 rounded-[28px] transition-all group relative overflow-hidden shadow-sm ${
                  theme === 'light' ? 'bg-white border-slate-200 hover:border-emerald-500' : 'bg-slate-900 border-slate-800 hover:border-emerald-500/30'
                }`}
              >
                <div className="flex items-center justify-between relative z-10">
                  <div className="flex items-center gap-5">
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all shadow-inner border ${
                      p.status === 'Em Risco' 
                        ? 'bg-red-500/10 text-red-500 border-red-500/20' 
                        : 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'
                    }`}>
                      <Briefcase size={22} />
                    </div>
                    <div className="min-w-0">
                      <h4 className={`font-black group-hover:text-emerald-500 transition-colors text-lg tracking-tight uppercase ${theme === 'light' ? 'text-slate-900' : 'text-slate-100'}`}>{p.name}</h4>
                      <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest mt-1">{p.methodology} • {p.startDate}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-6">
                    <div className="text-right hidden sm:block">
                      <p className="text-[9px] text-slate-400 font-black uppercase mb-1">Budget</p>
                      <p className={`text-sm font-black leading-none ${theme === 'light' ? 'text-slate-700' : 'text-slate-200'}`}>{p.budget || '--'}</p>
                    </div>
                    <span className={`text-[9px] px-3 py-1.5 rounded-lg font-black uppercase tracking-widest border transition-all ${
                      p.status === 'Ativo' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' :
                      p.status === 'Em Risco' ? 'bg-red-500/10 text-red-500 border-red-500/20' :
                      'bg-slate-200 text-slate-600 border-slate-300 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700'
                    }`}>
                      {p.status}
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>

        <div className="lg:col-span-4 space-y-6">
          <h3 className={`text-sm font-black uppercase tracking-[0.2em] flex items-center gap-2 ${theme === 'light' ? 'text-slate-900' : 'text-slate-100'}`}>
            <Cpu size={16} className="text-blue-500" /> Especialistas Online
          </h3>
          <div className={`border p-8 rounded-[32px] space-y-6 shadow-xl relative overflow-hidden group ${
            theme === 'light' ? 'bg-white border-slate-200 shadow-slate-200/50' : 'bg-slate-900 border-slate-800 shadow-black/20'
          }`}>
            <div className={`absolute top-0 right-0 w-32 h-32 blur-3xl rounded-full -mr-16 -mt-16 group-hover:opacity-20 transition-all ${
              theme === 'light' ? 'bg-blue-500/5' : 'bg-blue-500/5'
            }`}></div>
            <p className="text-xs text-slate-500 leading-relaxed font-bold uppercase tracking-tight">
              Sua equipe de IAs especialistas está pronta para processar dados.
            </p>
            <div className="space-y-3">
              {['PM AI Partner', 'BPMN Master Architect', 'Risk Analyst'].map(agent => (
                <div key={agent} className={`flex items-center justify-between p-4 border rounded-2xl group/item transition-all cursor-pointer ${
                  theme === 'light' ? 'bg-slate-50 border-slate-200 hover:bg-white hover:shadow-md' : 'bg-slate-950/50 border-slate-800 hover:bg-slate-800/80'
                }`}>
                  <span className={`text-[10px] font-black uppercase tracking-widest ${theme === 'light' ? 'text-slate-700' : 'text-slate-300'}`}>{agent}</span>
                  <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
