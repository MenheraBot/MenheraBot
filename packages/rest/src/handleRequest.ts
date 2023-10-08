import { createRestManager } from 'discordeno/rest';
import { RequestTypes } from './types';
import sendRequest from './requests/sendRequest';
import runMethod from './requests/runMethod';
import config from './config';

const { DISCORD_TOKEN, REST_AUTHORIZATION } = config(['DISCORD_TOKEN', 'REST_AUTHORIZATION']);

const rest = createRestManager({
  token: DISCORD_TOKEN,
  secretKey: REST_AUTHORIZATION,
});

rest.debug = (log) => {
  // eslint-disable-next-line no-console
  if (log.includes('REST - fetchFailed')) console.log(log);
};

const handleRequest = async (req: RequestTypes): Promise<unknown> => {
  switch (req.type) {
    case 'RUN_METHOD':
      return runMethod(req.data, rest);
    case 'SEND_REQUEST':
      return sendRequest(req.data, rest);
  }
};

export { handleRequest };
