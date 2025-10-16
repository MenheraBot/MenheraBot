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

export interface ConnectionInfo {
  internalId: string;
  connected: boolean;
  connectedAt: number;
  disconnectedAt: number;
}

export interface IdentifyMessage {
  type: 'IDENTIFY';
}

export interface RunMethodMessage {
  type: 'RUN_METHOD';
  data: RunMethod;
}

export interface SendRequestMessage {
  type: 'SEND_REQUEST';
  data: SendRequest;
}

export type RequestTypes = RunMethodMessage | SendRequestMessage;
