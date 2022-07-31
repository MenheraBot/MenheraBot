import { RedisClient } from '../databases';
import { DatabaseCommandMaintenanceSchema } from '../../types/database';
import { commandsModel } from '../collections';
import { debugError } from '../../utils/debugError';

const getMaintenanceInfo = async (
  commandName: string,
): Promise<DatabaseCommandMaintenanceSchema | null> => {
  const fromRedis = await RedisClient.get(`command:${commandName}`).catch(debugError);

  if (fromRedis) return JSON.parse(fromRedis);

  const fromMongo = await commandsModel
    .findById(commandName, null, { lean: true })
    .catch(debugError);

  if (!fromMongo) return null;

  await RedisClient.set(
    `command:${commandName}`,
    JSON.stringify({
      maintenance: fromMongo.maintenance,
      maintenanceReason: fromMongo.maintenanceReason,
    }),
  ).catch(debugError);

  return fromMongo;
};

const ensureCommandMaintenanceInfo = async (commandName: string): Promise<void> => {
  const maintenanceInfo = await getMaintenanceInfo(commandName);

  if (maintenanceInfo) return;

  await commandsModel.create({ _id: commandName }).catch(debugError);
};

export default { getMaintenanceInfo, ensureCommandMaintenanceInfo };
