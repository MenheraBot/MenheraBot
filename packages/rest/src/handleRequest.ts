import { BASE_URL, createRestManager } from 'discordeno';
import config from './config';

const { DISCORD_TOKEN, REST_AUTHORIZATION, REST_PORT } = config();

const rest = createRestManager({
  token: DISCORD_TOKEN,
  secretKey: REST_AUTHORIZATION,
  customUrl: `http://localhost:${REST_PORT}`,
});

export default async (data: {
  request: {
    headers: { get: (arg0: string) => string };
    json: () => any;
    method: any;
    url: string;
  };
}) => {
  if (data.request.headers.get('AUTHORIZATION') !== REST_AUTHORIZATION) {
    return {
      status: 401,
      body: {
        error: 'Unauthorized',
      },
    };
  }

  const json = (await data.request.json()) as any;

  const result = await rest.runMethod(
    rest,
    data.request.method as any,
    `${BASE_URL}/v${rest.version}${data.request.url.substring(rest.customUrl.length)}`,
    json,
  );

  if (result) {
    return {
      status: 200,
      body: result,
    };
  }

  return {
    status: 204,
  };
};
