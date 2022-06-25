import { IVangoghReturnData, VangoghRequestData } from '@custom_types/Menhera';
import WebSocket from 'ws';

export default class VangoghWebSocket {
  public isAlive = false;

  private pingTimeout?: NodeJS.Timeout;

  private ws: WebSocket | null = null;

  private retries = 0;

  private ruuningError = false;

  constructor(private clusterId: number) {}

  async connect(): Promise<void> {
    try {
      console.log(`[WEBSOCKET] Client ${this.clusterId} is trying to connect`);
      this.ws = new WebSocket(
        `${process.env.VANGOGH_WEBSOCKET}?id=${this.clusterId}&auth=${process.env.VANGOGH_TOKEN}`,
        { skipUTF8Validation: true },
      );
      this.prepareListeners();
    } catch (err) {
      if (err instanceof Error) console.log(`[WEBSOCKET] Error when connecting: ${err.message}`);
      this.ws = null;
      this.isAlive = false;
    }
  }

  private onError(err: Error): void {
    this.ruuningError = true;
    this.isAlive = false;
    if (this.retries >= 2) {
      console.log(`[WEBSOCKET] Client ${this.clusterId} stopped... it won't reconnect anymore`);
      if (this.ws) this.ws.removeAllListeners();
      return;
    }

    console.log(`[WEBSOCKET] Error: ${err.message}`);
    if (this.pingTimeout) clearTimeout(this.pingTimeout);

    setTimeout(
      (Manager) => {
        Manager.retries += 1;
        Manager.connect();
      },
      8000,
      this,
    );
  }

  private heartbeat(): void {
    this.ruuningError = false;
    if (typeof this.pingTimeout !== 'undefined') clearTimeout(this.pingTimeout);

    this.isAlive = true;

    this.pingTimeout = setTimeout(
      (manager) => {
        if (manager && manager.readyState === manager.OPEN) manager.terminate();
      },
      20000,
      this.ws,
    );
  }

  private onClose(code: number, reason: Buffer): void {
    this.isAlive = false;
    console.log(
      `[WEBSOCKET] Client ${this.clusterId} closed with code ${code}. ${
        reason.length > 0 ? `Reason: ${reason.toString()}` : ''
      }`,
    );
    if (this.ruuningError) return;
    if (this.ws) this.ws.terminate();
    if (this.pingTimeout) clearTimeout(this.pingTimeout);

    setTimeout(
      (Manager) => {
        Manager.connect();
      },
      5000,
      this,
    );
  }

  public killConnection(): void {
    if (!this.ws) return;
    this.ws.removeAllListeners();
    this.ws.close(1001, 'Asked Internally');
  }

  private prepareListeners(): void {
    if (!this.ws) return;

    this.ws
      .on('open', () => {
        console.log(`[WEBSOCKET] Client ${this.clusterId} Connected Successfully`);
        this.retries = 0;
        this.isAlive = true;
        this.heartbeat();
      })
      .on('close', this.onClose.bind(this))
      .on('error', this.onError.bind(this))
      .on('ping', this.heartbeat.bind(this));
  }

  public async makeRequest(toSend: VangoghRequestData): Promise<IVangoghReturnData> {
    if (!this.isAlive) return { err: true };
    if (!this.ws) return { err: true };

    this.ws.send(JSON.stringify(toSend));

    return new Promise((res) => {
      if (!this.ws) {
        res({ err: true });
        return;
      }
      const timeout = setTimeout(() => {
        res({ err: true });
      }, 5000);

      const resolveError = () => {
        clearTimeout(timeout);
        this.ws?.removeListener('message', handler);
        return res({ err: true });
      };

      const resolveSuccess = (receivedData: IVangoghReturnData) => {
        clearTimeout(timeout);
        this.ws?.removeListener('message', handler);
        return res(receivedData);
      };

      const handler = (msg: Buffer) => {
        const parsedData = JSON.parse(msg.toString());

        if (!parsedData?.id) return;
        if (parsedData.id !== toSend.id) return;
        if (!parsedData?.res) return resolveError();

        return resolveSuccess({ data: Buffer.from(parsedData.res, 'base64') });
      };

      this.ws.on('message', handler);
    });
  }
}
