import { RestManager } from 'discordeno';

import { Client } from 'net-ipc';

import { logger } from '../../utils/logger';

export type RequestMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const sendRequest = async <T = any>(
  client: Client,
  rest: RestManager,
  method: RequestMethod,
  route: string,
  bucketId?: string,
  retryCount?: number,
  payload?: {
    headers: Record<string, string>;
    body: unknown;
  },
): Promise<T> => {
  const response = await client.request({
    type: 'SEND_REQUEST',
    data: {
      Authorization: rest.secretKey,
      url: route,
      method,
      bucketId,
      retryCount,
      payload,
    },
  });

  if (response?.statusCode >= 400) logger.error(`[${response.status}] - ${response.error}`);

  return response;
};

export { sendRequest };
