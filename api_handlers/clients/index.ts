import type { VercelRequest, VercelResponse } from '@vercel/node';
import { z } from 'zod';
import { withApiHandler, json, parseBody } from '../../backend/http/api-handler';
import { requireAuthContext } from '../../backend/auth/auth-context';
import { prisma } from '../../backend/db/prisma';
import { recordAuditEvent } from '../../backend/services/audit-service';
import { syncClientToSheet } from '../../backend/services/sheets-sync-service';

const createClientSchema = z.object({
  name: z.string().min(2).max(150),
  description: z.string().max(500).optional(),
});

const withTimeout = async <T>(promise: Promise<T>, timeoutMs: number, label: string): Promise<T> => {
  let timeoutHandle: NodeJS.Timeout | undefined;
  const timeoutPromise = new Promise<never>((_, reject) => {
    timeoutHandle = setTimeout(() => {
      reject(new Error(`${label} timed out after ${timeoutMs}ms`));
    }, timeoutMs);
  });

  try {
    return await Promise.race([promise, timeoutPromise]);
  } finally {
    if (timeoutHandle) {
      clearTimeout(timeoutHandle);
    }
  }
};

async function handler(req: VercelRequest, res: VercelResponse) {
  const auth = await requireAuthContext(req);

  if (req.method === 'GET') {
    const clients = await prisma.client.findMany({
      where: {
        ownerUserId: auth.userId,
      },
      orderBy: {
        updatedAt: 'desc',
      },
    });
    json(res, 200, { clients });
    return;
  }

  if (req.method === 'POST') {
    const body = createClientSchema.parse(parseBody(req));
    const created = await prisma.client.create({
      data: {
        ownerUserId: auth.userId,
        name: body.name.trim(),
        description: body.description?.trim() || null,
      },
    });

    try {
      await recordAuditEvent({
        actorUserId: auth.userId,
        entityType: 'CLIENT',
        entityId: created.id,
        action: 'CLIENT_CREATED',
        summary: `Cliente criado: ${created.name}`,
      });
    } catch (error) {
      console.error('[clients][POST] failed to record audit event', {
        clientId: created.id,
        userId: auth.userId,
        error,
      });
    }

    try {
      await withTimeout(
        syncClientToSheet({
          ownerUserId: auth.userId,
          clientId: created.id,
          nome: created.name,
          descricao: created.description,
          createdBy: auth.email,
        }),
        8000,
        'syncClientToSheet'
      );
    } catch (error) {
      console.error('[clients][POST] failed to sync client to sheet', {
        clientId: created.id,
        userId: auth.userId,
        error,
      });
    }

    json(res, 201, { client: created });
    return;
  }
}

export default withApiHandler(handler, {
  methods: ['GET', 'POST'],
});
