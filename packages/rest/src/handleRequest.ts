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

const handleRequest = async (req: RequestTypes): Promise<unknown> => {
  switch (req.type) {
    case 'RUN_METHOD':
      return runMethod(req.data);
    case 'SEND_REQUEST':
      return sendRequest(req.data);
  }
};

export { handleRequest, rest };
