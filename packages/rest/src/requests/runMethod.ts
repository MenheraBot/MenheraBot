/* eslint-disable @typescript-eslint/no-explicit-any */
import { BASE_URL, RestManager } from 'discordeno';
import { Blob } from 'node:buffer';

import { RunMethod } from '../types';

import config from '../config';

const { REST_AUTHORIZATION } = config(['REST_AUTHORIZATION']);

export default async (data: RunMethod, rest: RestManager): Promise<unknown> => {
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
    (data.body as any).file.blob = new Blob([new Uint8Array(Buffer.from((data.body as any).file.blob, 'base64'))], {
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
      if (e?.message?.includes('[404]')) return e;

      console.log(new Date().toISOString(), e);
      return e;
    });

  return result;
};
