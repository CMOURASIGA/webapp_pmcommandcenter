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

    await recordAuditEvent({
      actorUserId: auth.userId,
      entityType: 'CLIENT',
      entityId: created.id,
      action: 'CLIENT_CREATED',
      summary: `Cliente criado: ${created.name}`,
    });

    await syncClientToSheet({
      ownerUserId: auth.userId,
      clientId: created.id,
      nome: created.name,
      descricao: created.description,
      createdBy: auth.email,
    });

    json(res, 201, { client: created });
  }
}

export default withApiHandler(handler, {
  methods: ['GET', 'POST'],
});
