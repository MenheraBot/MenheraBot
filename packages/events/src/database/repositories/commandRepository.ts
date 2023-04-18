import { MainRedisClient } from '../databases';
import { DatabaseCommandSchema } from '../../types/database';
import { commandsModel } from '../collections';
import { debugError } from '../../utils/debugError';

const getCommandInfo = async (commandName: string): Promise<DatabaseCommandSchema | null> => {
  const fromRedis = await MainRedisClient.get(`command:${commandName}`).catch(debugError);

  if (fromRedis) return JSON.parse(fromRedis);

  const fromMongo = await commandsModel
    .findById(commandName, null, { lean: true })
    .catch(debugError);

  if (!fromMongo) return null;

  await MainRedisClient.set(
    `command:${commandName}`,
    JSON.stringify({
      discordId: fromMongo.discordId,
      maintenance: fromMongo.maintenance,
      maintenanceReason: fromMongo.maintenanceReason,
    }),
  ).catch(debugError);

  return fromMongo;
};

const bulkUpdateCommandsIds = async (
  commands: { commandName: string; commandId: string }[],
): Promise<void> => {
  const bulkUpdate = commandsModel.collection.initializeUnorderedBulkOp();

  commands.forEach((command) => {
    bulkUpdate
      .find({ _id: command.commandName })
      .updateOne({ $set: { discordId: command.commandId } });
    MainRedisClient.del(`command:${command.commandName}`);
  });

  await bulkUpdate.execute();
};

const ensureCommandInfo = async (commandName: string): Promise<void> => {
  const commandInfo = await getCommandInfo(commandName);

  if (commandInfo) return;

  await commandsModel.create({ _id: commandName }).catch(debugError);
};

const getAllCommandsInMaintenance = async (): Promise<DatabaseCommandSchema[]> => {
  return commandsModel.find({ maintentance: true }, null, { lean: true });
};

const setMaintenanceInfo = async (
  commandName: string,
  maintenance: boolean,
  reason?: string,
): Promise<void> => {
  await commandsModel
    .updateOne(
      { _id: commandName },
      {
        maintenance,
        maintenanceReason: reason ?? 'Sem Razão Informada',
      },
    )
    .catch(debugError);

  await MainRedisClient.del(`command:${commandName}`).catch(debugError);
};
export default {
  getCommandInfo,
  setMaintenanceInfo,
  ensureCommandInfo,
  bulkUpdateCommandsIds,
  getAllCommandsInMaintenance,
};
