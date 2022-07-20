import { BASE_URL, createRestManager } from 'discordeno';
import { IpcRequest } from 'types';
import config from './config';

const { DISCORD_TOKEN, REST_AUTHORIZATION } = config();

const rest = createRestManager({
  token: DISCORD_TOKEN,
  secretKey: REST_AUTHORIZATION,
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

  const result = await rest
    .runMethod(
      rest,
      data.method,
      `${BASE_URL}/v${rest.version}/${data.url}`,
      data.body,
      data.options,
    )
    .catch((e) => {
      console.log(e.message);
      return { status: 500, body: { error: e.message } };
    });

  return result;
};
