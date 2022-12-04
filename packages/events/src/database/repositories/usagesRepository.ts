import { BigString } from 'discordeno/types';
import { debugError } from '../../utils/debugError';
import { RedisClient } from '../databases';

const isUserInEconomyUsage = async (userId: BigString): Promise<boolean> =>
  RedisClient.sismember('economy_usages', `${userId}`)
    .then((result) => result !== 0)
    .catch((e) => {
      debugError(e);
      return false;
    });

const setUserInEconomyUsages = async (userId: BigString): Promise<void> => {
  await RedisClient.sadd('economy_usages', `${userId}`).catch(debugError);
};

const removeUserFromEconomyUsages = async (userId: BigString): Promise<void> => {
  await RedisClient.srem('economy_usages', `${userId}`).catch(debugError);
};

export default { isUserInEconomyUsage, setUserInEconomyUsages, removeUserFromEconomyUsages };
