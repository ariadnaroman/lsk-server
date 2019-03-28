import Koa from 'koa';
import Router from 'koa-router';
import bodyParser from "koa-bodyparser";

import { timingLogger, exceptionHandler, jwtConfig } from './utils';
import { router as songRouter } from './song';
import { router as authRouter } from './auth';
import jwt from 'koa-jwt';
import cors from '@koa/cors';

import http from 'http';
import SocketIo from 'socket.io';

const app = new Koa();

const server = http.createServer(app.callback());
global.io = SocketIo(server);



app.use(async(ctx, next) => {
  console.log(ctx.request);
  await next();
});
app.use(cors());
app.use(exceptionHandler);
app.use(timingLogger);
app.use(bodyParser());

const prefix = '/api';

// public
const publicApiRouter = new Router({ prefix });
publicApiRouter
  .use('/auth', authRouter.routes());
app
  .use(publicApiRouter.routes())
  .use(publicApiRouter.allowedMethods());

app.use(jwt(jwtConfig));

// protected
const protectedApiRouter = new Router({ prefix });
protectedApiRouter
  .use('/song', songRouter.routes());
app
  .use(protectedApiRouter.routes())
  .use(protectedApiRouter.allowedMethods());

if (!module.parent) {
  server.listen(3000);
  console.log('started on port 3000');
}
