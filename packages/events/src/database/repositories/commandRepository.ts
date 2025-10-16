import { BigString } from 'discordeno/types';
import { MainRedisClient } from '../databases.js';
import { DatabaseCommandSchema } from '../../types/database.js';
import { commandsModel } from '../collections.js';
import { debugError } from '../../utils/debugError.js';
import { registerCacheStatus } from '../../structures/initializePrometheus.js';
import { AvailableLanguages } from '../../types/i18next.js';

const getCommandInfoById = async (commandId: BigString): Promise<DatabaseCommandSchema | null> => {
  const fromRedis = await MainRedisClient.get(`command:${commandId}`);

  registerCacheStatus(fromRedis, 'command');

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

  registerCacheStatus(fromRedis, 'command');

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
  maintenance: DatabaseCommandSchema['maintenance'],
): Promise<void> => {
  MainRedisClient.del(`command:${commandName}`).catch(debugError);

  await commandsModel
    .updateOne(
      { _id: commandName },
      {
        $set: { maintenance },
      },
    )
    .catch(debugError);
};

interface OriginalInteraction {
  originalInteractionId: string;
  originalInteractionToken: string;
  locale: AvailableLanguages;
  fullCommandUsed: string;
  commandName: string;
}

const setOriginalInteraction = (
  interactionId: BigString,
  originalInteraction: OriginalInteraction,
): void => {
  MainRedisClient.setex(
    `original_interaction:${interactionId}`,
    900,
    JSON.stringify(originalInteraction),
  );
};

const getOriginalInteraction = async (
  interactionId: BigString,
): Promise<null | OriginalInteraction> => {
  const original = await MainRedisClient.get(`original_interaction:${interactionId}`);

  if (!original) return null;

  return JSON.parse(original);
};

const deleteOriginalInteraction = (interactionId: BigString): void => {
  MainRedisClient.del(`original_interaction:${interactionId}`);
};

const getInteractionExpiration = async (interactionId: BigString): Promise<number> =>
  MainRedisClient.ttl(`original_interaction:${interactionId}`);

export default {
  getCommandInfoById,
  getCommandInfo,
  getOriginalInteraction,
  getInteractionExpiration,
  deleteOriginalInteraction,
  setOriginalInteraction,
  setMaintenanceInfo,
  ensureCommandInfo,
  bulkUpdateCommandsIds,
  getAllCommandsInMaintenance,
};
