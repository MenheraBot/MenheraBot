import {
  ApiCommandInformation,
  MaintenanceCommandData,
  UsedCommandData,
} from '../../types/commands';
import { debugError } from '../debugError';
import { dataRequest, statusRequest } from './apiRequests';

const postCommandExecution = async (info: UsedCommandData): Promise<void> => {
  await dataRequest.post('/usages/commands', info).catch(debugError);
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

const postShardStatuses = async (shards: unknown[]): Promise<void> => {
  await statusRequest.put('/shards', { data: shards }).catch(debugError);
};

export {
  postCommandExecution,
  updateCommandMaintenanteStatus,
  postCommandsInformation,
  postShardStatuses,
};
