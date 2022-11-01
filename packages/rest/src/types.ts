export interface RunMethod {
  Authorization: string;
  url: string;
  body: unknown;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  options?: {
    retryCount?: number;
    bucketId?: string;
    headers?: Record<string, string>;
  };
}

export interface SendRequest {
  Authorization: string;
  url: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  bucketId?: string;
  retryCount?: number;
  payload?: {
    headers: Record<string, string>;
    body: unknown;
  };
}

export type ConnectionInfo = {
  package: string;
  id: string;
  internalId: string;
  connected: boolean;
  connectedAt: number;
  disconnectedAt: number;
};

export interface IdentifyMessage {
  type: 'IDENTIFY';
  id: string;
  package: string;
}

export interface PingMessage {
  type: 'PING';
  servicePackage: string;
  serviceId: string;
}

export interface RunMethodMessage {
  type: 'RUN_METHOD';
  data: RunMethod;
}

export interface SendRequestMessage {
  type: 'SEND_REQUEST';
  data: SendRequest;
}

export type MessageTypes = IdentifyMessage | PingMessage;
export type RequestTypes = RunMethodMessage | SendRequestMessage;
