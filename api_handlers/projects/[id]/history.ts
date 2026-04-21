import type { VercelRequest, VercelResponse } from '@vercel/node';
import { withApiHandler, json, ApiError } from '../../../backend/http/api-handler';
import { requireAuthContext } from '../../../backend/auth/auth-context';
import { requireProjectView } from '../../../backend/services/authorization-service';
import { prisma } from '../../../backend/db/prisma';

async function handler(req: VercelRequest, res: VercelResponse) {
  const auth = await requireAuthContext(req);
  const projectId = String(req.query.id || '');
  if (!projectId) throw new ApiError(400, 'Project id is required');

  await requireProjectView(projectId, auth.userId, auth.email);
  const events = await prisma.auditLog.findMany({
    where: { projectId },
    orderBy: {
      createdAt: 'desc',
    },
    take: 300,
  });

  json(res, 200, { history: events });
}

export default withApiHandler(handler, {
  methods: ['GET'],
});
