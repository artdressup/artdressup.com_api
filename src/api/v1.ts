import {Context} from "koa";

const Router = require('koa-router');
const api = new Router();
const {getContract, getTokenMetaData} = require('../common/contract')
const {MakeCoordinationImage} = require('../common/s3_nft_util')

const TEST_KEY = process.env.TEST_KEY

async function convertPngToWebp(inputPath: string, outputPath: string) {
    try {
        await sharp(inputPath)
            .webp({quality: 100}) // 원하는 품질 값을 설정하세요. (1-100 사이의 값)
            .toFile(outputPath);
        console.log('이미지가 성공적으로 WebP 형식으로 변환되었습니다.');
    } catch (error) {
        console.error('이미지 변환 중 오류가 발생했습니다:', error);
    }
}

api.get('/health', async (ctx: Context) => {
    ctx.type = 'application/json';
    ctx.body = {hello: 'world'}
});

api.post('/getnft', async (ctx: Context) => {
    try {
        const req: any = ctx.request;
        const body = req['body'];
        const account_id = body.account_id;
        const token_id = body.token_id;

        const coordination = body.coordination

        console.log('body::', body)
        // console.log('body::', body.username)

        const url = await MakeCoordinationImage(coordination)
        const metadata = await getTokenMetaData(url)
        //
        console.log('url::', url)
        console.log('metadata::', metadata)
        // // 여기서는 스마트 계약 완료 처리!!
        const contract = await getContract();
        const o_id = await contract.get_owner_id();
        console.log('o_id:', o_id);

        const result = await contract.complete_reservation(account_id, token_id, metadata)
        console.log('complete_reservation::result::', result)
        const transaction_hash = result.transaction.hash

        ctx.type = 'application/json';
        ctx.body = {transaction_hash, token_id};
    } catch (e) {
        console.error(e)
        ctx.throw(400, `Bad Request`)
    }
});

// api.post('/delres', async (ctx: Context) => {
//     try {
//         const req: any = ctx.request;
//         const body = req['body'];
//         const account_id = body.account_id;
//         const testkey = body.testkey;
//
//         if (TEST_KEY !== testkey) {
//             throw new Error('You do not have permission.')
//         }
//
//         const contract = await getContract();
//         const o_id = await contract.get_owner_id();
//         console.log('o_id:', o_id);
//
//         const result = await contract.del_reservations(account_id)
//         console.log('del_reservation::result::', result)
//         const transaction_hash = result.transaction.hash
//
//         ctx.type = 'application/json';
//         ctx.body = {transaction_hash};
//     } catch (e) {
//         console.error(e)
//         ctx.throw(400, `Bad Request`)
//     }
// })


module.exports = api;