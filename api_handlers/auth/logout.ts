import type { VercelRequest, VercelResponse } from '@vercel/node';
import { clearSessionCookie, revokeSession } from '../../backend/auth/session-service';
import { withApiHandler, json } from '../../backend/http/api-handler';

async function handler(req: VercelRequest, res: VercelResponse) {
  await revokeSession(req);
  clearSessionCookie(res);
  json(res, 200, { ok: true });
}

export default withApiHandler(handler, {
  methods: ['POST'],
});
