import { BigString } from 'discordeno/types';
import { MainRedisClient } from '../databases';
import { DatabaseCommandSchema } from '../../types/database';
import { commandsModel } from '../collections';
import { debugError } from '../../utils/debugError';

const getCommandInfoById = async (commandId: BigString): Promise<DatabaseCommandSchema | null> => {
  const fromRedis = await MainRedisClient.get(`command:${commandId}`);

  if (fromRedis) return getCommandInfo(fromRedis);

  const fromMongo = await commandsModel
    .findOne({ discordId: `${commandId}` }, null, { lean: true })
    .catch(debugError);

  if (!fromMongo) return null;

  await MainRedisClient.set(`command:${commandId}`, fromMongo._id);

  return fromMongo;
};

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
      _id: fromMongo._id,
    }),
  ).catch(debugError);

  await MainRedisClient.set(`command:${fromMongo.discordId}`, commandName);

  return fromMongo;
};

const bulkUpdateCommandsIds = async (
  commands: { commandName: string; commandId: string }[],
): Promise<void> => {
  const bulkUpdate = commandsModel.collection.initializeUnorderedBulkOp();

  commands.forEach(async (command) => {
    bulkUpdate
      .find({ _id: command.commandName })
      .updateOne({ $set: { discordId: command.commandId } });

    const oldCommandInfo = await getCommandInfo(command.commandName);

    MainRedisClient.del(`command:${command.commandName}`);
    if (oldCommandInfo) MainRedisClient.del(`command:${oldCommandInfo.discordId}`);
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
  getCommandInfoById,
  getCommandInfo,
  setMaintenanceInfo,
  ensureCommandInfo,
  bulkUpdateCommandsIds,
  getAllCommandsInMaintenance,
};
