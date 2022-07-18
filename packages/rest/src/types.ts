export interface IpcRequest {
  Authorization: string;
  url: string;
  body: any;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
}
