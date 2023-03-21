const Arweave = require('arweave');
const fs = require('fs');
const init = async () => {
    const arweave = Arweave.init({
        host: 'arweave.net',
        port: 443,
        protocol: 'https'
    });
    const walletPath = __dirname + '/../../-1T1b_1IqNNvtM_BPE6mSWqyQ9Kxpjypx1aDdEC-1ow.json';
    fs.readFile(walletPath, async (err, walletData) => {
        if (err) {
            console.error('Error reading wallet file:', err);
            return;
        }
        const wallet = JSON.parse(walletData.toString('utf8'));
        const filePath = __dirname + '/../../hello.webp';
        fs.readFile(filePath, async (err, fileData) => {
            if (err) {
                console.error('Error reading file:', err);
                return;
            }
            try {
                const transaction = await arweave.createTransaction({ data: fileData }, wallet);
                transaction.addTag('Content-Type', 'image/webp');
                await arweave.transactions.sign(transaction, wallet);
                const response = await arweave.transactions.post(transaction);
                if (response.status === 200) {
                    console.log('File uploaded successfully. Transaction ID:', transaction.id);
                }
                else {
                    console.error('Error uploading file:', response);
                }
            }
            catch (error) {
                console.error('Error creating transaction:', error);
            }
        });
    });
};
export { init };
//# sourceMappingURL=tWeave.js.map