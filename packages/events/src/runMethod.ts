import { RestManager } from 'discordeno';
import { Client } from 'net-ipc';

export type RequestMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default async function runMethod<T = any>(
  client: Client,
  rest: RestManager,
  method: RequestMethod,
  route: string,
  body?: unknown,
  options?: {
    retryCount?: number;
    bucketId?: string;
    headers?: Record<string, string>;
  },
): Promise<T> {
  rest.debug(
    `[REST - RequestCreate] Method: ${method} | URL: ${route} | Retry Count: ${
      options?.retryCount ?? 0
    } | Bucket ID: ${options?.bucketId} | Body: ${JSON.stringify(body)}`,
  );

  const errorStack = new Error('Location:');
  Error.captureStackTrace(errorStack);

  const response = await client.request({
    Authorization: rest.secretKey,
    url: route,
    body,
    method,
    options,
  });

  return response;
}
