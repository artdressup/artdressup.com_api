import { Akord } from "@akord/akord-js";
const Router = require('koa-router');
const api = new Router();
import * as dotenv from 'dotenv';
const sharp = require('sharp');
dotenv.config();
const email = process.env.EMAIL;
const password = process.env.PASSWORD;
async function aaa() {
    const { akord, wallet, jwtToken } = await Akord.auth.signIn(email, password);
    const aaa = await akord.vault.list();
    if (aaa.length > 0) {
        console.log('>0');
        const bbb = await akord.stack.list(aaa[0].id);
        console.log(__dirname);
        const file = NodeJs.File.fromPath(__dirname + '/../../hello.avif');
        const result = await akord.stack.create(aaa[0].id, file, 'hello.avif');
        console.log('stackId: ' + result.stackId);
        console.log('transactionId: ' + result.transactionId);
    }
}
async function convertPngToWebp(inputPath, outputPath) {
    try {
        await sharp(inputPath)
            .webp({ quality: 100 })
            .toFile(outputPath);
        console.log('이미지가 성공적으로 WebP 형식으로 변환되었습니다.');
    }
    catch (error) {
        console.error('이미지 변환 중 오류가 발생했습니다:', error);
    }
}
const inputPath = __dirname + '/../../hello.png';
const outputPath = __dirname + '/../../hello.webp';
async function bbb() {
    await convertPngToWebp(inputPath, outputPath);
}
import { NodeJs } from "@akord/akord-js/lib/types/file";
console.log("aa:" + process.env.EMAIL);
api.get('/test', async (ctx) => {
    console.log('???');
    await bbb();
    await aaa();
    ctx.body = 'test';
});
api.get('/hello', async (ctx) => {
    ctx.body = 'aa';
});
module.exports = api;
//# sourceMappingURL=v1.js.map