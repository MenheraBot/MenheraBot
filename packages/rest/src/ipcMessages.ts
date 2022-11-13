/* eslint-disable no-console */
import { Connection } from 'net-ipc';
import { ConnectionInfo, IdentifyMessage } from './types';

const handleIdentify = (
  connections: ConnectionInfo[],
  info: IdentifyMessage,
  connection: Connection,
): void => {
  const isReconnect = connections.find((a) => a.id === info.id && a.package === info.package);

  if (isReconnect) {
    isReconnect.internalId = connection.id;
    isReconnect.connectedAt = Date.now();
    isReconnect.disconnectedAt = -1;
    isReconnect.connected = true;
  } else
    connections.push({
      id: info.id,
      connected: true,
      connectedAt: Date.now(),
      disconnectedAt: -1,
      internalId: connection.id,
      package: info.package,
    });

  console.log(`[IPC] New connection identified! ${info.package} - ${info.id}`);
};

export { handleIdentify };
