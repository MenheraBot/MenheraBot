import { BigString } from 'discordeno/types';
import { DatabaseCharacterSchema } from '../../types/database';
import { MainRedisClient } from '../databases';
import { characterModel } from '../collections';
import { debugError } from '../../utils/debugError';
import { Enemy } from '../../modules/roleplay/types';
import { Enemies } from '../../modules/roleplay/data/enemies';

const parseMongoUserToRedisUser = (user: DatabaseCharacterSchema): DatabaseCharacterSchema => ({
  id: `${user.id}`,
  life: user.life,
  energy: user.energy,
  deadUntil: user.deadUntil,
  inventory: user.inventory,
  abilities: user.abilities,
});

const getCharacter = async (userId: BigString): Promise<DatabaseCharacterSchema> => {
  const fromRedis = await MainRedisClient.get(`character:${userId}`);

  if (fromRedis) return JSON.parse(fromRedis);

  const fromMongo = await characterModel.findOne({ id: `${userId}` });

  if (fromMongo) {
    await MainRedisClient.setex(
      `character:${userId}`,
      3600,
      JSON.stringify(parseMongoUserToRedisUser(fromMongo)),
    );

    return parseMongoUserToRedisUser(fromMongo);
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

const getEnemiesInArea = async (area: [number, number]): Promise<Enemy[]> => {
  const enemiesInArea = await MainRedisClient.hget('world_enemies', `${area[0]}:${area[1]}`);

  // TODO: Return different enemies based on geolocation, and percentage of population of each enemy class
  if (enemiesInArea)
    return Array.from({ length: Number(enemiesInArea) }, () => ({ ...Enemies[1], id: 1 }));

  return [];
};

export default {
  getCharacter,
  getEnemiesInArea,
  updateCharacter,
};
