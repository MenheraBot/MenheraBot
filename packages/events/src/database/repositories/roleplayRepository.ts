/* eslint-disable no-continue */
import { BigString } from 'discordeno/types';
import { DatabaseCharacterSchema } from '../../types/database';
import { MainRedisClient } from '../databases';
import { characterModel } from '../collections';
import { debugError } from '../../utils/debugError';
import { Location } from '../../modules/roleplay/types';
import { Enemies, Enemy } from '../../modules/roleplay/data/enemies';
import { minutesToMillis } from '../../utils/miscUtils';
import { MINUTES_TO_RESURGE, RESURGE_DEFAULT_AMOUNT } from '../../modules/roleplay/constants';
import { manipulateCharacterStatus } from '../../modules/roleplay/statusManipulation';

const parseMongoUserToRedisUser = (user: DatabaseCharacterSchema): DatabaseCharacterSchema => ({
  id: `${user.id}`,
  life: user.life,
  energy: user.energy,
  inventory: user.inventory,
  abilities: user.abilities,
  location: user.location,
  currentAction: user.currentAction,
  money: user.money,
});

const getCharacter = async (userId: BigString): Promise<DatabaseCharacterSchema> => {
  const fromRedis = await MainRedisClient.get(`character:${userId}`);

  if (fromRedis) {
    const char = JSON.parse(fromRedis);

    return manipulateCharacterStatus(char);
  }

  const fromMongo = await characterModel.findOne({ id: `${userId}` });

  if (fromMongo) {
    const char = parseMongoUserToRedisUser(fromMongo);

    await MainRedisClient.setex(`character:${userId}`, 3600, JSON.stringify(char));

    return manipulateCharacterStatus(char);
  }

  const created = await characterModel.create({
    id: `${userId}`,
  });

  if (!created)
    throw new Error(
      `${new Date().toISOString()} - There is no created userId result for userId id ${userId}`,
    );

  await MainRedisClient.setex(
    `character:${userId}`,
    3600,
    JSON.stringify(parseMongoUserToRedisUser(created)),
  );

  return parseMongoUserToRedisUser(created);
};

const updateCharacter = async (
  userId: BigString,
  query: Partial<DatabaseCharacterSchema>,
): Promise<void> => {
  MainRedisClient.del(`character:${userId}`);

  await characterModel.updateOne({ id: `${userId}` }, query).catch(debugError);
};

const getEnemiesInArea = async (area: Location): Promise<Enemy[]> => {
  const areaName = `${area[0]}:${area[1]}`;
  const [enemiesInArea, resurgeDate] = await MainRedisClient.hmget(
    'world_enemies',
    areaName,
    `r:${areaName}`,
  );

  if (enemiesInArea === null)
    await updateEnemyAreas({ [areaName]: RESURGE_DEFAULT_AMOUNT, [`r:${areaName}`]: 0 });

  const totalEnemies = enemiesInArea === null ? RESURGE_DEFAULT_AMOUNT : Number(enemiesInArea);

  if (totalEnemies)
    return Array.from({ length: Number(totalEnemies) }, () => ({
      ...Enemies[1],
      id: 1,
    })) as Enemy[];

  if (resurgeDate === null || Date.now() >= Number(resurgeDate)) {
    await updateEnemyAreas({ [areaName]: RESURGE_DEFAULT_AMOUNT, [`r:${areaName}`]: 0 });
    return Array.from({ length: Number(RESURGE_DEFAULT_AMOUNT) }, () => ({
      ...Enemies[1],
      id: 1,
    })) as Enemy[];
  }

  return [];
};

const updateEnemyAreas = async (areas: Record<string, number>): Promise<void> => {
  await MainRedisClient.hset('world_enemies', areas);
};

const decreaseEnemyFromArea = async (area: Location): Promise<void> => {
  const areaName = `${area[0]}:${area[1]}`;
  const total = await MainRedisClient.hincrby('world_enemies', areaName, -1);

  if (total <= 0)
    await updateEnemyAreas({
      [`r:${areaName}`]: Date.now() + minutesToMillis(MINUTES_TO_RESURGE),
      [areaName]: 0,
    });
};

const getAllEnemyAreas = async (): Promise<Record<string, number>> => {
  const data = await MainRedisClient.hgetall('world_enemies');

  return Object.entries(data).reduce((p, [location, enemies]) => {
    p[location] = Number(enemies);
    return p;
  }, {} as Record<string, number>);
};

export default {
  getCharacter,
  getAllEnemyAreas,
  updateEnemyAreas,
  decreaseEnemyFromArea,
  getEnemiesInArea,
  updateCharacter,
};
