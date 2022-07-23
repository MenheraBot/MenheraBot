import { BASE_URL, createRestManager } from 'discordeno';
import { IpcRequest } from 'types';
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
      console.log(e.message);
      return e;
    });

  return result;
};
