import { RedisClient } from '../databases';
import { DatabaseCommandMaintenanceSchema } from '../../types/database';
import { commandsModel } from '../collections';

const getMaintenanceInfo = async (
  commandName: string,
): Promise<DatabaseCommandMaintenanceSchema | null> => {
  const fromRedis = await RedisClient.get(`command:${commandName}`);

  if (fromRedis) return JSON.parse(fromRedis);

  const fromMongo = await commandsModel.findById(commandName, null, { lean: true });

  if (!fromMongo) return null;

  await RedisClient.set(
    `command:${commandName}`,
    JSON.stringify({
      maintenance: fromMongo.maintenance,
      maintenanceReason: fromMongo.maintenanceReason,
    }),
  );

  return fromMongo;
};

export default { getMaintenanceInfo };
