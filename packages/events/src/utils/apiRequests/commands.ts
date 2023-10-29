import {
  ApiCommandInformation,
  MaintenanceCommandData,
  UsedCommandData,
} from '../../types/commands';
import { debugError } from '../debugError';
import { dataRequest, statusRequest } from './apiRequests';

const postCommandExecution = async (info: UsedCommandData): Promise<void> => {
  await dataRequest.post(`/usages/commands?command=${info.commandName}`, info).catch(debugError);
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

const serachApiCommands = async (
  search: string,
): Promise<null | { name: string; id: string }[]> => {
  const result = await statusRequest
    .get('/commands/search', { params: { search } })
    .catch(() => null);

  if (!result) return null;

  return result.data;
};

export {
  postCommandExecution,
  updateCommandMaintenanteStatus,
  postCommandsInformation,
  serachApiCommands,
};
