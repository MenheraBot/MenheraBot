import { Connection } from 'net-ipc';
import { ConnectionInfo } from './types.js';

const handleIdentify = (connections: ConnectionInfo[], connection: Connection): void => {
  const isReconnect = connections.find((a) => a.internalId === connection.id);

  if (isReconnect) {
    console.log(
      `[IPC] Connection with client ${connection.id} restored! ${
        Date.now() - isReconnect.disconnectedAt
      }ms downtime`,
    );

    isReconnect.internalId = connection.id;
    isReconnect.connectedAt = Date.now();
    isReconnect.disconnectedAt = -1;
    isReconnect.connected = true;
    return;
  }

  connections.push({
    connected: true,
    connectedAt: Date.now(),
    disconnectedAt: -1,
    internalId: connection.id,
  });

  console.log(`[IPC] New connection identified! ${connection.id}`);
};

export { handleIdentify };
