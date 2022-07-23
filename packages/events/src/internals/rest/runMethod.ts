import { RestManager } from 'discordeno';
import { Client } from 'net-ipc';

import { logger } from '../../utils/logger';

export type RequestMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const runMethod = async <T = any>(
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
): Promise<T> => {
  logger.debug(`Rest Request: Method: ${method} | URL: ${route}`);

  const response = await client.request({
    Authorization: rest.secretKey,
    url: route,
    body,
    method,
    options,
  });

  if (response?.statusCode >= 400) logger.error(`[${response.status}] - ${response.error}`);

  return response;
};

export { runMethod };
