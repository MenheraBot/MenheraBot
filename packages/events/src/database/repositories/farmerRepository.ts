import { BigString } from 'discordeno/types';

import { farmerModel } from '../collections';
import { DatabaseFarmerSchema, QuantitativePlant } from '../../types/database';
import { MainRedisClient } from '../databases';
import { debugError } from '../../utils/debugError';
import { AvailablePlants, Plantation, PlantedField } from '../../modules/fazendinha/types';

const parseMongoUserToRedisUser = (user: DatabaseFarmerSchema): DatabaseFarmerSchema => ({
  id: `${user.id}`,
  plantations: user.plantations,
  biggestSeed: user.biggestSeed,
  plantedFields: user.plantedFields,
  seeds: user.seeds,
  silo: user.silo,
});

const getFarmer = async (userId: BigString): Promise<DatabaseFarmerSchema> => {
  const fromRedis = await MainRedisClient.get(`farmer:${userId}`).catch(debugError);

  if (fromRedis) return JSON.parse(fromRedis);

  const fromMongo = await farmerModel.findOne({ id: userId }).catch(debugError);

  if (!fromMongo) {
    const newUser = await farmerModel.create({ id: userId });

    await MainRedisClient.setex(
      `farmer:${userId}`,
      3600,
      JSON.stringify(parseMongoUserToRedisUser(newUser)),
    ).catch(debugError);

    return newUser;
  }

  await MainRedisClient.setex(
    `farmer:${userId}`,
    3600,
    JSON.stringify(parseMongoUserToRedisUser(fromMongo)),
  ).catch(debugError);

  return fromMongo;
};

const executeHarvest = async (
  farmerId: BigString,
  fieldIndex: number,
  field: Plantation,
  plant: AvailablePlants,
  alreadyInSilo: boolean,
  success: boolean,
  plantedFields: number,
  biggestSeed: number,
): Promise<void> => {
  const pushOrIncrement = {
    [alreadyInSilo ? '$inc' : '$push']: alreadyInSilo
      ? {
          [`silo.$[elem].amount`]: 1,
        }
      : {
          silo: {
            plant,
            amount: 1,
          },
        },
  };

  const updatedUser = await farmerModel.findOneAndUpdate(
    { id: `${farmerId}` },
    {
      $set: { [`plantations.${fieldIndex}`]: field, plantedFields, biggestSeed },
      ...(success ? pushOrIncrement : {}),
    },
    {
      arrayFilters: alreadyInSilo ? [{ 'elem.plant': plant }] : [],
      new: true,
    },
  );

  if (updatedUser)
    await MainRedisClient.setex(
      `farmer:${farmerId}`,
      3600,
      JSON.stringify(parseMongoUserToRedisUser(updatedUser)),
    ).catch(debugError);
};

const updateSeeds = async (farmerId: BigString, seeds: QuantitativePlant[]): Promise<void> => {
  await farmerModel.updateOne(
    { id: `${farmerId}` },
    {
      $set: { seeds },
    },
  );

  const fromRedis = await MainRedisClient.get(`farmer:${farmerId}`);

  if (fromRedis) {
    const data = JSON.parse(fromRedis);

    await MainRedisClient.setex(
      `farmer:${farmerId}`,
      3600,
      JSON.stringify(parseMongoUserToRedisUser({ ...data, seeds })),
    ).catch(debugError);
  }
};

const executePlant = async (
  farmerId: BigString,
  fieldIndex: number,
  field: PlantedField,
  seed: AvailablePlants,
): Promise<void> => {
  const updatedUser = await farmerModel.findOneAndUpdate(
    { id: `${farmerId}` },
    {
      $set: { [`plantations.${fieldIndex}`]: field },
      $inc: {
        [`seeds.$[elem].amount`]: seed === AvailablePlants.Mate ? 0 : -1,
      },
    },
    {
      arrayFilters: [{ 'elem.plant': seed }],
      new: true,
    },
  );

  if (updatedUser)
    await MainRedisClient.setex(
      `farmer:${farmerId}`,
      3600,
      JSON.stringify(parseMongoUserToRedisUser(updatedUser)),
    ).catch(debugError);
};

const updateSilo = async (
  farmerId: BigString,
  silo: DatabaseFarmerSchema['silo'],
): Promise<void> => {
  await farmerModel.updateOne(
    { id: `${farmerId}` },
    {
      $set: { silo },
    },
  );

  const fromRedis = await MainRedisClient.get(`farmer:${farmerId}`);

  if (fromRedis) {
    const data = JSON.parse(fromRedis);

    await MainRedisClient.setex(
      `farmer:${farmerId}`,
      3600,
      JSON.stringify(parseMongoUserToRedisUser({ ...data, silo })),
    ).catch(debugError);
  }
};

export default {
  getFarmer,
  executePlant,
  updateSilo,
  updateSeeds,
  executeHarvest,
};
