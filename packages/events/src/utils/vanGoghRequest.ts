import axios from 'axios';
import { Blob } from 'node:buffer';

import { getEnviroments } from './getEnviroments.js';
import { debugError } from './debugError.js';
import { logger } from './logger.js';
import { bot } from '../index.js';

const { VANGOGH_URL, MENHERA_AGENT, VANGOGH_TOKEN, VANGOGH_SOCKET_PATH } = getEnviroments([
  'VANGOGH_SOCKET_PATH',
  'VANGOGH_URL',
  'MENHERA_AGENT',
  'VANGOGH_TOKEN',
]);

const VanGoghApi = axios.create({
  baseURL: VANGOGH_URL,
  timeout: 7_000,
  headers: {
    'Content-Type': 'application/json',
    'User-Agent': MENHERA_AGENT,
    Authorization: VANGOGH_TOKEN,
  },
});

export enum VanGoghEndpoints {
  Fluffety = 'fluffety',
  Vasco = 'vasco',
  Preview = 'preview',
  EightBall = '8ball',
  Ship = 'ship',
  Trisal = 'trisal',
  Profile = 'profile',
  Gado = 'gado',
  Macetava = 'macetava',
  Blackjack = 'blackjack',
  PokerTable = 'poker',
  PokerHand = 'poker?player=true',
  BETA = 'beta',
}

interface ErrorReturn {
  err: true;
}

interface SuccessReturn {
  err?: false;
  data: Blob;
}

export type VanGoghReturnData = ErrorReturn | SuccessReturn;

const enableUnixSocket = (): void => {
  VanGoghApi.defaults.socketPath = VANGOGH_SOCKET_PATH;
  VanGoghApi.defaults.baseURL = undefined;
  logger.info('[VANGOGH] - Switched to Unix Socket calls');
};

const enableTcp = (): void => {
  VanGoghApi.defaults.socketPath = undefined;
  VanGoghApi.defaults.baseURL = VANGOGH_URL;
  logger.info('[VANGOGH] - Switched to TCP calls');
};

const vanGoghRequest = async <T>(route: VanGoghEndpoints, data: T): Promise<VanGoghReturnData> => {
  const startTime = Date.now();
  const result = await VanGoghApi.post(`/${route}`, data).catch(debugError);
  if (!result) return { err: true };

  const totalTime = Date.now() - startTime;

  logger.logSwitch(bot, `[VANGOGH] - ${totalTime}ms in ${route}`);

  return {
    err: false,
    data: new Blob([Buffer.from(result.data, 'base64')], {
      type: 'image/png',
    }),
  };
};

export { vanGoghRequest, enableTcp, enableUnixSocket };
