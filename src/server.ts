import {Context} from "koa";

const Koa = require('koa');
const Router = require('koa-router');
const bodyParser = require('koa-bodyparser');
const websockify = require('koa-websocket')

const {createCanvas, loadImage, ImageData} = require('canvas');

const fs = require('fs');
const sharp = require('sharp');

// import * as dotenv from 'dotenv'
// import dotenv from 'dotenv'
// import ErrnoException = NodeJS.ErrnoException;
const cors = require('@koa/cors')
require('dotenv').config()
// dotenv.config()
//


const {test, getImageFromS3, aaaa, bbbb, testImage, GetTokenId} = require('./common/s3_nft_util');
const { callSmartContract, getCurrentGasPrice } = require('./common/contract');
//
//
(async ()=>{
    // await testaa();
    // await testImage();
  // const hash = await GetTokenId({body:1, hat:2});
  // console.log('hash:', hash)
  // await callSmartContract()
  // await getCurrentGasPrice()
})()

// (async ()=>{
//   const iBuffer = await test();
//   const image = await loadImage(iBuffer)
//   const canvas = createCanvas(image.width, image.height);
//   const ctx = canvas.getContext('2d');
//
//   console.log("aa??")
//   ctx.drawImage(image, 0, 0);
//
//   const outputBuffer = canvas.toBuffer('image/webp');
//   console.log('Image drawn on the canvas');
//   // ... 이미지를 저장하거나 다른 작업 수행
//   // 이미지 파일로 저장
//   const outputPath = './test.webp';
//   fs.writeFile(outputPath, outputBuffer, (err: any) => {
//     if (err) {
//       console.error(`Error while saving image: ${err}`);
//     } else {
//       console.log(`Image saved at: ${outputPath}`);
//     }
//   });
//  
// })()
//
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
  const router = new Router();
  const ws_nft_reservation = require('./api_ws/nft_reservation')

  router.use('/api_ws', ws_nft_reservation.routes())

  app.ws.use(router.routes()).use(router.allowedMethods());

  app.listen(3000, () => {
    console.log('listening to port 3000')
  })
}


Promise.all([httpServer(), webSocketServer()])
// /*
// // arweave 업로드 코드 테스트!
// import { init } from './api/tWeave'
// const aaa = async () => {
//   await init()
// }
//
// aaa()
//
// setTimeout(() => {
// }, 10000)
//
// console.log('hi')
