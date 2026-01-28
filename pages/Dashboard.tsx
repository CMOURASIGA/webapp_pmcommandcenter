
import React from 'react';
import { useProjectsStore } from '../store/useProjectsStore';
import { 
  TrendingUp, 
  AlertCircle, 
  CheckCircle2, 
  Clock, 
  Plus, 
  ChevronRight,
  Briefcase,
  // Fix: Added missing Cpu import
  Cpu
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

const StatCard = ({ icon: Icon, label, value, colorClass }: any) => (
  <div className="bg-slate-900 border border-slate-800 p-6 rounded-[24px] shadow-sm hover:shadow-emerald-500/5 transition-all">
    <div className="flex items-center justify-between mb-4">
      <div className={`p-3 rounded-xl ${colorClass}`}>
        <Icon size={22} />
      </div>
      <div className="text-[10px] font-black text-slate-600 uppercase tracking-widest">Update: Now</div>
    </div>
    <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest">{label}</p>
    <p className="text-3xl font-black text-slate-100 mt-1 tracking-tighter">{value}</p>
  </div>
);

export const Dashboard: React.FC = () => {
  const projects = useProjectsStore((state) => state.projects);
  const navigate = useNavigate();

  const activeProjects = projects.filter(p => p.status === 'Ativo').length;
  const atRiskProjects = projects.filter(p => p.status === 'Em Risco').length;
  const completedProjects = projects.filter(p => p.status === 'Concluído').length;

  return (
    <div className="space-y-10 animate-slide-up">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className="text-4xl font-black text-slate-100 tracking-tighter uppercase">Command Dashboard</h2>
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
          colorClass="bg-blue-500/10 text-blue-400 border border-blue-500/20" 
        />
        <StatCard 
          icon={Clock} 
          label="Workspaces Ativos" 
          value={activeProjects} 
          colorClass="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" 
        />
        <StatCard 
          icon={AlertCircle} 
          label="Zonas de Risco" 
          value={atRiskProjects} 
          colorClass="bg-red-500/10 text-red-400 border border-red-500/20" 
        />
        <StatCard 
          icon={CheckCircle2} 
          label="Metas Concluídas" 
          value={completedProjects} 
          colorClass="bg-indigo-500/10 text-indigo-400 border border-indigo-500/20" 
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-8 space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-black text-slate-100 uppercase tracking-[0.2em] flex items-center gap-2">
              <TrendingUp size={16} className="text-emerald-500" /> Operações Recentes
            </h3>
            <Link to="/projects" className="text-[10px] font-black text-emerald-500 hover:text-emerald-400 uppercase tracking-widest flex items-center gap-1 transition-all">
              Ver Tudo <ChevronRight size={12} />
            </Link>
          </div>
          
          <div className="space-y-4">
            {projects.slice(0, 3).map(p => (
              <Link 
                key={p.id}
                to={`/projects/${p.id}`}
                className="block bg-slate-900 border border-slate-800 p-5 rounded-[28px] hover:border-emerald-500/30 transition-all group relative overflow-hidden shadow-sm"
              >
                <div className="flex items-center justify-between relative z-10">
                  <div className="flex items-center gap-5">
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all shadow-inner ${
                      p.status === 'Em Risco' ? 'bg-red-500/10 text-red-400 border border-red-500/20' : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                    }`}>
                      <Briefcase size={22} />
                    </div>
                    <div className="min-w-0">
                      <h4 className="font-black text-slate-100 group-hover:text-emerald-400 transition-colors text-lg tracking-tight uppercase">{p.name}</h4>
                      <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest mt-1">{p.methodology} • {p.startDate}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-6">
                    <div className="text-right hidden sm:block">
                      <p className="text-[9px] text-slate-600 font-black uppercase mb-1">Budget</p>
                      <p className="text-sm font-black text-slate-200 leading-none">{p.budget || '--'}</p>
                    </div>
                    <span className={`text-[9px] px-3 py-1.5 rounded-lg font-black uppercase tracking-widest border transition-all ${
                      p.status === 'Ativo' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                      p.status === 'Em Risco' ? 'bg-red-500/10 text-red-400 border-red-500/20' :
                      'bg-slate-800 text-slate-400 border-slate-700'
                    }`}>
                      {p.status}
                    </span>
                  </div>
                </div>
              </Link>
            ))}
            {projects.length === 0 && (
              <div className="bg-slate-900 border border-dashed border-slate-700 p-12 rounded-[32px] text-center">
                <p className="text-slate-500 font-black uppercase text-[10px] tracking-widest">Nenhum workspace operacional detectado.</p>
              </div>
            )}
          </div>
        </div>

        <div className="lg:col-span-4 space-y-6">
          <h3 className="text-sm font-black text-slate-100 uppercase tracking-[0.2em] flex items-center gap-2">
            <Cpu size={16} className="text-blue-500" /> Especialistas Online
          </h3>
          <div className="bg-slate-900 border border-slate-800 p-8 rounded-[32px] space-y-6 shadow-xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 blur-3xl rounded-full -mr-16 -mt-16 group-hover:bg-blue-500/10 transition-all"></div>
            <p className="text-xs text-slate-400 leading-relaxed font-bold uppercase tracking-tight">
              Sua equipe de IAs especialistas está pronta para processar dados e gerar artefatos.
            </p>
            <div className="space-y-3">
              {['PM AI Partner', 'BPMN Master Architect', 'Risk Decision Analyst'].map(agent => (
                <div key={agent} className="flex items-center justify-between p-4 bg-slate-950/50 hover:bg-slate-800/80 border border-slate-800 rounded-2xl group/item transition-all cursor-pointer">
                  <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">{agent}</span>
                  <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]"></div>
                </div>
              ))}
            </div>
            <button 
              onClick={() => navigate('/agents')}
              className="w-full py-4 border border-slate-700 hover:border-blue-500/50 hover:bg-blue-500/5 text-slate-500 hover:text-blue-400 text-[10px] font-black uppercase tracking-[0.2em] rounded-2xl transition-all shadow-sm"
            >
              Laboratório de Agentes
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
