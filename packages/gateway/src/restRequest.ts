import { IpcRequest } from '@menhera-bot/rest/src/types';
import { Client as IpcClient } from 'net-ipc';

export default async (request: IpcRequest, client: IpcClient): Promise<any> => {
  const response = await client.request(request);
  return response;
};
