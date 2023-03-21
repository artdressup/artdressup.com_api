import {Context} from "koa";

const Koa = require('koa');
const Router = require('koa-router');
const bodyParser = require('koa-bodyparser');
const websockify = require('koa-websocket')
import * as dotenv from 'dotenv'
import ErrnoException = NodeJS.ErrnoException;
const cors = require('@koa/cors')

dotenv.config()

const httpServer = async () => {
  const app = new Koa(); // http
  const router = new Router();
  const apiV1 = require('./api/v1')

  router.use('/api/v1', apiV1.routes());
// app.use((ctx: Context) => {
//   ctx.body = 'hello, ';
// });

  app.use(cors()).use(bodyParser()).use(router.routes()).use(router.allowedMethods());

  app.listen(4000, () => {
    console.log('listening to port 4000')
  })
}

type wsMsg = {type: string, data: any}
const webSocketServer = async () => {
  const app = websockify(new Koa()); // websocket
  const ws = new Router();

  ws.get('/ws', (ctx: Context, next: any) => {
    ctx.websocket.send('Hello, user ' + ctx.websocket.id);
    console.log('socket address:', ctx.socket.address())

    // 유저가 메시지를 보냈을때
    ctx.websocket.on('message', function (message: any) {
      // console.log(JSON.stringify(message))
      // console.log(typeof message)
      //
      // if (typeof message === "object") {
      //   console.log("여기 아냐??")
      // }
      try {
        const msg = message.toString()

        console.log(msg)

      } catch (e) {
        console.log(e)
      }

      ctx.websocket.send('pong');
    });

    setInterval(()=>{
      ctx.websocket.send('pppong');
    }, 3000)

    // 유저가 나갔을 때
    ctx.websocket.on('close', () => {
      console.log(`User ${ctx.websocket.id} has left.`);
    });
  })

  const router = new Router();

  app.ws.use(ws.routes()).use(ws.allowedMethods());

  // Regular middleware
// Note it's app.ws.use and not app.use
//   app.ws.use(function (ctx: Context, next: any) {
//     // return `next` to pass the context (ctx) on to the next ws middleware
//     return next(ctx);
//   });
//
//   // Using routes
//   app.ws.use(route.all('/test/:id', function (ctx: Context) {
//     // `ctx` is the regular koa context created from the `ws` onConnection `socket.upgradeReq` object.
//     // the websocket is added to the context on `ctx.websocket`.
//     ctx.websocket.send('Hello World');
//     ctx.websocket.on('message', function (message: string) {
//       // do something with the message from client
//       console.log(message);
//     });
//   }));

  app.listen(3000, () => {
    console.log('listening to port 3000')
  })
}


Promise.all([httpServer(), webSocketServer()])
/*
// arweave 업로드 코드 테스트!
import { init } from './api/tWeave'
const aaa = async () => {
  await init()
}

aaa()

setTimeout(()=>{
}, 4000)
*/

console.log('hi')