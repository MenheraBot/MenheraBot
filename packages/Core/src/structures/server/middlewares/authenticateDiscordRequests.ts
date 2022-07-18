import { Context, Next } from 'koa';
import nacl from 'tweetnacl';

export default (ctx: Context, next: Next): Promise<unknown> => {
  const PUBLIC_KEY = process.env.DISCORD_PUBLIC_KEY as string;

  const signature = ctx.request.get('X-Signature-Ed25519');
  const timestamp = ctx.request.get('X-Signature-Timestamp');
  const rawBody = ctx.request.body[Symbol.for('unparsedBody')];

  if (!signature || !timestamp || !rawBody) return ctx.throw(401, 'invalid request signature');

  const isVerified = nacl.sign.detached.verify(
    Buffer.from(timestamp + rawBody),
    Buffer.from(signature, 'hex'),
    Buffer.from(PUBLIC_KEY, 'hex'),
  );

  if (!isVerified) return ctx.throw(401, 'invalid request signature');

  return next();
};
