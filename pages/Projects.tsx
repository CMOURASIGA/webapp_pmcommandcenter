import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Eye, FolderOpen, Pencil, Plus, Search, Trash2 } from 'lucide-react';
import { useWorkspaceStore } from '../store/useWorkspaceStore';
import { useAuthStore } from '../store/useAuthStore';
import { useThemeStore } from '../store/useThemeStore';
import { Project, ProjectHealth } from '../types';
import { ProjectForm } from '../components/ProjectForm';

const splitStakeholders = (raw: string) =>
  raw
    .split(',')
    .map((value) => value.trim())
    .filter(Boolean);

export const Projects: React.FC = () => {
  const theme = useThemeStore((state) => state.theme);
  const user = useAuthStore((state) => state.user);
  const clients = useWorkspaceStore((state) => state.clients);
  const projects = useWorkspaceStore((state) => state.projects);
  const createProject = useWorkspaceStore((state) => state.createProject);
  const updateProject = useWorkspaceStore((state) => state.updateProject);
  const deleteProject = useWorkspaceStore((state) => state.deleteProject);

  const [search, setSearch] = useState('');
  const [openForm, setOpenForm] = useState(false);
  const [editing, setEditing] = useState<Project | null>(null);
  const [viewing, setViewing] = useState<Project | null>(null);

  const filteredProjects = useMemo(() => {
    const value = search.toLowerCase();
    return projects.filter(
      (project) =>
        project.name.toLowerCase().includes(value) ||
        project.objective.toLowerCase().includes(value) ||
        (project.clientName || '').toLowerCase().includes(value)
    );
  }, [projects, search]);

  const submit = (values: {
    name: string;
    objective: string;
    description: string;
    clientId: string;
    responsible: string;
    methodology: Project['methodology'];
    status: Project['status'];
    startDate: string;
    endDate?: string;
    stakeholders: string;
    nextStep: string;
    phase: string;
    health: ProjectHealth;
  }) => {
    const actor = user?.email || 'local.admin@7c.local';
    const payload = {
      ...values,
      stakeholders: splitStakeholders(values.stakeholders),
    };

    if (editing) {
      updateProject(editing.id, payload, actor);
      setEditing(null);
    } else {
      createProject(payload, actor);
    }

    setOpenForm(false);
  };

  const handleDeleteProject = (project: Project) => {
    const actor = user?.email || 'local.admin@7c.local';
    const approved = window.confirm(`Excluir projeto "${project.name}"?`);
    if (!approved) return;

    const removed = deleteProject(project.id, actor);
    if (!removed) {
      alert('Nao foi possivel excluir o projeto.');
      return;
    }

    if (viewing?.id === project.id) {
      setViewing(null);
    }
  };

  return (
    <div className="space-y-5">
      <header className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.2em] text-brand-500">Projetos</p>
          <h1 className="text-3xl font-black">Catalogo operacional</h1>
        </div>
        <button
          onClick={() => {
            setEditing(null);
            setOpenForm(true);
          }}
          className="inline-flex items-center gap-2 rounded-xl bg-brand-600 px-3 py-2 text-sm font-semibold text-white hover:bg-brand-500"
        >
          <Plus size={15} /> Novo projeto
        </button>
      </header>

      {openForm && (
        <ProjectForm
          clients={clients}
          initialProject={editing}
          onCancel={() => {
            setOpenForm(false);
            setEditing(null);
          }}
          onSubmit={submit}
        />
      )}

      <div className={`flex items-center gap-2 rounded-2xl border px-3 py-2 ${theme === 'light' ? 'border-slate-200 bg-white' : 'border-slate-800 bg-slate-900'}`}>
        <Search size={15} className="text-slate-400" />
        <input
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Buscar por nome, objetivo ou cliente..."
          className="w-full bg-transparent text-sm outline-none"
        />
      </div>

      <section className="grid grid-cols-1 gap-3 lg:grid-cols-2">
        {filteredProjects.map((project) => (
          <article key={project.id} className={`rounded-2xl border p-4 ${theme === 'light' ? 'border-slate-200 bg-white' : 'border-slate-800 bg-slate-900'}`}>
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <h2 className="truncate text-lg font-black">{project.name}</h2>
                <p className="mt-1 text-sm text-slate-500">{project.objective}</p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  title="Visualizar projeto"
                  aria-label="Visualizar projeto"
                  onClick={() => setViewing(project)}
                  className="rounded-lg border border-slate-300/70 p-2 text-slate-500 hover:text-brand-500 dark:border-slate-700"
                >
                  <Eye size={14} />
                </button>
                <button
                  title="Editar projeto"
                  aria-label="Editar projeto"
                  onClick={() => {
                    setEditing(project);
                    setOpenForm(true);
                  }}
                  className="rounded-lg border border-slate-300/70 p-2 text-slate-500 hover:text-brand-500 dark:border-slate-700"
                >
                  <Pencil size={14} />
                </button>
                <button
                  title="Excluir projeto"
                  aria-label="Excluir projeto"
                  onClick={() => handleDeleteProject(project)}
                  className="rounded-lg border border-red-200/70 p-2 text-red-500 hover:text-red-600 dark:border-red-900/40"
                >
                  <Trash2 size={14} />
                </button>
                <Link
                  to={`/projects/${project.id}`}
                  title="Abrir workspace"
                  aria-label="Abrir workspace"
                  className="rounded-lg bg-brand-600 p-2 text-white hover:bg-brand-500"
                >
                  <FolderOpen size={14} />
                </Link>
              </div>
            </div>

            <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
              <div className="rounded-xl border border-slate-200/80 p-2 dark:border-slate-700">
                <p className="font-semibold text-slate-500">Cliente</p>
                <p>{project.clientName || '-'}</p>
              </div>
              <div className="rounded-xl border border-slate-200/80 p-2 dark:border-slate-700">
                <p className="font-semibold text-slate-500">Status</p>
                <p>{project.status}</p>
              </div>
              <div className="rounded-xl border border-slate-200/80 p-2 dark:border-slate-700">
                <p className="font-semibold text-slate-500">Fase</p>
                <p>{project.phase || '-'}</p>
              </div>
              <div className="rounded-xl border border-slate-200/80 p-2 dark:border-slate-700">
                <p className="font-semibold text-slate-500">Saude</p>
                <p>{project.health || '-'}</p>
              </div>
            </div>

            <div className="mt-3 text-xs text-slate-500">
              <p>Responsavel: {project.responsible || '-'}</p>
              <p>Atualizado: {project.lastUpdate ? new Date(project.lastUpdate).toLocaleString('pt-BR') : '-'}</p>
            </div>
          </article>
        ))}
      </section>

      {filteredProjects.length === 0 && (
        <div className={`rounded-2xl border p-6 text-center text-sm ${theme === 'light' ? 'border-slate-200 bg-white text-slate-600' : 'border-slate-800 bg-slate-900 text-slate-300'}`}>
          Nenhum projeto encontrado.
        </div>
      )}

      {viewing && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-slate-950/45 p-4">
          <div className={`w-full max-w-2xl rounded-2xl border p-5 ${theme === 'light' ? 'border-slate-200 bg-white' : 'border-slate-700 bg-slate-900'}`}>
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.2em] text-brand-500">Projeto</p>
                <h3 className="mt-1 text-xl font-black">{viewing.name}</h3>
              </div>
              <button
                onClick={() => setViewing(null)}
                className="rounded-lg border border-slate-300/70 px-3 py-1 text-xs font-semibold text-slate-600 dark:border-slate-700 dark:text-slate-200"
              >
                Fechar
              </button>
            </div>

            <div className="mt-4 grid grid-cols-1 gap-3 text-sm md:grid-cols-2">
              <div className={`rounded-xl border p-3 ${theme === 'light' ? 'border-slate-200 bg-slate-50' : 'border-slate-700 bg-slate-800/50'}`}>
                <p className={`text-xs font-semibold uppercase tracking-wider ${theme === 'light' ? 'text-slate-600' : 'text-slate-300'}`}>Objetivo</p>
                <p className={theme === 'light' ? 'text-slate-800' : 'text-slate-100'}>{viewing.objective || '-'}</p>
              </div>
              <div className={`rounded-xl border p-3 ${theme === 'light' ? 'border-slate-200 bg-slate-50' : 'border-slate-700 bg-slate-800/50'}`}>
                <p className={`text-xs font-semibold uppercase tracking-wider ${theme === 'light' ? 'text-slate-600' : 'text-slate-300'}`}>Cliente</p>
                <p className={theme === 'light' ? 'text-slate-800' : 'text-slate-100'}>{viewing.clientName || '-'}</p>
              </div>
              <div className={`rounded-xl border p-3 ${theme === 'light' ? 'border-slate-200 bg-slate-50' : 'border-slate-700 bg-slate-800/50'}`}>
                <p className={`text-xs font-semibold uppercase tracking-wider ${theme === 'light' ? 'text-slate-600' : 'text-slate-300'}`}>Descricao</p>
                <p className={theme === 'light' ? 'text-slate-800' : 'text-slate-100'}>{viewing.description || '-'}</p>
              </div>
              <div className={`rounded-xl border p-3 ${theme === 'light' ? 'border-slate-200 bg-slate-50' : 'border-slate-700 bg-slate-800/50'}`}>
                <p className={`text-xs font-semibold uppercase tracking-wider ${theme === 'light' ? 'text-slate-600' : 'text-slate-300'}`}>Proximo passo</p>
                <p className={theme === 'light' ? 'text-slate-800' : 'text-slate-100'}>{viewing.nextStep || '-'}</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
