import type { VercelRequest, VercelResponse } from '@vercel/node';
import { buildGoogleAuthUrl } from '../../../backend/auth/google-auth-service';

const readState = (req: VercelRequest) => {
  if (req.method === 'GET') {
    const state = Array.isArray(req.query?.state) ? req.query?.state[0] : req.query?.state;
    return typeof state === 'string' && state.length > 0 ? state : undefined;
  }

  const body = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : (req.body || {});
  const state = (body as { state?: unknown }).state;
  return typeof state === 'string' && state.length > 0 ? state : undefined;
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    if (req.method === 'OPTIONS') {
      res.status(204).end();
      return;
    }

    if (req.method !== 'GET' && req.method !== 'POST') {
      res.status(405).json({ error: 'Method not allowed', code: 'METHOD_NOT_ALLOWED' });
      return;
    }

    const state = readState(req);
    const authUrl = buildGoogleAuthUrl(state);
    res.status(200).json({ authUrl });
  } catch (error) {
    console.error('[api/auth/google/url] unhandled error', error);
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
