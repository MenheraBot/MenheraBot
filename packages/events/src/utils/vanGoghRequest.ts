import axios from 'axios';

import { getEnviroments } from './getEnviroments';

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
  data: Buffer;
}

export type VanGoghReturnData = ErrorReturn | SuccessReturn;

const vanGoghRequest = async <T>(route: VanGoghEndpoints, data: T): Promise<VanGoghReturnData> => {
  const result = await VanGoghApi.post(`/${route}`, data).catch(() => null);
  if (!result) return { err: true };
  return { err: false, data: Buffer.from(result.data, 'base64') };
};

export { vanGoghRequest };
