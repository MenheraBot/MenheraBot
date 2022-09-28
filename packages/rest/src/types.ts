export interface IpcRequest {
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

export type ConnectionInfo = {
  package: string;
  id: string;
  internalId: string;
  connected: boolean;
  connectedAt: number;
  disconnectedAt: number;
};
