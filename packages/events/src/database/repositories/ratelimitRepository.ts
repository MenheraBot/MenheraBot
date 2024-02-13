import { BigString } from 'discordeno/types';
import { MainRedisClient } from '../databases';
import { getElapsedTime, numberizeAllValues } from '../../utils/miscUtils';

enum RateLimitType {
  NONE,
  FIRST,
  SECOND,
  THIRD,
  FOURTH,
}

const secondsToBlock = [0, 15, 60, 600, 86400];
const limitLevels = ['NOT_BLOCKED', 'SOFT', 'HARD', 'EXTREME', 'BOT_DETECTED'];
const initialWindowSeconds = 3;
const ratelimitThresholds = [3, 4, 7, 20, 50];

type RatelimitInfo<Stringed = false> = {
  count: Stringed extends true ? string : number;
  timestamp: Stringed extends true ? string : number;
  ratelimit: Stringed extends true ? string : RateLimitType;
};

const executeRatelimit = async (
  userId: BigString,
  commandName: string,
): Promise<[true, RatelimitInfo] | [false, RatelimitInfo | undefined]> => {
  const rawRateInfo = (await MainRedisClient.hgetall(
    `ratelimit:${commandName}:${userId}`,
  )) as RatelimitInfo<true>;

  if (
    !('ratelimit' in rawRateInfo) ||
    (rawRateInfo.ratelimit !== `${RateLimitType.NONE}` &&
      getElapsedTime(Number(rawRateInfo.timestamp), 'seconds') >
        secondsToBlock[rawRateInfo.ratelimit as '1'])
  ) {
    const pipeline = MainRedisClient.multi();

    pipeline.hset(`ratelimit:${commandName}:${userId}`, {
      count: 1,
      ratelimit: RateLimitType.NONE,
      timestamp: Date.now(),
    } satisfies RatelimitInfo);

    pipeline.expire(`ratelimit:${commandName}:${userId}`, initialWindowSeconds);
    await pipeline.exec();
    return [false, undefined];
  }

  const rateInfo = numberizeAllValues(rawRateInfo);

  let newCount = rateInfo.count + 1;
  let newType = rateInfo.ratelimit;

  if (newCount > ratelimitThresholds[newType]) {
    newType = newType === RateLimitType.FOURTH ? RateLimitType.FOURTH : newType + 1;
    newCount = 1;
  }

  const pipeline = MainRedisClient.multi();

  pipeline.hset(`ratelimit:${commandName}:${userId}`, {
    count: newCount,
    ratelimit: newType,
    timestamp: Date.now(),
  } satisfies RatelimitInfo);

  pipeline.expire(
    `ratelimit:${commandName}:${userId}`,
    secondsToBlock[newType] || initialWindowSeconds,
  );

  await pipeline.exec();

  return [
    newType !== RateLimitType.NONE,
    { count: newCount, ratelimit: newType, timestamp: Date.now() },
  ];
};

export default { executeRatelimit, secondsToBlock, limitLevels };
