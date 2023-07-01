import axios from 'axios';
import { Blob } from 'node:buffer';

import { getEnviroments } from './getEnviroments';
import { debugError } from './debugError';

const { VANGOGH_URL, MENHERA_AGENT, VANGOGH_TOKEN } = getEnviroments([
  'VANGOGH_URL',
  'MENHERA_AGENT',
  'VANGOGH_TOKEN',
]);

const VanGoghApi = axios.create({
  baseURL: VANGOGH_URL,
  timeout: 5_000,
  headers: {
    'Content-Type': 'application/json',
    'User-Agent': MENHERA_AGENT,
    Authorization: VANGOGH_TOKEN,
  },
});

export enum VanGoghEndpoints {
  Fluffety = 'fluffety',
  Astolfo = 'astolfo',
  Vasco = 'vasco',
  Preview = 'preview',
  EightBall = '8ball',
  Philo = 'philo',
  Ship = 'ship',
  Trisal = 'trisal',
  Profile = 'profile',
  Gado = 'gado',
  Macetava = 'macetava',
  Blackjack = 'blackjack',
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

const vanGoghRequest = async <T>(route: VanGoghEndpoints, data: T): Promise<VanGoghReturnData> => {
  const result = await VanGoghApi.post(`/${route}`, data).catch(debugError);
  if (!result) return { err: true };

  return {
    err: false,
    data: result.data as unknown as Blob,
  };
};

export { vanGoghRequest };
