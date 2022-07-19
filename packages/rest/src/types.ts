export interface IpcRequest {
  Authorization: string;
  url: string;
  body: unknown;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
}
