// import test from "node:test";
const Arweave = require('arweave')
const fs = require('fs');

import * as buffer from "buffer";
// (window as any).Buffer = buffer.Buffer;

// import TestWeave from "testweave-sdk";

// 이 코드를 사용하면 arweave에 바로 업로드 가능!!
// 주의 할점은 현재 파일 경로와 이름이 고정으로 되어있다는거!
// 파일 타입도 webp로 되어있음..
const init = async () => {
// If you want to connect directly to a node
  const arweave = Arweave.init({
    host: 'arweave.net',
    port: 443,
    protocol: 'https'
  });

  const walletPath = __dirname + '/../../-1T1b_1IqNNvtM_BPE6mSWqyQ9Kxpjypx1aDdEC-1ow.json';

  fs.readFile(walletPath, async (err: NodeJS.ErrnoException | null, walletData: Buffer) => {
    if (err) {
      console.error('Error reading wallet file:', err);
      return;
    }


    // console.log('walletData' + walletData.toString());
    const wallet = JSON.parse(walletData.toString('utf8'));
    // console.log(wallet)

    const filePath = __dirname + '/../../hello.webp'; // path!!

    fs.readFile(filePath, async (err: NodeJS.ErrnoException | null, fileData: Buffer) => {
      if (err) {
        console.error('Error reading file:', err);
        return;
      }

      try {
        const transaction = await arweave.createTransaction(
          {data: fileData},
          wallet
        );

        transaction.addTag('Content-Type', 'image/webp'); // <-- type

        await arweave.transactions.sign(transaction, wallet);
        const response = await arweave.transactions.post(transaction);

        if (response.status === 200) {
          // transaction.id 만 받으면 이미지 pending 끝나기 전에도 확인할 수 있고
          // https://arweave.net/TRANSACTION_ID <-- 이 형식으로 URL 먼저 사용해도 된다.
          console.log(
            'File uploaded successfully. Transaction ID:',
            transaction.id
          );
        } else {
          console.error('Error uploading file:', response);
        }
      } catch (error) {
        console.error('Error creating transaction:', error);
      }
    });
  });
};

export {init}