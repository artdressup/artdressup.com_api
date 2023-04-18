export {};

const crypto = require('crypto')
// async function sha256hash(message: string): Promise<string> {
//     const hash = crypto.createHash('sha256');
//     hash.update(message);
//     return hash.digest('hex');
// }
const sha256hash = async (str: string): Promise<string> => {
    const hash = crypto.createHash('sha256');
    hash.update(str);
    return hash.digest('hex');
}

function urlToBase64(url: string): string {
    const buffer = Buffer.from(url);
    return buffer.toString('base64')
}

module.exports = { sha256hash, urlToBase64 }