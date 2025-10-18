import { Context, Next } from 'koa';
import { getEnviroments } from '../../getEnviroments.js';
import { HTTPResponseCodes } from '../httpServer.js';

import { createPublicKey, verify } from 'node:crypto';

const { DISCORD_PUBLIC_KEY } = getEnviroments(['DISCORD_PUBLIC_KEY']);

const publicKey = createPublicKey({
  key: Buffer.concat([
    Buffer.from('MCowBQYDK2VwAyEA', 'base64'),
    Buffer.from(DISCORD_PUBLIC_KEY, 'hex'),
  ]),
  format: 'der',
  type: 'spki',
});

const verifyInteractionSignature = (
  signature: string,
  timestamp: string,
  body: string,
): boolean => {
  const message = Buffer.from(timestamp + body, 'utf-8');
  const signatureBuffer = Buffer.from(signature, 'hex');

  return verify(null, message, publicKey, signatureBuffer);
};

const verifyDiscordRequests = async (ctx: Context, next: Next): Promise<unknown> => {
  if (typeof ctx.request.body === 'undefined') {
    ctx.body = null;
    ctx.status = 444;
    ctx.message = 'GoAway';
    ctx.set('Connection', 'close');
    return;
  }

  const signature = ctx.request.get('X-Signature-Ed25519');
  const timestamp = ctx.request.get('X-Signature-Timestamp');
  const rawBody = ctx.request.body[Symbol.for('unparsedBody')];

  if (!signature || !timestamp || !rawBody)
    return ctx.throw(HTTPResponseCodes.Unauthorized, 'Invalid request signature');

  const isValid = await verifyInteractionSignature(signature, timestamp, rawBody);

  if (!isValid) return ctx.throw(HTTPResponseCodes.Unauthorized, 'Invalid request signature');

  return next();
};

export { verifyDiscordRequests };
