const Koa = require('koa');
const Router = require('koa-router');
const bodyParser = require('koa-bodyparser');
const websockify = require('koa-websocket');
import * as dotenv from 'dotenv';
dotenv.config();
const httpServer = async () => {
    const app = new Koa();
    const router = new Router();
    const apiV1 = require('./api/v1');
    router.use('/api/v1', apiV1.routes());
    app.use(bodyParser()).use(router.routes()).use(router.allowedMethods());
    app.listen(4000, () => {
        console.log('listening to port 4000');
    });
};
const webSocketServer = async () => {
};
await httpServer();
console.log('hi');
//# sourceMappingURL=server.js.map