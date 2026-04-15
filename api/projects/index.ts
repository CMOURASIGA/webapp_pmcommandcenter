import type { VercelRequest, VercelResponse } from '@vercel/node';
import { z } from 'zod';
import { withApiHandler, json, parseBody, ApiError } from '../../backend/http/api-handler';
import { requireAuthContext } from '../../backend/auth/auth-context';
import { prisma } from '../../backend/db/prisma';
import { recordAuditEvent } from '../../backend/services/audit-service';
import { loadOAuthClientForUser } from '../../backend/auth/google-auth-service';
import { ensureProjectFolderStructure } from '../../backend/services/google-drive-service';
import { syncProjectToSheet } from '../../backend/services/sheets-sync-service';

const createProjectSchema = z.object({
  clientId: z.string().min(1),
  name: z.string().min(2).max(180),
  description: z.string().max(1000).optional(),
  objective: z.string().min(2).max(500),
  methodology: z.string().min(2).max(100),
  status: z.string().min(2).max(100),
  visibility: z.enum(['PRIVATE', 'SHARED']).optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  responsible: z.string().optional(),
  health: z.string().optional(),
  phase: z.string().optional(),
  nextStep: z.string().optional(),
  stakeholders: z.array(z.string()).optional(),
});

async function handler(req: VercelRequest, res: VercelResponse) {
  const auth = await requireAuthContext(req);

  if (req.method === 'GET') {
    const projects = await prisma.project.findMany({
      where: {
        OR: [
          { ownerUserId: auth.userId },
          {
            members: {
              some: {
                status: 'ACTIVE',
                OR: [{ userId: auth.userId }, { email: auth.email }],
              },
            },
          },
        ],
      },
      include: {
        client: true,
        members: {
          where: {
            status: 'ACTIVE',
            OR: [{ userId: auth.userId }, { email: auth.email }],
          },
          take: 1,
        },
      },
      orderBy: {
        updatedAt: 'desc',
      },
    });

    json(res, 200, {
      projects: projects.map((project) => ({
        ...project,
        accessRole:
          project.ownerUserId === auth.userId
            ? 'OWNER'
            : project.members[0]?.role || 'VIEWER',
        permissionLevel:
          project.ownerUserId === auth.userId
            ? 'MANAGE'
            : project.members[0]?.permissionLevel || 'VIEW',
      })),
    });
    return;
  }

  if (req.method === 'POST') {
    const body = createProjectSchema.parse(parseBody(req));
    const client = await prisma.client.findFirst({
      where: {
        id: body.clientId,
        ownerUserId: auth.userId,
      },
    });
    if (!client) {
      throw new ApiError(404, 'Client not found', 'CLIENT_NOT_FOUND');
    }

    const userDriveContext = await prisma.userDriveContext.findUnique({
      where: { userId: auth.userId },
    });
    if (!userDriveContext?.projectsFolderId) {
      throw new ApiError(
        400,
        'Google Drive context not provisioned. Call /api/google/provision first.',
        'GOOGLE_CONTEXT_NOT_READY'
      );
    }
    const oauthClient = await loadOAuthClientForUser(auth.userId);
    if (!oauthClient) {
      throw new ApiError(400, 'Google credentials not found for this user', 'GOOGLE_CREDENTIALS_NOT_FOUND');
    }

    const folder = await ensureProjectFolderStructure({
      auth: oauthClient,
      projectsFolderId: userDriveContext.projectsFolderId,
      clientName: client.name,
      projectName: body.name,
    });

    const created = await prisma.project.create({
      data: {
        clientId: client.id,
        ownerUserId: auth.userId,
        name: body.name.trim(),
        description: body.description?.trim() || null,
        objective: body.objective.trim(),
        methodology: body.methodology.trim(),
        status: body.status.trim(),
        visibility: body.visibility || 'PRIVATE',
        startDate: body.startDate,
        endDate: body.endDate,
        responsible: body.responsible?.trim() || null,
        health: body.health?.trim() || null,
        phase: body.phase?.trim() || null,
        nextStep: body.nextStep?.trim() || null,
        stakeholdersJson: body.stakeholders || [],
        folderId: folder.projectFolderId,
        folderUrl: folder.projectFolderUrl,
      },
    });

    await recordAuditEvent({
      actorUserId: auth.userId,
      projectId: created.id,
      entityType: 'PROJECT',
      entityId: created.id,
      action: 'PROJECT_CREATED',
      summary: `Projeto criado: ${created.name}`,
    });

    await syncProjectToSheet({
      ownerUserId: auth.userId,
      projectId: created.id,
      clientId: created.clientId,
      nome: created.name,
      objetivo: created.objective,
      metodologia: created.methodology,
      status: created.status,
      startDate: created.startDate || undefined,
      endDate: created.endDate || undefined,
      responsible: created.responsible || undefined,
      folderId: created.folderId || undefined,
      visibility: created.visibility,
      createdBy: auth.email,
    });

    json(res, 201, { project: created });
  }
}

export default withApiHandler(handler, {
  methods: ['GET', 'POST'],
});
