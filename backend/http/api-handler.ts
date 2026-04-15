import type { VercelRequest, VercelResponse } from '@vercel/node';
import { env } from '../config/env';

export class ApiError extends Error {
  status: number;
  code: string;

  constructor(status: number, message: string, code = 'API_ERROR') {
    super(message);
    this.status = status;
    this.code = code;
  }
}

export type ApiHandler = (req: VercelRequest, res: VercelResponse) => Promise<void> | void;

interface HandlerOptions {
  methods?: Array<'GET' | 'POST' | 'PUT' | 'DELETE' | 'OPTIONS'>;
  authRequired?: boolean;
}

export const json = (res: VercelResponse, status: number, payload: unknown) => {
  res.status(status).json(payload);
};

export const parseBody = <T>(req: VercelRequest): T => {
  if (!req.body) return {} as T;
  if (typeof req.body === 'string') return JSON.parse(req.body) as T;
  return req.body as T;
};

const applyCors = (req: VercelRequest, res: VercelResponse) => {
  const requestOrigin = req.headers.origin;
  const allowOrigin = requestOrigin && requestOrigin === env.frontendUrl ? requestOrigin : env.frontendUrl;
  res.setHeader('Access-Control-Allow-Origin', allowOrigin);
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
};

export const withApiHandler = (handler: ApiHandler, options: HandlerOptions = {}): ApiHandler => {
  return async (req, res) => {
    applyCors(req, res);

    if (req.method === 'OPTIONS') {
      res.status(204).end();
      return;
    }

    if (options.methods && req.method && !options.methods.includes(req.method as 'GET' | 'POST' | 'PUT' | 'DELETE' | 'OPTIONS')) {
      json(res, 405, { error: 'Method not allowed' });
      return;
    }

    try {
      await handler(req, res);
    } catch (error) {
      if (error instanceof ApiError) {
        json(res, error.status, {
          error: error.message,
          code: error.code,
        });
        return;
      }

      console.error('[api] unhandled error', error);
      json(res, 500, { error: 'Internal server error', code: 'INTERNAL_SERVER_ERROR' });
    }
  };
};
