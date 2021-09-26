import MenheraClient from 'MenheraClient';
import Koa from 'koa';

export default class HttpServer {
  public koaApplication: Koa;

  constructor(private client: MenheraClient) {
    this.koaApplication = new Koa();
  }
}
