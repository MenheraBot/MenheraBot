import { BigString } from 'discordeno/types';
import { MainRedisClient } from '../databases';

const isUserInMatch = (userId: BigString): Promise<boolean> =>
  MainRedisClient.sismember('poker_match', `${userId}`).then((r) => r === 1);

export default { isUserInMatch };
