import { BigString } from 'discordeno/types';
import { DatabaseCharacterSchema } from '../../types/database';
import { MainRedisClient } from '../databases';
import { characterModel } from '../collections';

const parseMongoUserToRedisUser = (user: DatabaseCharacterSchema): DatabaseCharacterSchema => ({
  id: `${user.id}`,
  life: user.life,
  energy: user.energy,
});

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

export default { getCharacter };
