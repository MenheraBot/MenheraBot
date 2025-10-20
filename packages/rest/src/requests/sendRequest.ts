/* eslint-disable @typescript-eslint/no-explicit-any */
import { Blob } from 'node:buffer';

import { RestManager } from 'discordeno/rest';
import { SendRequest } from '../types.js';

import config from '../config.js';

const { REST_AUTHORIZATION } = config(['REST_AUTHORIZATION']);

export default async (data: SendRequest, rest: RestManager): Promise<unknown> => {
  if (data.Authorization !== REST_AUTHORIZATION) {
    return {
      status: 401,
      body: {
        error: 'Unauthorized',
      },
    };
  }

  const body = data.payload?.body;

  if (
    body &&
    typeof (body as any)?.file !== 'undefined' &&
    typeof body &&
    typeof (body as any)?.file?.length === 'undefined'
  ) {
    (body as any).file.blob = new Blob([new Uint8Array(Buffer.from((body as any).file.blob, 'base64'))], {
      type: 'image/png',
    });
  }

  const result = await rest
    .sendRequest(rest, {
      method: data.method,
      url: data.url,
      bucketId: data.bucketId,
      payload: {
        body: body as string,
        headers: data.payload?.headers as Record<string, string>,
      },
      retryCount: data.retryCount,
    })
    .catch((e) => {
      if (e?.message?.includes('[404]')) return e;

      console.log(new Date().toISOString(), e);
      if (e?.message?.includes('Unexpected token < in JSON at position')) console.log(body);
      return e;
    });

  return result;
};
