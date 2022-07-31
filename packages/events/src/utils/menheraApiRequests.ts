import axios from 'axios';
import { ApiHuntingTypes } from '../modules/hunt/types';
import { debugError } from './debugError';
import { getEnviroments } from './getEnviroments';

const { MENHERA_API_URL, MENHERA_AGENT, MENHERA_API_TOKEN } = getEnviroments([
  'MENHERA_API_URL',
  'MENHERA_API_TOKEN',
  'MENHERA_AGENT',
]);

const makeRequest = axios.create({
  baseURL: `${MENHERA_API_URL}/data`,
  timeout: 5000,
  headers: {
    'Content-Type': 'application/json',
    'User-Agent': MENHERA_AGENT,
    Authorization: MENHERA_API_TOKEN,
  },
});

const postHuntExecution = async (
  userId: string,
  huntType: ApiHuntingTypes,
  { value, success, tries }: { value: number; success: number; tries: number },
  userTag: string,
): Promise<void> => {
  await makeRequest
    .post('/statistics/hunt', { userId, huntType, value, success, tries, userTag })
    .catch(debugError);
};

export { postHuntExecution };
