import { verifySignature } from 'discordeno';
import { Context, Next } from 'koa';
import { getEnviroments } from '../getEnviroments';

const verifyDiscordRequests = (ctx: Context, next: Next): Promise<unknown> => {
  const { DISCORD_PUBLIC_KEY } = getEnviroments(['DISCORD_PUBLIC_KEY']);

  const signature = ctx.request.get('X-Signature-Ed25519');
  const timestamp = ctx.request.get('X-Signature-Timestamp');
  const rawBody = ctx.request.body[Symbol.for('unparsedBody')];

  if (!signature || !timestamp || !rawBody) return ctx.throw(401, 'Invalid request signature');

  const { isValid } = verifySignature({
    body: rawBody,
    publicKey: DISCORD_PUBLIC_KEY,
    signature,
    timestamp,
  });

  if (!isValid) return ctx.throw(401, 'Invalid request signature');

  return next();
};

export { verifyDiscordRequests };
