import { bot } from '../../index.js';
import {
  ApiCommandInformation,
  MaintenanceCommandData,
  UsedCommandData,
} from '../../types/commands.js';
import { debugError } from '../debugError.js';
import { logger } from '../logger.js';
import { dataRequest, statusRequest } from './apiRequests.js';

// const MAX_BATCH_QUEUE_LENGTH = 10;
let batchCommandsExecution: UsedCommandData[] = [];

const forceBatchCommandsExecutionPost = async (): Promise<void> => {
  if (!bot.shuttingDown)
    return logger.info(
      '[FORCED BATCH COMMANDS POST] - I will not post the queue if I am not going to sleep',
    );

  if (batchCommandsExecution.length === 0) return;

  await dataRequest.post(
    `/usages/commands?command=${batchCommandsExecution
      .map((a) => a.commandName.split(' ').join('_'))
      .join('-')}`,
    batchCommandsExecution,
  );

  batchCommandsExecution = [];
};

const postCommandExecution = async (info: UsedCommandData): Promise<void> => {
  await dataRequest.post(`/usages/commands?command=${info.commandName}`, info).catch(debugError);
  /* batchCommandsExecution.push(info);


 */
};
const updateCommandMaintenanteStatus = async (
  commandName: string,
  maintenanceData: MaintenanceCommandData,
): Promise<void> => {
  await statusRequest
    .patch(`/commands/${commandName}`, {
      data: { disabled: maintenanceData },
    })
    .catch(debugError);
};

const postCommandsInformation = async (commands: ApiCommandInformation[]): Promise<void> => {
  await statusRequest.post('/commands', { data: { commands } }).catch(debugError);
};

export {
  postCommandExecution,
  forceBatchCommandsExecutionPost,
  postCommandsInformation,
  updateCommandMaintenanteStatus,
};
