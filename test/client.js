const WebSocket = require('ws');

const ws = new WebSocket('ws://localhost:3000/api_ws/nft_reservation');

ws.on('open', function open() {
    console.log('WebSocket 연결 성공');

    // type WsMsg = {type: string, msg: any, content: any}
    const msg = {type: 'message', msg: 'ctos_getToken', content: {body: 4, eyes: 1, hair: 1, shirts: 1}}
    const msgStr = JSON.stringify(msg)

    ws.send(msgStr);
});

ws.on('message', function incoming(data) {
    const dataJson = JSON.parse(data)

    switch (dataJson.msg) {
        case 'stoc_getToken':
            console.log('ttid:', dataJson.content.tokenRandId)

            const tokenRandId = dataJson.content.tokenRandId
            const tokenId = dataJson.content.tokenId

            // ctos_reservation
            const msg = {type: 'message', msg: 'ctos_reservation', content: {tokenId, tokenRandId}}
            const msgStr = JSON.stringify(msg)
            
            console.log('msgStr:', msgStr)

            ws.send(msgStr);
            // dataJson.content.tokenRandId
            break
    }
    console.log(`서버에서 받은 데이터: ${data}`);
});

ws.on('error', function error(err) {
    console.error(`WebSocket 에러 발생: ${err.message}`);
});