import type { VercelRequest, VercelResponse } from '@vercel/node';
import { z } from 'zod';
import {
  exchangeCodeForTokens,
  readGoogleProfile,
  upsertGoogleCredentials,
  upsertUserFromGoogle,
} from '../../../backend/auth/google-auth-service';
import { createSession, setSessionCookie } from '../../../backend/auth/session-service';
import { ensureUserProvisioning } from '../../../backend/services/provisioning-service';
import { withApiHandler, parseBody, json, ApiError } from '../../../backend/http/api-handler';

const bodySchema = z.object({
  code: z.string().min(10),
});

async function handler(req: VercelRequest, res: VercelResponse) {
  const body = bodySchema.parse(parseBody(req));
  const { client, tokens } = await exchangeCodeForTokens(body.code);
  const profile = await readGoogleProfile(client);
  const user = await upsertUserFromGoogle(profile);
  await upsertGoogleCredentials(user.id, tokens);

  if (!tokens.access_token && !tokens.refresh_token) {
    throw new ApiError(401, 'Google authorization did not return usable tokens', 'GOOGLE_AUTH_FAILED');
  }

  const context = await ensureUserProvisioning({
    userId: user.id,
    googleSub: profile.googleSub,
    email: profile.email,
    name: profile.name,
    picture: profile.picture,
    auth: client,
  });

  const session = await createSession(user.id);
  setSessionCookie(res, session.rawToken, session.expiresAt);

  json(res, 200, {
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      picture: user.picture,
    },
    workspace: {
      rootFolderId: context.rootFolderId,
      masterSpreadsheetId: context.masterSpreadsheetId,
      projectsFolderId: context.projectsFolderId,
    },
  });
}

export default withApiHandler(handler, {
  methods: ['POST'],
});
