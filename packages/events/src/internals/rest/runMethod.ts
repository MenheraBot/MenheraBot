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
  const response = await client
    .request({
      type: 'RUN_METHOD',
      data: {
        Authorization: rest.secretKey,
        url: route,
        body,
        method,
        options,
      },
    })
    .catch((e) => {
      logger.error('Error in runMethod', e);
      return e;
    });

  if (response?.statusCode >= 400) logger.error(`[${response.status}] - ${response.error}`);

  return response;
};

export { runMethod };
