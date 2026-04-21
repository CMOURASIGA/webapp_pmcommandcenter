import type { VercelRequest, VercelResponse } from '@vercel/node';

type QueryValue = string | string[];
type Query = Record<string, QueryValue>;
type RouteHandler = (req: VercelRequest, res: VercelResponse) => Promise<void> | void;
type RouteLoader = () => Promise<RouteHandler>;

const buildBaseQuery = (req: VercelRequest): Query => {
  const url = new URL(req.url || '/', 'http://localhost');
  const query: Query = {};
  for (const [key, value] of url.searchParams.entries()) {
    if (query[key] === undefined) {
      query[key] = value;
      continue;
    }
    const current = query[key];
    if (Array.isArray(current)) {
      current.push(value);
      query[key] = current;
      continue;
    }
    query[key] = [current as string, value];
  }
  return query;
};

const assignQuery = (req: VercelRequest, params: Query = {}) => {
  (req as VercelRequest & { query: Query }).query = {
    ...buildBaseQuery(req),
    ...params,
  };
};

const routeToHandler = (routePath: string): { load: RouteLoader; params?: Query } | null => {
  const route = routePath.replace(/^\/api\/?/, '').replace(/^\/+/, '');
  const segments = route.split('/').filter(Boolean).map(decodeURIComponent);

  if (segments.length === 1 && segments[0] === 'health') {
    return {
      load: async () => async (_req, res) => {
        res.status(200).json({
          ok: true,
          service: 'pm-command-center-api',
          timestamp: new Date().toISOString(),
        });
      },
    };
  }

  if (segments.length === 3 && segments[0] === 'auth' && segments[1] === 'google' && segments[2] === 'url') {
    return { load: () => import('../api_handlers/auth/google/url').then((m) => m.default as RouteHandler) };
  }
  if (segments.length === 3 && segments[0] === 'auth' && segments[1] === 'google' && segments[2] === 'callback') {
    return { load: () => import('../api_handlers/auth/google/callback').then((m) => m.default as RouteHandler) };
  }
  if (segments.length === 2 && segments[0] === 'auth' && segments[1] === 'logout') {
    return { load: () => import('../api_handlers/auth/logout').then((m) => m.default as RouteHandler) };
  }
  if (segments.length === 2 && segments[0] === 'auth' && segments[1] === 'me') {
    return { load: () => import('../api_handlers/auth/me').then((m) => m.default as RouteHandler) };
  }

  if (segments.length === 1 && segments[0] === 'clients') {
    return { load: () => import('../api_handlers/clients/index').then((m) => m.default as RouteHandler) };
  }
  if (segments.length === 2 && segments[0] === 'clients') {
    return {
      load: () => import('../api_handlers/clients/[id]').then((m) => m.default as RouteHandler),
      params: { id: segments[1] },
    };
  }

  if (segments.length === 2 && segments[0] === 'google' && segments[1] === 'context') {
    return { load: () => import('../api_handlers/google/context').then((m) => m.default as RouteHandler) };
  }
  if (segments.length === 2 && segments[0] === 'google' && segments[1] === 'provision') {
    return { load: () => import('../api_handlers/google/provision').then((m) => m.default as RouteHandler) };
  }

  if (segments.length === 1 && segments[0] === 'projects') {
    return { load: () => import('../api_handlers/projects/index').then((m) => m.default as RouteHandler) };
  }
  if (segments.length === 2 && segments[0] === 'projects') {
    return {
      load: () => import('../api_handlers/projects/[id]').then((m) => m.default as RouteHandler),
      params: { id: segments[1] },
    };
  }
  if (segments.length === 3 && segments[0] === 'projects' && segments[2] === 'artifacts') {
    return {
      load: () => import('../api_handlers/projects/[id]/artifacts').then((m) => m.default as RouteHandler),
      params: { id: segments[1] },
    };
  }
  if (segments.length === 3 && segments[0] === 'projects' && segments[2] === 'history') {
    return {
      load: () => import('../api_handlers/projects/[id]/history').then((m) => m.default as RouteHandler),
      params: { id: segments[1] },
    };
  }
  if (segments.length === 3 && segments[0] === 'projects' && segments[2] === 'share') {
    return {
      load: () => import('../api_handlers/projects/[id]/share').then((m) => m.default as RouteHandler),
      params: { id: segments[1] },
    };
  }
  if (segments.length === 3 && segments[0] === 'projects' && segments[2] === 'members') {
    return {
      load: () => import('../api_handlers/projects/[id]/members/index').then((m) => m.default as RouteHandler),
      params: { id: segments[1] },
    };
  }
  if (segments.length === 4 && segments[0] === 'projects' && segments[2] === 'members') {
    return {
      load: () => import('../api_handlers/projects/[id]/members/[memberId]').then((m) => m.default as RouteHandler),
      params: { id: segments[1], memberId: segments[3] },
    };
  }

  if (segments.length === 2 && segments[0] === 'artifacts') {
    return {
      load: () => import('../api_handlers/artifacts/[id]').then((m) => m.default as RouteHandler),
      params: { id: segments[1] },
    };
  }
  if (segments.length === 3 && segments[0] === 'artifacts' && segments[2] === 'version') {
    return {
      load: () => import('../api_handlers/artifacts/[id]/version').then((m) => m.default as RouteHandler),
      params: { id: segments[1] },
    };
  }

  return null;
};

const pickRouteQuery = (value: unknown): string | null => {
  if (typeof value === 'string') return value;
  if (Array.isArray(value) && value.length > 0 && typeof value[0] === 'string') return value[0];
  return null;
};

async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    if (req.method === 'OPTIONS') {
      res.status(204).end();
      return;
    }

    const url = new URL(req.url || '/', 'http://localhost');
    const routeFromQuery = pickRouteQuery(req.query?.route);
    const routePath = routeFromQuery ? `/api/${routeFromQuery}` : url.pathname;
    const mapped = routeToHandler(routePath);

    if (!mapped) {
      res.status(404).json({ error: 'Not found', code: 'NOT_FOUND' });
      return;
    }

    const routeHandler = await mapped.load();
    assignQuery(req, mapped.params);
    await routeHandler(req, res);
  } catch (error) {
    console.error('[api/index] unhandled error', error);
    res.status(500).json({ error: 'Internal server error', code: 'INTERNAL_SERVER_ERROR' });
  }
}

export default handler;
