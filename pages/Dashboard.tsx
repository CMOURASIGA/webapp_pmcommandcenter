
import React from 'react';
import { useProjectsStore } from '../store/useProjectsStore';
import { 
  TrendingUp, 
  AlertCircle, 
  CheckCircle2, 
  Clock, 
  Plus, 
  ChevronRight,
  Briefcase
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

const StatCard = ({ icon: Icon, label, value, colorClass }: any) => (
  <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl">
    <div className="flex items-center justify-between mb-3">
      <div className={`p-2 rounded-lg ${colorClass}`}>
        <Icon size={20} />
      </div>
      <TrendingUp size={16} className="text-slate-600" />
    </div>
    <p className="text-slate-400 text-sm font-medium">{label}</p>
    <p className="text-2xl font-bold text-slate-100 mt-1">{value}</p>
  </div>
);

export const Dashboard: React.FC = () => {
  const projects = useProjectsStore((state) => state.projects);
  const navigate = useNavigate();

  const activeProjects = projects.filter(p => p.status === 'Ativo').length;
  const atRiskProjects = projects.filter(p => p.status === 'Em Risco').length;
  const completedProjects = projects.filter(p => p.status === 'Concluído').length;

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold text-slate-100">Bem-vindo, PM</h2>
          <p className="text-slate-400 mt-1">Aqui está o resumo dos seus projetos e inteligências.</p>
        </div>
        <button 
          onClick={() => navigate('/projects')}
          className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white px-5 py-2.5 rounded-lg font-semibold transition-all shadow-lg shadow-emerald-500/20"
        >
          <Plus size={20} />
          Novo Projeto
        </button>
      </header>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard 
          icon={Briefcase} 
          label="Total de Projetos" 
          value={projects.length} 
          colorClass="bg-blue-500/10 text-blue-400" 
        />
        <StatCard 
          icon={Clock} 
          label="Em Execução" 
          value={activeProjects} 
          colorClass="bg-emerald-500/10 text-emerald-400" 
        />
        <StatCard 
          icon={AlertCircle} 
          label="Em Risco" 
          value={atRiskProjects} 
          colorClass="bg-red-500/10 text-red-400" 
        />
        <StatCard 
          icon={CheckCircle2} 
          label="Concluídos" 
          value={completedProjects} 
          colorClass="bg-indigo-500/10 text-indigo-400" 
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Active Projects List */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-slate-100">Projetos Recentes</h3>
            <Link to="/projects" className="text-sm text-emerald-400 hover:underline flex items-center gap-1">
              Ver todos <ChevronRight size={14} />
            </Link>
          </div>
          
          <div className="space-y-3">
            {projects.map(p => (
              <Link 
                key={p.id}
                to={`/projects/${p.id}`}
                className="block bg-slate-900 border border-slate-800 p-4 rounded-xl hover:bg-slate-800 transition-colors group"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                      p.status === 'Em Risco' ? 'bg-red-500/20 text-red-400' : 'bg-emerald-500/20 text-emerald-400'
                    }`}>
                      <Briefcase size={20} />
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-100 group-hover:text-emerald-400 transition-colors">{p.name}</h4>
                      <p className="text-sm text-slate-500">{p.methodology} • Início: {p.startDate}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                      p.status === 'Ativo' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                      p.status === 'Em Risco' ? 'bg-red-500/10 text-red-400 border border-red-500/20' :
                      'bg-slate-800 text-slate-400 border border-slate-700'
                    }`}>
                      {p.status}
                    </span>
                    <p className="text-xs text-slate-500 mt-2">{p.budget || '--'}</p>
                  </div>
                </div>
              </Link>
            ))}
            {projects.length === 0 && (
              <div className="bg-slate-900 border border-dashed border-slate-700 p-8 rounded-xl text-center">
                <p className="text-slate-500 italic">Nenhum projeto cadastrado.</p>
              </div>
            )}
          </div>
        </div>

        {/* Quick Actions / Activity */}
        <div className="space-y-4">
          <h3 className="text-lg font-bold text-slate-100">Agents Lab</h3>
          <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl space-y-4">
            <p className="text-sm text-slate-400 leading-relaxed">
              Use as inteligências especializadas para acelerar sua gestão.
            </p>
            <div className="space-y-2">
              <Link to="/agents" className="flex items-center justify-between p-3 bg-slate-800 hover:bg-slate-700 rounded-lg group transition-colors">
                <span className="text-sm font-medium text-slate-200">PM AI Partner</span>
                <ChevronRight size={16} className="text-slate-500 group-hover:text-emerald-400" />
              </Link>
              <Link to="/agents" className="flex items-center justify-between p-3 bg-slate-800 hover:bg-slate-700 rounded-lg group transition-colors">
                <span className="text-sm font-medium text-slate-200">BPMN Master Architect</span>
                <ChevronRight size={16} className="text-slate-500 group-hover:text-emerald-400" />
              </Link>
              <Link to="/agents" className="flex items-center justify-between p-3 bg-slate-800 hover:bg-slate-700 rounded-lg group transition-colors">
                <span className="text-sm font-medium text-slate-200">Risk & Decision Analyst</span>
                <ChevronRight size={16} className="text-slate-500 group-hover:text-emerald-400" />
              </Link>
            </div>
            <button 
              onClick={() => navigate('/agents')}
              className="w-full py-2 border border-slate-700 hover:border-emerald-500/50 hover:bg-emerald-500/5 text-slate-400 hover:text-emerald-400 text-sm font-semibold rounded-lg transition-all"
            >
              Explorar Laboratório
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
