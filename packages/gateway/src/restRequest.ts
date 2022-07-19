import { IpcRequest } from '@menhera-bot/rest/src/types';
import { Client as IpcClient } from 'net-ipc';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default async (client: IpcClient, request: IpcRequest): Promise<any> => {
  const response = await client.request(request);
  return response;
};
