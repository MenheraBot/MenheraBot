import WebSocket from 'ws';

export default class PicassoWebSocket {
  public isAlive = false;

  private pingTimeout: ReturnType<typeof setTimeout> | undefined;

  private ws: WebSocket | null = null;

  async connect(): Promise<void> {
    try {
      this.ws = new WebSocket(`${process.env.PICASSO_WEBSOCKET}`);
      this.prepareListeners();
    } catch (err) {
      if (err instanceof Error) console.log(`[WEBSOCKET] Error when connecting: ${err.message}`);
    }
  }

  private heartbeat(): void {
    if (typeof this.pingTimeout === 'undefined') return;
    clearTimeout(this.pingTimeout);

    this.isAlive = true;
    this.ws?.pong(16);

    this.pingTimeout = setTimeout(() => {
      this.ws?.terminate();
    }, 15000);
  }

  private onClose(): void {
    if (!this.ws) return;

    this.ws.terminate();
    if (this.pingTimeout) clearTimeout(this.pingTimeout);

    setTimeout(() => {
      if (!this.ws) return;
      this.ws.removeAllListeners();
      this.connect();
    }, 5000);
  }

  private prepareListeners(): void {
    if (!this.ws) return;

    this.ws.once('open', this.heartbeat).once('close', this.onClose).on('ping', this.heartbeat);

    //   this.ws.on('message', (msg: Buffer) => this.handleData(JSON.parse(msg.toString())));
  }

  // NEED TO IMPLEMENT

  // handleData(data: unknown) {}
}
