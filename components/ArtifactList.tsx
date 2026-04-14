import React from 'react';
import { Artifact } from '../types';
import { Eye, ExternalLink, RefreshCcw, PlusCircle, Pencil, Trash2 } from 'lucide-react';
import { useThemeStore } from '../store/useThemeStore';

interface ArtifactListProps {
  artifacts: Artifact[];
  onSelect: (artifact: Artifact) => void;
  onOpenLink?: (artifact: Artifact) => void;
  onUpdateArtifact?: (artifact: Artifact) => void;
  onNewVersion?: (artifact: Artifact) => void;
  onEditArtifact?: (artifact: Artifact) => void;
  onDeleteArtifact?: (artifact: Artifact) => void;
  selectedArtifactId?: string;
}

export const ArtifactList: React.FC<ArtifactListProps> = ({
  artifacts,
  onSelect,
  onOpenLink,
  onUpdateArtifact,
  onNewVersion,
  onEditArtifact,
  onDeleteArtifact,
  selectedArtifactId,
}) => {
  const theme = useThemeStore((state) => state.theme);

  if (artifacts.length === 0) {
    return (
      <div className={`rounded-2xl border p-6 text-sm ${theme === 'light' ? 'border-slate-200 bg-white text-slate-600' : 'border-slate-800 bg-slate-900 text-slate-300'}`}>
        Nenhum artefato encontrado para o filtro atual.
      </div>
    );
  }

  return (
    <div className={`overflow-hidden rounded-2xl border ${theme === 'light' ? 'border-slate-200 bg-white' : 'border-slate-800 bg-slate-900'}`}>
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className={theme === 'light' ? 'bg-slate-50' : 'bg-slate-800/60'}>
            <tr>
              <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-slate-500">Nome</th>
              <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-slate-500">Tipo</th>
              <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-slate-500">Agente</th>
              <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-slate-500">Versao</th>
              <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-slate-500">Atualizacao</th>
              <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-slate-500 text-right">Acoes</th>
            </tr>
          </thead>
          <tbody>
            {artifacts.map((artifact) => {
              const selected = selectedArtifactId === artifact.id;
              return (
                <tr
                  key={artifact.id}
                  className={`border-t ${
                    theme === 'light' ? 'border-slate-100 hover:bg-slate-50' : 'border-slate-800 hover:bg-slate-800/60'
                  } ${selected ? (theme === 'light' ? 'bg-brand-50/60' : 'bg-brand-900/20') : ''}`}
                >
                  <td className="px-4 py-3">
                    <p className="font-semibold">{artifact.name}</p>
                    <p className="text-xs text-slate-500">{artifact.scope} · {artifact.format}</p>
                  </td>
                  <td className="px-4 py-3 text-xs font-semibold">{artifact.type}</td>
                  <td className="px-4 py-3 text-xs">{artifact.agentId || '-'}</td>
                  <td className="px-4 py-3 text-xs">v{artifact.currentVersion}</td>
                  <td className="px-4 py-3 text-xs">{new Date(artifact.updatedAt).toLocaleString('pt-BR')}</td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-2">
                      <button onClick={() => onSelect(artifact)} className="rounded-lg border border-slate-300/70 p-2 text-slate-500 hover:text-brand-500 dark:border-slate-700">
                        <Eye size={14} />
                      </button>
                      {onEditArtifact && (
                        <button onClick={() => onEditArtifact(artifact)} className="rounded-lg border border-slate-300/70 p-2 text-slate-500 hover:text-brand-500 dark:border-slate-700" title="Editar artefato" aria-label="Editar artefato">
                          <Pencil size={14} />
                        </button>
                      )}
                      {onUpdateArtifact && (
                        <button onClick={() => onUpdateArtifact(artifact)} className="rounded-lg border border-slate-300/70 p-2 text-slate-500 hover:text-brand-500 dark:border-slate-700" title="Atualizar versao atual" aria-label="Atualizar versao atual">
                          <RefreshCcw size={14} />
                        </button>
                      )}
                      {onNewVersion && (
                        <button onClick={() => onNewVersion(artifact)} className="rounded-lg border border-slate-300/70 p-2 text-slate-500 hover:text-brand-500 dark:border-slate-700" title="Criar nova versao" aria-label="Criar nova versao">
                          <PlusCircle size={14} />
                        </button>
                      )}
                      {onOpenLink && (
                        <button onClick={() => onOpenLink(artifact)} className="rounded-lg border border-slate-300/70 p-2 text-slate-500 hover:text-brand-500 dark:border-slate-700" title="Abrir link externo" aria-label="Abrir link externo">
                          <ExternalLink size={14} />
                        </button>
                      )}
                      {onDeleteArtifact && (
                        <button onClick={() => onDeleteArtifact(artifact)} className="rounded-lg border border-red-200/70 p-2 text-red-500 hover:text-red-600 dark:border-red-900/40" title="Excluir artefato" aria-label="Excluir artefato">
                          <Trash2 size={14} />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
