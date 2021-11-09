import { IPicassoReturnData, IPicassoWebsocketRequest } from '@utils/Types';
import WebSocket from 'ws';

export default class PicassoWebSocket {
  public isAlive = false;

  private pingTimeout: ReturnType<typeof setTimeout> | undefined;

  private ws: WebSocket | null = null;

  private retries = 0;

  private ruuningError = false;

  constructor(private shardId: number) {}

  async connect(): Promise<void> {
    try {
      this.ws = new WebSocket(`${process.env.PICASSO_WEBSOCKET}?id=${this.shardId}`);
      this.prepareListeners();
      console.log(`[WEBSOCKET] Client ${this.shardId} is trying to connect`);
    } catch (err) {
      if (err instanceof Error) console.log(`[WEBSOCKET] Error when connecting: ${err.message}`);
      this.ws = null;
      this.isAlive = false;
    }
  }

  private onError(err: Error): void {
    this.ruuningError = true;
    this.isAlive = false;
    if (this.retries >= 5) {
      console.log(`[WEBSOCKET] Client ${this.shardId} stopped... it won't reconnect anymore`);
      if (this.ws) this.ws.removeAllListeners();
      return;
    }

    console.log(`[WEBSOCKET] Error: ${err.message}`);
    if (this.pingTimeout) clearTimeout(this.pingTimeout);

    setTimeout(() => {
      this.retries += 1;
      this.connect();
    }, 15000);
  }

  private heartbeat(data?: Buffer): void {
    this.ruuningError = false;
    if (typeof this.pingTimeout !== 'undefined') clearTimeout(this.pingTimeout);

    this.isAlive = true;
    if (data) this.ws?.pong(data);

    this.pingTimeout = setTimeout(
      (manager) => {
        if (manager && manager.readyState === manager.OPEN) manager.terminate();
      },
      20000,
      this.ws,
    );
  }

  private onClose(): void {
    this.isAlive = false;
    console.log(`[WEBSOCKET] Client ${this.shardId} Has been Closed`);
    if (this.ruuningError) return;
    if (this.ws) this.ws.terminate();
    if (this.pingTimeout) clearTimeout(this.pingTimeout);

    setTimeout(() => {
      this.connect();
    }, 5000);
  }

  private prepareListeners(): void {
    if (!this.ws) return;

    this.ws
      .on('open', () => {
        console.log(`[WEBSOCKET] Client ${this.shardId} Connected Successfully`);
        this.retries = 0;
        this.heartbeat();
      })
      .on('close', () => this.onClose())
      .on('error', (err) => this.onError(err))
      .on('ping', (data) => this.heartbeat(data));
  }

  public async makeRequest<T>(toSend: IPicassoWebsocketRequest<T>): Promise<IPicassoReturnData> {
    if (!this.isAlive) return { err: true };
    if (!this.ws) return { err: true };

    this.ws.send(JSON.stringify(toSend));

    return new Promise((res) => {
      if (!this.ws) return res({ err: true });
      const timeout = setTimeout(() => {
        res({ err: true });
      }, 5000);

      const resolveError = () => {
        clearTimeout(timeout);
        this.ws?.removeListener('message', handler);
        return res({ err: true });
      };

      const resolveSuccess = (receivedData: IPicassoReturnData) => {
        clearTimeout(timeout);
        this.ws?.removeListener('message', handler);
        return res(receivedData);
      };

      const handler = (msg: Buffer) => {
        const parsedData = JSON.parse(msg.toString());

        if (!parsedData?.id) return;
        if (parsedData.id !== toSend.id) return;
        if (!parsedData?.res) return resolveError();

        return resolveSuccess({ data: Buffer.from(parsedData.res) });
      };

      this.ws.on('message', handler);
    });
  }
}
