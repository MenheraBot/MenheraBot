import { IPicassoWebsocketRequest } from '@utils/Types';
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
    }
  }

  private onError(err: Error): void {
    this.ruuningError = true;
    this.isAlive = false;
    if (this.retries >= 5) {
      console.log(`[WEBSOCKET] Client ${this.shardId} stopped trying to reconnect`);
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
      15000,
      this.ws,
    );
  }

  private onClose(): void {
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
        console.log('[WEBSOCKET] Connected Successfully');
        this.heartbeat();
      })
      .on('close', () => this.onClose())
      .on('error', (err) => this.onError(err))
      .on('ping', (data) => this.heartbeat(data));

    //   this.ws.on('message', (msg: Buffer) => this.handleData(JSON.parse(msg.toString())));
  }

  public async makeRequest<T>(
    data: IPicassoWebsocketRequest,
  ): Promise<T & { err: boolean; data: Buffer }> {
    return this.isAlive;
  }
}
