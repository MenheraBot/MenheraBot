/* eslint-disable @typescript-eslint/no-explicit-any */
import { BASE_URL } from 'discordeno';
import { Blob } from 'node:buffer';

import { rest } from '../handleRequest';
import { RunMethod } from '../types';

import config from '../config';

const { REST_AUTHORIZATION } = config(['REST_AUTHORIZATION']);

export default async (data: RunMethod): Promise<unknown> => {
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

  console.log('RUN METHOD', result);

  return result;
};
