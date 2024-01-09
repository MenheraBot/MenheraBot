import { BigString } from 'discordeno/types';
import { MainRedisClient } from '../databases';
import { debugError } from '../../utils/debugError';
import { BattleTimer } from '../../modules/roleplay/types';

const isUserInBattle = (userId: BigString): Promise<boolean> =>
  MainRedisClient.sismember('battle_users', `${userId}`)
    .then((result) => result !== 0)
    .catch((e) => {
      debugError(e);
      return false;
    });

const removeUserInBattle = async (userId: BigString): Promise<void> => {
  await MainRedisClient.srem('battle_users', `${userId}`);
};

const setUserInBattle = async (userId: BigString): Promise<void> => {
  await MainRedisClient.sadd('battle_users', `${userId}`);
};

const registerTimer = async (timerId: string, executeAction: BattleTimer): Promise<void> => {
  await MainRedisClient.set(`battle_timer:${timerId}`, JSON.stringify(executeAction));
};

const getTimer = async (timerId: string): Promise<BattleTimer> => {
  const timer = (await MainRedisClient.get(`battle_timer:${timerId}`)) as string;

  return JSON.parse(timer);
};

const deleteTimer = async (timerId: string): Promise<void> => {
  await MainRedisClient.del(`battle_timer:${timerId}`);
};

const getTimerKeys = async (): Promise<string[]> => {
  return MainRedisClient.keys('battle_timer:*');
};

export default {
  isUserInBattle,
  removeUserInBattle,
  setUserInBattle,
  registerTimer,
  getTimer,
  deleteTimer,
  getTimerKeys,
};
