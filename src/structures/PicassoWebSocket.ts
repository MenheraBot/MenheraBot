import WebSocket from 'ws';

export default class PicassoWebSocket {
  public isAlive = false;

  private ws: WebSocket | null = null;

  async connect(): Promise<void> {
    try {
      this.ws = new WebSocket(`${process.env.PICASSO_WEBSOCKET}`);
      this.prepareListeners();
    } catch (err) {
      if (err instanceof Error) console.log('[WEBSOCKET] Error when connecting: %s', err.message);
    }
  }

  private prepareListeners(): void {
    if (!this.ws) return;

    this.ws.once('open', () => {
      this.isAlive = true;
      console.log('abriu');
    });

    this.ws.once('close', () => {
      this.isAlive = false;
      console.log('a');
    });

    this.ws.on('ping', () => {
      this.isAlive = true;
    });

    //   this.ws.on('message', (msg: Buffer) => this.handleData(JSON.parse(msg.toString())));
  }

  // NEED TO IMPLEMENT

  // handleData(data: unknown) {}
}
