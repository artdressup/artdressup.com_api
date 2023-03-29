import {Context} from "koa";

const Router = require('koa-router');
const api_ws = new Router();

const { GetTestnetToken, MakeCoordinationImage } = require('../common/s3_nft_util')

// ctos msg
// ctos_getToken // 토큰 요청
// - content: {body:1, hat:2, shirts:0 ... }
// stoc_getToken // 토큰 요청에 대한 응답
// - content: {tokenId:'..', tokenRandId:'..'} ( 테스트넷에서는 tokenRandId를 스마트 계약에 사용 )
// ctos_nft_reservation // 예약 완료 요청
// - content: {tokenId: '..'} <--
// ctos_nft_reservation //
// - content: { }

api_ws.get('/nft_reservation', async (ctx: Context) => {
    // ctx.websocket.send('Hello, nft_reservation ');
    console.log('socket address:', ctx.socket.address())

    const cache = {}
    // 유저가 메시지를 보냈을때
    ctx.websocket.on('message', function (message: any) {
        try {
            const msg = message.toString()
            const msgjson = JSON.parse(msg)

            route(msgjson, ctx.websocket, cache)
            console.log(msg)
            console.log(msgjson)
            // msg 값으로 데이터 처리를 해줘야 한다.

        } catch (e) {
            console.log(e)
            const wsMsg: WsMsg = {type: 'error', msg: 'Bad request. Json parse error.', content: null}
            const msgStr = wsMsgToStr(wsMsg)
            ctx.websocket.send(msgStr); // 에러 메시지 전송
            ctx.websocket.terminate() // 강제로 연결 끊기
        }
    });

    // 유저가 나갔을 때
    ctx.websocket.on('close', () => {
        // console.log(`User ${ctx.websocket.id} has left.`);
        console.log(`nft_reservation User has left.`);
    });
})

// ctos_getToken // 토큰 요청
// - content: {body:1, hat:2, shirts:0 ... }
// stoc_getToken // 토큰 요청에 대한 응답
// - content: {tokenId:'..', tokenRandId:'..'} ( 테스트넷에서는 tokenRandId를 스마트 계약에 사용 )
// ctos_nft_reservation // 예약 완료 요청
// - content: {tokenId: '..'} <--
// ctos_nft_reservation //
// - content: { }

const route = async (msgjson: WsMsg, socket: any, cache: any) => {
    try {
        switch (msgjson.msg) {
            case 'ctos_getToken':
                fn_ctos_getToken(msgjson, socket, cache)
                break
            case 'ctos_reservation':
                fn_ctos_nft_reservation(msgjson, socket, cache)
                break
            default:
                const wsMsg: WsMsg = {type: 'error', msg: 'This is an undefined request.', content: null}
                const msgStr = wsMsgToStr(wsMsg)
                socket.send(msgStr); // 에러 메시지 전송
                socket.terminate() // 강제로 연결 끊기
        }

    } catch (e) {
        throw e
    }
}

const fn_ctos_getToken = async (msgJson: WsMsg, socket: any, cache: any) => {
    try {
        const content: Ct_coordination = msgJson.content
        const result = await GetTestnetToken(content)

        // testnet 전용!
        // 실 서비스에서는 dynamodb에 저장.
        const tokenRandId = result.tokenRandId;
        cache[tokenRandId] = content

        // cache[]
        // {re

        const wsMsg: WsMsg = {type: 'message', msg: 'stoc_getToken', content: result}
        const msgStr = wsMsgToStr(wsMsg)
        console.log('msgStr:', msgStr)
        socket.send(msgStr)

    } catch (e) {
        console.error(`fn_ctos_getToken error: ${e}`)
        throw e
    }
}

//
const fn_ctos_nft_reservation = async (msgJson: WsMsg, socket: any, cache: any) => {
    try {
        const content: Ct_reservation = msgJson.content
        const result = {}

        // testnet 전용! 실 서비스는 dynamodb에서 가져오기
        // 사용자가 선택했던 이미지 정보 가져오기
        const coordinationObj = cache[content.tokenRandId]
        
        if (coordinationObj === undefined) {
            console.log('cache에 데이타가 없음!!')
        } else {
            console.log('이미지 처리 하고..')
            console.log('스마트계약 완료 하면 된다.')
            console.log(coordinationObj)
            const url = await MakeCoordinationImage(coordinationObj)
            console.log('url::::', url)
        }

        const wsMsg: WsMsg = {type: 'message', msg: 'stoc_nft_reservation', content: result}
        const msgStr = wsMsgToStr(wsMsg)
        console.log('msgStr:', msgStr)
        socket.send(msgStr)

    } catch (e) {
        console.error(`fn_ctos_nft_reservation error: ${e}`)
        throw e
    }

}

// tokenId, tokenRandId
// stoc
// ctos

const wsMsgToStr = (wsMsg: WsMsg) => {
    try {
        return JSON.stringify(wsMsg)
    } catch (e) {
        throw e
    }
}

/////////////////////////// Types ///////////////////////////////////
// 웹 소켓 메시지
type WsMsg = { type: string, msg: any, content: any }

// Ct는 Content
type Ct_coordination = {
    body: number,
    hat: number,
    hair: number,
    eyes: number,
    glasses: number,
    flush: number,
    mouth: number,
    shirts: number,
    pants: number,
    onePiece: number,
    lHand: number,
    rHand: number,
    shoes: number,
    wing: number,
    background: number,
}

type Ct_reservation = {
    tokenId: string,
    tokenRandId: string,
}


module.exports = api_ws;
