/* eslint-disable no-use-before-define */
import cors from '@koa/cors';
import Koa, { Middleware } from 'koa';
import koaBody from 'koa-body';
import Router from 'koa-router';

export default class HttpServer {
  private koaApplication: Koa;

  private static instance?: HttpServer;

  private registeredRoutes: string[] = [];

  private constructor() {
    this.koaApplication = new Koa();
    this.registerDefaultMiddleware();
    this.koaApplication.listen({ port: process.env.HTTP_SERVER_PORT }, () =>
      console.log(`[HTTP] Server started at port ${process.env.HTTP_SERVER_PORT}`),
    );
  }

  private registerDefaultMiddleware(): void {
    this.koaApplication.use(koaBody({ includeUnparsed: true })).use(cors());
  }

  public registerMiddleware(middleware: Middleware): void {
    this.koaApplication.use(middleware);
  }

  public registerRouter(routerName: string, router: Router): void {
    if (this.registeredRoutes.includes(routerName)) return;
    this.koaApplication.use(router.routes());
    this.registeredRoutes.push(routerName);
  }

  static getInstance(): HttpServer {
    this.instance ??= new HttpServer();
    return this.instance;
  }
}
