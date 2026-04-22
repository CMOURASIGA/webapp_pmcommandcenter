import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getSessionFromRequest } from '../../backend/auth/session-service';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    if (req.method === 'OPTIONS') {
      res.status(204).end();
      return;
    }

    if (req.method !== 'GET') {
      res.status(405).json({ error: 'Method not allowed', code: 'METHOD_NOT_ALLOWED' });
      return;
    }

    const session = await getSessionFromRequest(req);

    if (!session) {
      res.status(401).json({ authenticated: false });
      return;
    }

    res.status(200).json({
      authenticated: true,
      user: {
        id: session.user.id,
        email: session.user.email,
        name: session.user.name,
        picture: session.user.picture,
      },
      workspace: session.user.driveContext
        ? {
            rootFolderId: session.user.driveContext.rootFolderId,
            masterSpreadsheetId: session.user.driveContext.masterSpreadsheetId,
            projectsFolderId: session.user.driveContext.projectsFolderId,
          }
        : null,
      session: {
        id: session.id,
        expiresAt: session.expiresAt.toISOString(),
      },
    });
  } catch (error) {
    console.error('[api/auth/me] unhandled error', error);
    res.status(500).json({
      error: 'Internal server error',
      code: 'INTERNAL_SERVER_ERROR',
      debug:
        error instanceof Error
          ? { name: error.name, message: error.message }
          : { name: 'UnknownError', message: String(error) },
    });
  }
}
