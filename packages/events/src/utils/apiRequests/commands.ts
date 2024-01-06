import { bot } from '../..';
import {
  ApiCommandInformation,
  MaintenanceCommandData,
  UsedCommandData,
} from '../../types/commands';
import { debugError } from '../debugError';
import { logger } from '../logger';
import { dataRequest, statusRequest } from './apiRequests';

const MAX_BATCH_QUEUE_LENGTH = 10;
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
  if (bot.shuttingDown) {
    await dataRequest.post(`/usages/commands?command=${info.commandName}`, info).catch(debugError);
    return;
  }

  batchCommandsExecution.push(info);

  if (batchCommandsExecution.length >= MAX_BATCH_QUEUE_LENGTH) {
    const toPostCommands = batchCommandsExecution.splice(0, MAX_BATCH_QUEUE_LENGTH);

    await dataRequest.post(
      `/usages/commands?command=${toPostCommands
        .map((a) => a.commandName.split(' ').join('_'))
        .join('-')}`,
      toPostCommands,
    );
  }
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
  updateCommandMaintenanteStatus,
  postCommandsInformation,
  forceBatchCommandsExecutionPost,
};
