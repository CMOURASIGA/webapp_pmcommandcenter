import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    const mod = await import('../api_handlers/clients/index');
    await mod.default(req, res);
  } catch (error) {
    console.error('[api/clients] entrypoint failure', error);
    if (!res.headersSent) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      res.status(500).json({
        error: 'Internal server error',
        code: 'CLIENTS_ENTRYPOINT_FAILED',
        message,
      });
      return;
    }
    res.end();
  }
}
