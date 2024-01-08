import { BigString } from 'discordeno/types';
import { DatabaseCharacterSchema } from '../../types/database';
import { MainRedisClient } from '../databases';
import { characterModel } from '../collections';
import { PlayerVsEnviroment } from '../../modules/roleplay/types';
import { debugError } from '../../utils/debugError';

const parseMongoUserToRedisUser = (user: DatabaseCharacterSchema): DatabaseCharacterSchema => ({
  id: `${user.id}`,
  life: user.life,
  energy: user.energy,
  deadUntil: user.deadUntil,
});

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

const getAdventure = async (adventureId: string): Promise<PlayerVsEnviroment | null> => {
  const fromRedis = await MainRedisClient.get(`adventure:${adventureId}`);

  if (!fromRedis) return null;

  return JSON.parse(fromRedis);
};

const setAdventure = async (adventureId: string, adventure: PlayerVsEnviroment): Promise<void> => {
  await MainRedisClient.setex(`adventure:${adventureId}`, 900, JSON.stringify(adventure));
};

const deleteAdventure = async (adventureId: string): Promise<void> => {
  await MainRedisClient.del(`adventure:${adventureId}`);
};

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

export default {
  getCharacter,
  updateCharacter,
  getAdventure,
  setAdventure,
  isUserInBattle,
  removeUserInBattle,
  deleteAdventure,
  setUserInBattle,
};
