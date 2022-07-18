import { BASE_URL, createRestManager } from 'discordeno';
import { IpcRequest } from 'types';
import config from './config';

const { DISCORD_TOKEN, REST_AUTHORIZATION, REST_PORT } = config();

const rest = createRestManager({
  token: DISCORD_TOKEN,
  secretKey: REST_AUTHORIZATION,
  customUrl: `http://localhost:${REST_PORT}`,
});

export default async (data: IpcRequest) => {
  if (data.Authorization !== REST_AUTHORIZATION) {
    return {
      status: 401,
      body: {
        error: 'Unauthorized',
      },
    };
  }

  const result = await rest.runMethod(
    rest,
    data.method as any,
    `${BASE_URL}/v${rest.version}${data.url.substring(rest.customUrl.length)}`,
    data.body,
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
