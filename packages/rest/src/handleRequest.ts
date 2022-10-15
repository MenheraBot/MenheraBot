/* eslint-disable @typescript-eslint/no-explicit-any */
import { BASE_URL, createRestManager } from 'discordeno';
import { Blob } from 'node:buffer';

import { IpcRequest } from './types';
import config from './config';

const { DISCORD_TOKEN, REST_AUTHORIZATION } = config(['DISCORD_TOKEN', 'REST_AUTHORIZATION']);

const rest = createRestManager({
  token: DISCORD_TOKEN,
  secretKey: REST_AUTHORIZATION,
});

export default async (data: IpcRequest): Promise<unknown> => {
  if (data.Authorization !== REST_AUTHORIZATION) {
    return {
      status: 401,
      body: {
        error: 'Unauthorized',
      },
    };
  }

  if (
    data.body &&
    typeof (data.body as any)?.file !== 'undefined' &&
    typeof data.body &&
    typeof (data.body as any)?.file?.length === 'undefined'
  ) {
    (data.body as any).file.blob = new Blob([Buffer.from((data.body as any).file.blob, 'base64')], {
      encoding: 'base64',
      type: 'image/png',
    });
  }

  const result = await rest
    .runMethod(
      rest,
      data.method,
      `${BASE_URL}/v${rest.version}/${data.url}`,
      data.body,
      data.options,
    )
    .catch((e) => {
      // eslint-disable-next-line no-console
      console.log(e);
      return e;
    });

  return result;
};
