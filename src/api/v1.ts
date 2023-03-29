import {Context} from "koa";
import {Akord} from "@akord/akord-js";

const Router = require('koa-router');
const api = new Router();
import * as dotenv from 'dotenv'
const sharp = require('sharp')

dotenv.config()

const email = process.env.EMAIL
const password = process.env.PASSWORD

async function aaa() {
  const {akord, wallet, jwtToken} = await Akord.auth.signIn(email!, password!)

  const aaa = await akord.vault.list()
  // console.log('???')
  // aaa[0].id
  if (aaa.length > 0) {
    console.log('>0')
    const bbb = await akord.stack.list(aaa[0].id)
    console.log(__dirname)
    const file = NodeJs.File.fromPath(__dirname + '/../../hello.avif')
    const result = await akord.stack.create(aaa[0].id, file, 'hello.avif')
    console.log('stackId: ' + result.stackId)
    console.log('transactionId: ' + result.transactionId)
  }

  // console.log(aaa)
}
async function convertPngToWebp(inputPath: string, outputPath: string) {
  try {
    await sharp(inputPath)
      .webp({ quality: 100 }) // 원하는 품질 값을 설정하세요. (1-100 사이의 값)
      .toFile(outputPath);

    console.log('이미지가 성공적으로 WebP 형식으로 변환되었습니다.');
  } catch (error) {
    console.error('이미지 변환 중 오류가 발생했습니다:', error);
  }
}

const inputPath = __dirname + '/../../hello.png';
const outputPath = __dirname + '/../../hello.webp';

async function bbb() {
  await convertPngToWebp(inputPath, outputPath);
}

import {NodeJs} from "@akord/akord-js/lib/types/file";

console.log("aa:" + process.env.EMAIL)

// const fs = require('fs')
// const {createCanvas, loadImage} = require('canvas')
// const canvas = createCanvas(512, 512)

api.get('/test', async (ctx: Context) => {
  console.log('???')
  await bbb()
  await aaa()
  ctx.body = 'test'
})

api.get('/hello', async (ctx: Context) => {
  // const myimg = await loadImage('src/images/dressup/body/body_0001.png')
  // const myimg2 = await loadImage('src/images/dressup/hair/hair_0001.png')
  // const myimg3 = await loadImage('src/images/dressup/pants/pants_0001.png')
  // const myimg4 = await loadImage('src/images/dressup/shirt/shirt_0001.png')
  // const myimg5 = await loadImage('src/images/dressup/shoes/shoes_0001.png')
  //
  // const context = canvas.getContext('2d')
  // context.fillStyle = '#ff0000'
  // context.fillRect(0, 0, 512, 512)
  // context.drawImage(myimg, 0, 0, 512, 512)
  // context.drawImage(myimg2, 0, 0, 512, 512)
  // context.drawImage(myimg3, 0, 0, 512, 512)
  // context.drawImage(myimg4, 0, 0, 512, 512)
  // context.drawImage(myimg5, 0, 0, 512, 512)
  //
  // const imgBuffer = canvas.toBuffer('image/png')
  // fs.writeFileSync('./hello.png', imgBuffer)
  ctx.body = 'aa';
});


module.exports = api;