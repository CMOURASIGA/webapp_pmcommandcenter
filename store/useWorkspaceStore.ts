import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import {
  AgentScope,
  Artifact,
  ArtifactFormat,
  ArtifactStatus,
  ArtifactType,
  Client,
  CoreAgentId,
  DriveFolderRef,
  HistoryEvent,
  Project,
  ProjectHealth,
  ShareAccess,
  WorkspaceSettings,
} from '../types';
import { backendMode, workspaceSettingsFromEnv } from '../services/envService';
import { backendApi } from '../services/backendApi';

interface ClientPayload {
  name: string;
  description?: string;
  owner?: string;
  notes?: string;
}

interface ProjectPayload {
  name: string;
  objective: string;
  description: string;
  clientId: string;
  responsible: string;
  methodology: Project['methodology'];
  status: Project['status'];
  startDate: string;
  endDate?: string;
  stakeholders: string[];
  nextStep: string;
  phase: string;
  health: ProjectHealth;
}

interface ArtifactPayload {
  projectId: string;
  name: string;
  type: ArtifactType;
  scope: AgentScope;
  format: ArtifactFormat;
  content: string;
  createdBy: string;
  status?: ArtifactStatus;
  agentId?: CoreAgentId;
  link?: string;
  relatedArtifactId?: string;
  note?: string;
}

interface SharePayload {
  projectId: string;
  email: string;
  role: ShareAccess['role'];
  grantedBy: string;
}

interface WorkspaceState {
  clients: Client[];
  projects: Project[];
  artifacts: Artifact[];
  history: HistoryEvent[];
  settings: WorkspaceSettings;
  dataSource: 'local' | 'api';
  isSyncing: boolean;
  setDataSource: (source: 'local' | 'api') => void;
  setWorkspaceData: (payload: {
    clients: Client[];
    projects: Project[];
    artifacts: Artifact[];
    history: HistoryEvent[];
  }) => void;
  syncFromApi: () => Promise<void>;
  clearWorkspaceData: () => void;
  createClient: (payload: ClientPayload, actor: string) => Client;
  updateClient: (id: string, payload: Partial<ClientPayload>, actor: string) => void;
  deleteClient: (id: string, actor: string) => { ok: boolean; reason?: string };
  createProject: (payload: ProjectPayload, actor: string) => Project;
  updateProject: (id: string, payload: Partial<ProjectPayload>, actor: string) => void;
  deleteProject: (id: string, actor: string) => boolean;
  createProjectAction: (payload: ProjectPayload, actor: string) => Promise<void>;
  updateProjectAction: (id: string, payload: Partial<ProjectPayload>, actor: string) => Promise<void>;
  deleteProjectAction: (id: string, actor: string) => Promise<boolean>;
  createArtifact: (payload: ArtifactPayload) => Artifact;
  updateArtifact: (
    artifactId: string,
    payload: {
      content: string;
      updatedBy: string;
      strategy: 'overwrite' | 'new-version';
      note?: string;
      status?: ArtifactStatus;
      link?: string;
    }
  ) => Artifact | null;
  updateArtifactMeta: (
    artifactId: string,
    payload: {
      name: string;
      type: ArtifactType;
      scope: AgentScope;
      format: ArtifactFormat;
      status: ArtifactStatus;
      link?: string;
      agentId?: CoreAgentId;
      updatedBy: string;
    }
  ) => Artifact | null;
  deleteArtifact: (artifactId: string, actor: string) => boolean;
  shareProject: (payload: SharePayload) => void;
  removeProjectShare: (projectId: string, accessId: string, actor: string) => void;
  updateSettings: (payload: Partial<WorkspaceSettings>) => void;
  updateAgentLink: (agent: keyof WorkspaceSettings['agentLinks'], url: string) => void;
  setFlag: (flag: keyof WorkspaceSettings['flags'], value: boolean) => void;
  seedDemoData: () => void;
}

const nowIso = () => new Date().toISOString();
const randomId = () => crypto.randomUUID();

const formatDate = (iso: string) => {
  const date = new Date(iso);
  return date.toLocaleDateString('pt-BR');
};

const fallbackFolderRef = (clientName: string, projectName: string): DriveFolderRef => {
  const base = `local-${Math.random().toString(36).slice(2, 8)}`;
  const projectSlug = projectName.toLowerCase().replace(/[^a-z0-9]+/g, '-');
  const clientSlug = clientName.toLowerCase().replace(/[^a-z0-9]+/g, '-');
  const rootUrl = `https://drive.google.com/drive/folders/${base}`;

  return {
    rootId: base,
    rootUrl,
    controlFolderId: `${base}-00`,
    controlFolderUrl: `${rootUrl}/00_Controle_Projetos`,
    clientFolderId: `${base}-${clientSlug}`,
    clientFolderUrl: `${rootUrl}/${clientSlug}`,
    projectFolderId: `${base}-${projectSlug}`,
    projectFolderUrl: `${rootUrl}/${projectSlug}`,
    subfolders: {
      contexto: `${base}-01_Contexto`,
      sai: `${base}-02_SAI`,
      pm: `${base}-03_PM`,
      bpmn: `${base}-04_BPMN`,
      status: `${base}-05_Status`,
      gerais: `${base}-06_Artefatos_Gerais`,
    },
  };
};

const addHistoryEvent = (
  state: WorkspaceState,
  entry: Omit<HistoryEvent, 'id' | 'createdAt'>
): Pick<WorkspaceState, 'history'> => ({
  history: [
    {
      id: randomId(),
      createdAt: nowIso(),
      ...entry,
    },
    ...state.history,
  ].slice(0, 1000),
});

const defaultSettings = workspaceSettingsFromEnv();

export const useWorkspaceStore = create<WorkspaceState>()(
  persist(
    (set, get) => ({
      clients: [],
      projects: [],
      artifacts: [],
      history: [],
      settings: defaultSettings,
      dataSource: backendMode(),
      isSyncing: false,

      setDataSource: (source) => set({ dataSource: source }),

      setWorkspaceData: (payload) =>
        set({
          clients: payload.clients,
          projects: payload.projects,
          artifacts: payload.artifacts,
          history: payload.history,
        }),

      syncFromApi: async () => {
        if (get().dataSource !== 'api') return;
        set({ isSyncing: true });
        try {
          const data = await backendApi.loadWorkspaceBundle();
          set({
            clients: data.clients,
            projects: data.projects,
            artifacts: data.artifacts,
            history: data.history,
            isSyncing: false,
          });
        } catch (error) {
          console.error('[workspace] failed to sync from api', error);
          set({ isSyncing: false });
          throw error;
        }
      },

      clearWorkspaceData: () =>
        set({
          clients: [],
          projects: [],
          artifacts: [],
          history: [],
        }),

      createClient: (payload, actor) => {
        const timestamp = nowIso();
        const client: Client = {
          id: randomId(),
          name: payload.name.trim(),
          description: payload.description?.trim(),
          owner: payload.owner?.trim(),
          notes: payload.notes?.trim(),
          createdAt: timestamp,
          updatedAt: timestamp,
        };

        set((state) => ({
          clients: [client, ...state.clients],
          ...addHistoryEvent(state, {
            projectId: 'GLOBAL',
            actor,
            type: 'CLIENT_CREATED',
            summary: `Cliente criado: ${client.name}`,
          }),
        }));

        return client;
      },

      updateClient: (id, payload, actor) => {
        set((state) => {
          const target = state.clients.find((client) => client.id === id);
          if (!target) return state;

          const nextClients = state.clients.map((client) =>
            client.id === id
              ? {
                  ...client,
                  ...payload,
                  name: payload.name?.trim() || client.name,
                  description: payload.description?.trim() ?? client.description,
                  owner: payload.owner?.trim() ?? client.owner,
                  notes: payload.notes?.trim() ?? client.notes,
                  updatedAt: nowIso(),
                }
              : client
          );

          return {
            clients: nextClients,
            ...addHistoryEvent(state, {
              projectId: 'GLOBAL',
              actor,
              type: 'CLIENT_UPDATED',
              summary: `Cliente atualizado: ${target.name}`,
            }),
          };
        });
      },

      deleteClient: (id, actor) => {
        const state = get();
        const target = state.clients.find((client) => client.id === id);
        if (!target) return { ok: false, reason: 'Cliente nao encontrado.' };

        const hasProjects = state.projects.some((project) => project.clientId === id);
        if (hasProjects) {
          return { ok: false, reason: 'Cliente possui projetos vinculados. Exclua ou mova os projetos antes.' };
        }

        set((current) => ({
          clients: current.clients.filter((client) => client.id !== id),
          ...addHistoryEvent(current, {
            projectId: 'GLOBAL',
            actor,
            type: 'CLIENT_DELETED',
            summary: `Cliente removido: ${target.name}`,
          }),
        }));

        return { ok: true };
      },

      createProject: (payload, actor) => {
        const client = get().clients.find((item) => item.id === payload.clientId);
        if (!client) {
          throw new Error('Cliente nao encontrado para o projeto.');
        }

        const project: Project = {
          id: randomId(),
          name: payload.name.trim(),
          objective: payload.objective.trim(),
          description: payload.description.trim(),
          clientId: client.id,
          clientName: client.name,
          responsible: payload.responsible.trim(),
          methodology: payload.methodology,
          status: payload.status,
          startDate: payload.startDate,
          endDate: payload.endDate,
          stakeholders: payload.stakeholders,
          nextStep: payload.nextStep,
          phase: payload.phase,
          health: payload.health,
          lastUpdate: nowIso(),
          folderRef: fallbackFolderRef(client.name, payload.name),
          sharedWith: [],
        };

        set((state) => ({
          projects: [project, ...state.projects],
          ...addHistoryEvent(state, {
            projectId: project.id,
            actor,
            type: 'PROJECT_CREATED',
            summary: `Projeto criado: ${project.name}`,
          }),
        }));

        return project;
      },

      updateProject: (id, payload, actor) => {
        set((state) => {
          const current = state.projects.find((project) => project.id === id);
          if (!current) return state;

          const stakeholders = payload.stakeholders || current.stakeholders || [];
          const selectedClient = payload.clientId
            ? state.clients.find((client) => client.id === payload.clientId)
            : undefined;
          const nextProjects = state.projects.map((project) => {
            if (project.id !== id) return project;

            return {
              ...project,
              ...payload,
              name: payload.name?.trim() || project.name,
              objective: payload.objective?.trim() || project.objective,
              description: payload.description?.trim() || project.description,
              responsible: payload.responsible?.trim() || project.responsible,
              nextStep: payload.nextStep?.trim() || project.nextStep,
              clientName: selectedClient?.name || project.clientName,
              stakeholders,
              lastUpdate: nowIso(),
            };
          });

          return {
            projects: nextProjects,
            ...addHistoryEvent(state, {
              projectId: id,
              actor,
              type: 'PROJECT_UPDATED',
              summary: `Projeto atualizado: ${current.name}`,
            }),
          };
        });
      },

      deleteProject: (id, actor) => {
        const current = get().projects.find((project) => project.id === id);
        if (!current) return false;

        set((state) => ({
          projects: state.projects.filter((project) => project.id !== id),
          artifacts: state.artifacts.filter((artifact) => artifact.projectId !== id),
          ...addHistoryEvent(state, {
            projectId: 'GLOBAL',
            actor,
            type: 'PROJECT_DELETED',
            summary: `Projeto removido: ${current.name}`,
          }),
        }));

        return true;
      },

      createProjectAction: async (payload, actor) => {
        if (get().dataSource === 'api') {
          await backendApi.createProject({
            clientId: payload.clientId,
            name: payload.name,
            description: payload.description,
            objective: payload.objective,
            methodology: payload.methodology,
            status: payload.status,
            startDate: payload.startDate,
            endDate: payload.endDate,
            responsible: payload.responsible,
            health: payload.health,
            phase: payload.phase,
            nextStep: payload.nextStep,
            stakeholders: payload.stakeholders,
          });
          await get().syncFromApi();
          return;
        }

        get().createProject(payload, actor);
      },

      updateProjectAction: async (id, payload, actor) => {
        if (get().dataSource === 'api') {
          await backendApi.updateProject(id, payload);
          await get().syncFromApi();
          return;
        }

        get().updateProject(id, payload, actor);
      },

      deleteProjectAction: async (id, actor) => {
        if (get().dataSource === 'api') {
          await backendApi.deleteProject(id);
          await get().syncFromApi();
          return true;
        }

        return get().deleteProject(id, actor);
      },

      createArtifact: (payload) => {
        const project = get().projects.find((item) => item.id === payload.projectId);
        if (!project) {
          throw new Error('Projeto nao encontrado para o artefato.');
        }

        const version = {
          version: 1,
          content: payload.content,
          note: payload.note,
          createdAt: nowIso(),
          createdBy: payload.createdBy,
        };

        const artifact: Artifact = {
          id: randomId(),
          projectId: project.id,
          clientId: project.clientId,
          name: payload.name.trim(),
          type: payload.type,
          scope: payload.scope,
          format: payload.format,
          status: payload.status || 'DRAFT',
          agentId: payload.agentId,
          link: payload.link,
          currentVersion: 1,
          versions: [version],
          createdAt: version.createdAt,
          createdBy: payload.createdBy,
          updatedAt: version.createdAt,
          updatedBy: payload.createdBy,
          isCurrent: true,
          relatedArtifactId: payload.relatedArtifactId,
          metadata: {},
        };

        set((state) => ({
          artifacts: [artifact, ...state.artifacts],
          ...addHistoryEvent(state, {
            projectId: project.id,
            actor: payload.createdBy,
            type: 'ARTIFACT_CREATED',
            summary: `Artefato criado: ${artifact.name} v1`,
            agentId: payload.agentId,
          }),
        }));

        return artifact;
      },

      updateArtifact: (artifactId, payload) => {
        const artifact = get().artifacts.find((item) => item.id === artifactId);
        if (!artifact) return null;

        const timestamp = nowIso();
        const currentVersionEntry = artifact.versions.find((entry) => entry.version === artifact.currentVersion);
        const nextVersion = payload.strategy === 'new-version' ? artifact.currentVersion + 1 : artifact.currentVersion;

        const nextVersions =
          payload.strategy === 'new-version'
            ? [
                ...artifact.versions,
                {
                  version: nextVersion,
                  content: payload.content,
                  note: payload.note,
                  createdAt: timestamp,
                  createdBy: payload.updatedBy,
                },
              ]
            : artifact.versions.map((entry) =>
                entry.version === artifact.currentVersion
                  ? {
                      ...entry,
                      content: payload.content,
                      note: payload.note || entry.note,
                      createdAt: entry.createdAt,
                      createdBy: entry.createdBy,
                    }
                  : entry
              );

        const updatedArtifact: Artifact = {
          ...artifact,
          versions: nextVersions,
          currentVersion: nextVersion,
          updatedAt: timestamp,
          updatedBy: payload.updatedBy,
          status: payload.status || artifact.status,
          link: payload.link || artifact.link,
        };

        set((state) => ({
          artifacts: state.artifacts.map((item) => (item.id === artifactId ? updatedArtifact : item)),
          ...addHistoryEvent(state, {
            projectId: artifact.projectId,
            actor: payload.updatedBy,
            type: payload.strategy === 'new-version' ? 'ARTIFACT_VERSIONED' : 'ARTIFACT_UPDATED',
            summary:
              payload.strategy === 'new-version'
                ? `Nova versao do artefato: ${artifact.name} v${nextVersion}`
                : `Artefato atualizado: ${artifact.name} v${currentVersionEntry?.version || artifact.currentVersion}`,
            agentId: artifact.agentId,
          }),
        }));

        return updatedArtifact;
      },

      updateArtifactMeta: (artifactId, payload) => {
        const artifact = get().artifacts.find((item) => item.id === artifactId);
        if (!artifact) return null;

        const updatedArtifact: Artifact = {
          ...artifact,
          name: payload.name.trim(),
          type: payload.type,
          scope: payload.scope,
          format: payload.format,
          status: payload.status,
          link: payload.link?.trim() || undefined,
          agentId: payload.agentId,
          updatedBy: payload.updatedBy,
          updatedAt: nowIso(),
        };

        set((state) => ({
          artifacts: state.artifacts.map((item) => (item.id === artifactId ? updatedArtifact : item)),
          ...addHistoryEvent(state, {
            projectId: artifact.projectId,
            actor: payload.updatedBy,
            type: 'ARTIFACT_UPDATED',
            summary: `Dados do artefato atualizados: ${updatedArtifact.name}`,
            agentId: updatedArtifact.agentId,
          }),
        }));

        return updatedArtifact;
      },

      deleteArtifact: (artifactId, actor) => {
        const artifact = get().artifacts.find((item) => item.id === artifactId);
        if (!artifact) return false;

        set((state) => ({
          artifacts: state.artifacts.filter((item) => item.id !== artifactId),
          ...addHistoryEvent(state, {
            projectId: artifact.projectId,
            actor,
            type: 'ARTIFACT_DELETED',
            summary: `Artefato removido: ${artifact.name}`,
            agentId: artifact.agentId,
          }),
        }));

        return true;
      },

      shareProject: ({ projectId, email, role, grantedBy }) => {
        set((state) => {
          const project = state.projects.find((item) => item.id === projectId);
          if (!project) return state;

          const cleanEmail = email.trim().toLowerCase();
          if (!cleanEmail) return state;

          const alreadyShared = (project.sharedWith || []).some((entry) => entry.email === cleanEmail);
          if (alreadyShared) return state;

          const share: ShareAccess = {
            id: randomId(),
            email: cleanEmail,
            role,
            grantedAt: nowIso(),
          };

          return {
            projects: state.projects.map((item) =>
              item.id === projectId
                ? {
                    ...item,
                    sharedWith: [share, ...(item.sharedWith || [])],
                    lastUpdate: nowIso(),
                  }
                : item
            ),
            ...addHistoryEvent(state, {
              projectId,
              actor: grantedBy,
              type: 'SHARE_GRANTED',
              summary: `Compartilhado com ${cleanEmail} (${role})`,
            }),
          };
        });
      },

      removeProjectShare: (projectId, accessId, actor) => {
        set((state) => ({
          projects: state.projects.map((project) =>
            project.id === projectId
              ? {
                  ...project,
                  sharedWith: (project.sharedWith || []).filter((entry) => entry.id !== accessId),
                  lastUpdate: nowIso(),
                }
              : project
          ),
          ...addHistoryEvent(state, {
            projectId,
            actor,
            type: 'SHARE_REMOVED',
            summary: 'Acesso removido do projeto',
          }),
        }));
      },

      updateSettings: (payload) => {
        set((state) => ({
          settings: {
            ...state.settings,
            ...payload,
            flags: {
              ...state.settings.flags,
              ...(payload.flags || {}),
            },
            agentLinks: {
              ...state.settings.agentLinks,
              ...(payload.agentLinks || {}),
            },
          },
        }));
      },

      updateAgentLink: (agent, url) => {
        set((state) => ({
          settings: {
            ...state.settings,
            agentLinks: {
              ...state.settings.agentLinks,
              [agent]: url,
            },
          },
        }));
      },

      setFlag: (flag, value) => {
        set((state) => ({
          settings: {
            ...state.settings,
            flags: {
              ...state.settings.flags,
              [flag]: value,
            },
          },
        }));
      },

      seedDemoData: () => {
        if (get().dataSource === 'api') return;
        const state = get();
        if (state.clients.length > 0 || state.projects.length > 0) return;

        const actor = 'system@7c.local';
        const client = state.createClient(
          {
            name: 'Cliente Demo 7C',
            description: 'Conta de validacao local',
            owner: 'Gestor Local',
            notes: 'Criado automaticamente para smoke test local',
          },
          actor
        );

        const project = get().createProject(
          {
            name: 'Projeto Onboarding 7C',
            objective: 'Validar fluxo completo Cliente > Projeto > Agente > Artefato',
            description: 'Projeto piloto para validar as fases iniciais no ambiente local',
            clientId: client.id,
            responsible: 'Gestor Local',
            methodology: 'Hybrid',
            status: 'Ativo',
            startDate: formatDate(nowIso()),
            endDate: '',
            stakeholders: ['Diretoria', 'PMO', 'Produto'],
            nextStep: 'Executar Storyboard inicial',
            phase: 'Descoberta',
            health: 'Saudavel',
          },
          actor
        );

        get().createArtifact({
          projectId: project.id,
          name: `Storyboard_Inicial_${new Date().toISOString().slice(0, 10)}`,
          type: 'STORYBOARD',
          scope: 'SAI',
          format: 'markdown',
          content: '# Storyboard inicial\n\n- Contexto consolidado\n- Hipoteses principais\n- Proximos passos',
          createdBy: actor,
          status: 'ACTIVE',
          agentId: 'storyboardIntelligenceArchitect',
          note: 'Seed local',
        });
      },
    }),
    {
      name: '7c-commander-workspace',
      partialize: (state) => ({
        clients: state.clients,
        projects: state.projects,
        artifacts: state.artifacts,
        history: state.history,
        settings: state.settings,
        dataSource: state.dataSource,
      }),
    }
  )
);
