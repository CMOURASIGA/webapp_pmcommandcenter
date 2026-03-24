
import React, { useState } from 'react';
import { useProjectsStore } from '../store/useProjectsStore';
import { useThemeStore } from '../store/useThemeStore';
import { 
  FolderKanban, 
  Plus, 
  Search, 
  Trash2,
  Briefcase,
  Zap,
  Layers,
  ChevronRight,
  Info,
  Pencil,
  Calendar,
  X
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { Project, Methodology } from '../types';

export const Projects: React.FC = () => {
  const { projects, addProject, updateProject, deleteProject } = useProjectsStore();
  const theme = useThemeStore((state) => state.theme);
  const [showModal, setShowModal] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [objective, setObjective] = useState('');
  const [methodology, setMethodology] = useState<Methodology>('Agile');
  const [budget, setBudget] = useState('');
  const [endDate, setEndDate] = useState('');

  const openCreateModal = () => {
    setEditingProject(null);
    setName(''); setObjective(''); setMethodology('Agile'); setBudget(''); setEndDate('');
    setShowModal(true);
  };

  const openEditModal = (project: Project) => {
    setEditingProject(project);
    setName(project.name);
    setObjective(project.objective);
    setMethodology(project.methodology);
    setBudget(project.budget || '');
    setEndDate(project.endDate || '');
    setShowModal(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    let formattedEndDate = endDate;
    if (endDate && endDate.includes('-')) {
      const [y, m, d] = endDate.split('-');
      formattedEndDate = `${d}/${m}/${y}`;
    }

    if (editingProject) {
      updateProject(editingProject.id, {
        name,
        objective,
        methodology,
        budget,
        endDate: formattedEndDate
      });
    } else {
      const formattedStartDate = new Intl.DateTimeFormat('pt-BR', {
        timeZone: 'America/Sao_Paulo',
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      }).format(new Date());
      
      const newProject: Project = {
        id: crypto.randomUUID(),
        name,
        objective,
        methodology,
        status: 'Ativo',
        startDate: formattedStartDate,
        endDate: formattedEndDate,
        budget
      };
      addProject(newProject);
    }
    setShowModal(false);
  };

  const filteredProjects = projects.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const isLight = theme === 'light';

  return (
    <div className="space-y-10 animate-in fade-in duration-700">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className={`text-4xl font-black tracking-tighter uppercase ${isLight ? 'text-slate-900' : 'text-slate-100'}`}>Cockpit de Projetos</h2>
          <p className="text-slate-500 mt-2 font-bold uppercase text-[11px] tracking-widest">Sua central de controle operacional</p>
        </div>
        <button 
          onClick={openCreateModal}
          className="flex items-center gap-3 bg-brand-600 hover:bg-brand-500 text-white px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest transition-all shadow-xl shadow-brand-600/20 active:scale-95"
        >
          <Plus size={20} strokeWidth={3} />
          Novo Projeto
        </button>
      </header>

      {/* Guia Operacional */}
      <div className={`border rounded-[32px] p-6 sm:p-8 relative overflow-hidden group grid grid-cols-1 lg:grid-cols-12 gap-6 ${isLight ? 'bg-white border-slate-200 shadow-sm' : 'bg-slate-900/50 border-slate-800'}`}>
        <div className={`absolute top-0 right-0 w-32 h-32 blur-3xl rounded-full -mr-16 -mt-16 transition-all ${isLight ? 'bg-brand-500/5' : 'bg-brand-500/10'}`}></div>
        
        <div className="lg:col-span-4 space-y-4 relative z-10">
          <div className="inline-flex p-3 bg-brand-500/10 text-brand-600 rounded-2xl">
            <Info size={24} />
          </div>
          <h3 className={`text-lg sm:text-xl font-black leading-tight uppercase ${isLight ? 'text-slate-900' : 'text-slate-100'}`}>Como funciona?</h3>
          <p className={`text-sm sm:text-xs leading-relaxed font-bold uppercase tracking-tight ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
            Cada item na lista abaixo é um ambiente de colaboração com IA. Alterne entre os especialistas para gerar diferentes artefatos.
          </p>
        </div>

        <div className="lg:col-span-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 relative z-10">
          <div className={`p-4 sm:p-6 rounded-2xl border flex gap-4 transition-colors ${isLight ? 'bg-slate-50 border-slate-100' : 'bg-slate-950/50 border-slate-800'}`}>
            <div className="p-2.5 bg-blue-500/10 text-blue-500 rounded-xl h-fit">
              <Zap size={18} />
            </div>
            <div>
              <h4 className={`text-xs sm:text-sm font-black uppercase tracking-wider mb-1 ${isLight ? 'text-slate-900' : 'text-slate-100'}`}>Saúde & Prazos</h4>
              <p className="text-sm sm:text-xs text-slate-500 leading-relaxed font-bold uppercase line-clamp-2">Cockpit calcula automaticamente a saúde do cronograma.</p>
            </div>
          </div>
          <div className={`p-4 sm:p-6 rounded-2xl border flex gap-4 transition-colors ${isLight ? 'bg-slate-50 border-slate-100' : 'bg-slate-950/50 border-slate-800'}`}>
            <div className="p-2.5 bg-yellow-500/10 text-yellow-600 rounded-xl h-fit">
              <Layers size={18} />
            </div>
            <div>
              <h4 className={`text-xs sm:text-sm font-black uppercase tracking-wider mb-1 ${isLight ? 'text-slate-900' : 'text-slate-100'}`}>Especialização</h4>
              <p className="text-sm sm:text-xs text-slate-500 leading-relaxed font-bold uppercase line-clamp-2">Trabalhe com especialistas em UX, Riscos ou BPMN.</p>
            </div>
          </div>
          <div className={`p-4 sm:p-6 rounded-2xl border flex gap-4 transition-colors ${isLight ? 'bg-slate-50 border-slate-100' : 'bg-slate-950/50 border-slate-800'}`}>
            <div className="p-2.5 bg-brand-500/10 text-brand-600 rounded-xl h-fit">
              <ChevronRight size={18} />
            </div>
            <div>
              <h4 className={`text-xs sm:text-sm font-black uppercase tracking-wider mb-1 ${isLight ? 'text-slate-900' : 'text-slate-100'}`}>Sugestão guiada</h4>
              <p className="text-sm sm:text-xs text-slate-500 leading-relaxed font-bold uppercase line-clamp-2">Siga o fluxo recomendado para acelerar o setup do projeto.</p>
            </div>
          </div>
        </div>
      </div>

      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
        <input 
          type="text"
          placeholder="Buscar projeto por nome ou objetivo..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className={`w-full border rounded-2xl pl-12 pr-4 py-4 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20 transition-all ${
            isLight ? 'bg-white border-slate-300 text-slate-900 placeholder-slate-400' : 'bg-slate-900 border-slate-800 text-slate-200 placeholder:text-slate-500'
          }`}
        />
      </div>

      <div className={`border rounded-[32px] overflow-hidden shadow-2xl transition-all ${isLight ? 'bg-white border-slate-200' : 'bg-slate-900 border-slate-800'}`}>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className={`border-b ${isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-800/30 border-slate-800'}`}>
                <th className="px-6 sm:px-8 py-5 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Identificação</th>
                <th className="px-6 sm:px-8 py-5 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] hidden md:table-cell">Método</th>
                <th className="px-6 sm:px-8 py-5 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] hidden sm:table-cell">Saúde</th>
                <th className="px-6 sm:px-8 py-5 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] hidden lg:table-cell">Início / Fim</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] text-right">Comandos</th>
              </tr>
            </thead>
            <tbody className={`divide-y ${isLight ? 'divide-slate-100' : 'divide-slate-800/50'}`}>
              {filteredProjects.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 sm:px-8 py-10 text-center text-sm text-slate-500">
                    Nenhum projeto encontrado. Ajuste o filtro ou crie um novo workspace.
                  </td>
                </tr>
              )}
              {filteredProjects.map((p) => (
                <tr key={p.id} className={`transition-all group ${isLight ? 'hover:bg-slate-50' : 'hover:bg-slate-800/20'}`}>
                  <td className="px-6 sm:px-8 py-6">
                    <Link to={`/projects/${p.id}`} className="flex items-center gap-5 group/link">
                      <div className={`p-3 rounded-2xl border transition-all shadow-lg ${
                        isLight ? 'bg-white border-slate-200 text-brand-600' : 'bg-slate-800 border-slate-700/50 text-brand-500'
                      } group-hover/link:bg-brand-600 group-hover/link:text-white group-hover/link:shadow-brand-500/20`}>
                        <FolderKanban size={22} />
                      </div>
                      <div className="min-w-0">
                        <p className={`font-black transition-colors truncate text-base tracking-tight uppercase ${isLight ? 'text-slate-900' : 'text-slate-100'} group-hover/link:text-brand-600`}>{p.name}</p>
                        <p className="text-[9px] text-slate-500 truncate max-w-[280px] font-black uppercase tracking-widest mt-0.5">{p.objective}</p>
                      </div>
                    </Link>
                  </td>
                  <td className="px-6 sm:px-8 py-6 hidden md:table-cell">
                    <span className={`text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-lg border ${
                      isLight ? 'bg-slate-100 text-slate-600 border-slate-200' : 'bg-slate-800/50 text-slate-400 border-slate-700/50'
                    }`}>
                      {p.methodology}
                    </span>
                  </td>
                  <td className="px-6 sm:px-8 py-6 hidden sm:table-cell">
                    <span className={`text-[9px] px-3 py-1.5 rounded-lg font-black uppercase tracking-widest border ${
                      p.status === 'Ativo' ? 'bg-brand-500/10 text-brand-600 border-brand-500/20' :
                      p.status === 'Em Risco' ? 'bg-red-500/10 text-red-600 border-red-500/20' :
                      (isLight ? 'bg-slate-100 text-slate-400 border-slate-200' : 'bg-slate-800 text-slate-500 border-slate-700')
                    }`}>
                      {p.status}
                    </span>
                  </td>
                  <td className="px-6 sm:px-8 py-6 hidden lg:table-cell">
                    <div className="flex flex-col">
                      <span className={`text-xs font-bold ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>{p.startDate}</span>
                      <span className="text-[9px] font-black text-slate-500 uppercase tracking-tight">até {p.endDate || '--'}</span>
                    </div>
                  </td>
                  <td className="px-8 py-6 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Link 
                        to={`/projects/${p.id}`} 
                        className={`flex items-center gap-2 px-4 py-2 border rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${
                          isLight ? 'bg-brand-50 text-brand-600 border-brand-200 hover:bg-brand-600 hover:text-white' : 'bg-brand-600/10 text-brand-400 border-brand-500/20 hover:bg-brand-600 hover:text-white'
                        }`}
                      >
                        Abrir <ChevronRight size={14} />
                      </Link>
                      <button 
                        onClick={() => openEditModal(p)}
                        className={`p-2.5 rounded-xl transition-all ${isLight ? 'text-slate-400 hover:text-blue-600 hover:bg-blue-50' : 'text-slate-500 hover:text-blue-400 hover:bg-blue-500/10'}`}
                      >
                        <Pencil size={18} />
                      </button>
                      <button 
                        onClick={() => { if(confirm('Excluir este projeto?')) deleteProject(p.id); }}
                        className={`p-2.5 rounded-xl transition-all ${isLight ? 'text-slate-400 hover:text-red-600 hover:bg-red-50' : 'text-slate-500 hover:text-red-500 hover:bg-red-500/10'}`}
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Re-estilizado para ambos os temas */}
      {showModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={() => setShowModal(false)} />
          <div className={`relative w-full max-w-xl rounded-[40px] shadow-2xl animate-in zoom-in-95 duration-300 overflow-hidden border ${isLight ? 'bg-white border-slate-200' : 'bg-slate-900 border-slate-800'}`}>
             <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-brand-500 to-blue-600"></div>
            <div className="p-10 pb-6">
              <h3 className={`text-3xl font-black flex items-center gap-4 tracking-tighter uppercase ${isLight ? 'text-slate-900' : 'text-slate-100'}`}>
                <div className="p-3 bg-brand-500/10 rounded-2xl text-brand-500">
                  {editingProject ? <Pencil size={28} /> : <Briefcase size={28} />}
                </div>
                {editingProject ? 'Editar Iniciativa' : 'Novo Workspace'}
              </h3>
            </div>
            <form onSubmit={handleSubmit} className="p-10 pt-4 space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-1">Nome da Iniciativa</label>
                <input 
                  autoFocus required value={name} onChange={(e) => setName(e.target.value)}
                  placeholder="Ex: Transformação Digital v2"
                  className={`w-full border rounded-2xl px-5 py-4 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20 transition-all ${
                    isLight ? 'bg-slate-50 border-slate-300 text-slate-900' : 'bg-slate-950 border-slate-800 text-slate-200'
                  }`}
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-1">Objetivo Central</label>
                <textarea 
                  required value={objective} onChange={(e) => setObjective(e.target.value)}
                  className={`w-full border rounded-2xl px-5 py-4 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20 h-28 resize-none transition-all ${
                    isLight ? 'bg-slate-50 border-slate-300 text-slate-900' : 'bg-slate-950 border-slate-800 text-slate-200'
                  }`}
                />
              </div>
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-1">Metodologia</label>
                  <select 
                    value={methodology} onChange={(e) => setMethodology(e.target.value as Methodology)}
                    className={`w-full border rounded-2xl px-5 py-4 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20 transition-all appearance-none ${
                      isLight ? 'bg-slate-50 border-slate-300 text-slate-900' : 'bg-slate-950 border-slate-800 text-slate-200'
                    }`}
                  >
                    <option value="Agile">Ágil (Scrum/Kanban)</option>
                    <option value="Waterfall">Cascata (Preditivo)</option>
                    <option value="Hybrid">Híbrida</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-1">Data de Término</label>
                  <input 
                    type="date"
                    value={endDate.includes('/') ? endDate.split('/').reverse().join('-') : endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className={`w-full border rounded-2xl px-5 py-4 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20 transition-all ${
                      isLight ? 'bg-slate-50 border-slate-300 text-slate-900' : 'bg-slate-950 border-slate-800 text-slate-200'
                    }`}
                  />
                </div>
              </div>
              <div className="pt-6 flex gap-4">
                <button 
                  type="button" onClick={() => setShowModal(false)}
                  className={`flex-1 py-4 rounded-2xl border font-black uppercase text-[10px] tracking-widest transition-all ${
                    isLight ? 'bg-white border-slate-200 text-slate-400 hover:bg-slate-50' : 'bg-slate-800 border-slate-700 text-slate-500 hover:bg-slate-700'
                  }`}
                >
                  Cancelar
                </button>
                <button 
                  type="submit"
                  className="flex-1 py-4 rounded-2xl bg-brand-600 hover:bg-brand-500 text-white font-black uppercase text-[10px] tracking-widest transition-all shadow-xl shadow-brand-600/20 active:scale-95"
                >
                  Confirmar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};


