import { BichoWinner } from 'modules/bicho/types';
import { ApiHuntingTypes } from '../../modules/hunt/types';
import { debugError } from '../debugError';
import { dataRequest } from './apiRequests';

const postHuntExecution = async (
  userId: string,
  huntType: ApiHuntingTypes,
  { value, success, tries }: { value: number; success: number; tries: number },
  userTag: string,
): Promise<void> => {
  await dataRequest
    .post('/statistics/hunt', { userId, huntType, value, success, tries, userTag })
    .catch(debugError);
};

const postBichoResults = async (players: BichoWinner[]): Promise<void> => {
  await dataRequest.post('/statistics/bicho', { players }).catch(debugError);
};

export { postHuntExecution, postBichoResults };
