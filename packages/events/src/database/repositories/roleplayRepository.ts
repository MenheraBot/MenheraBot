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
});

const getAdventure = async (adventureId: string): Promise<PlayerVsEnviroment | null> => {
  const fromRedis = await MainRedisClient.get(`adventure:${adventureId}`);

  if (!fromRedis) return null;

  return JSON.parse(fromRedis);
};

const setAdventure = async (adventureId: string, adventure: PlayerVsEnviroment): Promise<void> => {
  await MainRedisClient.setex(`adventure:${adventureId}`, 900, JSON.stringify(adventure));
};

const getCharacter = async (playerId: BigString): Promise<DatabaseCharacterSchema> => {
  const fromRedis = await MainRedisClient.get(`character:${playerId}`);

  if (fromRedis) return JSON.parse(fromRedis);

  const fromMongo = await characterModel.findOne({ id: `${playerId}` });

  if (fromMongo) {
    await MainRedisClient.setex(
      `character:${playerId}`,
      3600,
      JSON.stringify(parseMongoUserToRedisUser(fromMongo)),
    );

    return parseMongoUserToRedisUser(fromMongo);
  }

  const created = await characterModel.create({
    id: `${playerId}`,
  });

  if (!created)
    throw new Error(
      `${new Date().toISOString()} - There is no created player result for player id ${playerId}`,
    );

  await MainRedisClient.setex(
    `character:${playerId}`,
    3600,
    JSON.stringify(parseMongoUserToRedisUser(created)),
  );

  return parseMongoUserToRedisUser(created);
};

const isUserInBattle = (userId: BigString): Promise<boolean> =>
  MainRedisClient.sismember('battle_users', `${userId}`)
    .then((result) => result !== 0)
    .catch((e) => {
      debugError(e);
      return false;
    });

export default { getCharacter, getAdventure, setAdventure, isUserInBattle };
