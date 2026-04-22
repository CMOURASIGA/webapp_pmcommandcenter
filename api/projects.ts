import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    const mod = await import('../api_handlers/projects/index');
    await mod.default(req, res);
  } catch (error) {
    console.error('[api/projects] entrypoint failure', error);
    if (!res.headersSent) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      res.status(500).json({
        error: 'Internal server error',
        code: 'PROJECTS_ENTRYPOINT_FAILED',
        message,
      });
      return;
    }
    res.end();
  }
}
