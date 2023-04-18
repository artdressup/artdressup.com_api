const {S3Client, GetObjectCommand, PutObjectCommand} = require('@aws-sdk/client-s3');
// const fetch = require('node-fetch');
const fs = require('fs');
const {Readable} = require('stream')
require('buffer')

const {createCanvas, loadImage, ImageData, Image} = require('canvas');
const sharp = require('sharp');
const shortid = require('shortid')
const { sha256hash } = require('./utils')

// S3 클라이언트 인스턴스 생성
const s3Client = new S3Client({
    region: process.env.S3_REGION,
    credentials: {
        accessKeyId: process.env.AWS_AKEY!,
        secretAccessKey: process.env.AWS_SKEY!
    }
});

// console.log(process.env.S3_REGION);
// console.log(process.env.AWS_AKEY);
// console.log(process.env.AWS_SKEY);

// S3 버킷 이름과 객체 키
const bucketName = process.env.S3_BUCKETNAME;
const objectKey = 'resource/00_body/body_0000.webp';
const HASH_ADD_TEXT = process.env.HASH_ADD_TEXT
const CDN_BASE_URL = process.env.CDN_BASE_URL

// 부위에 따라 그리는 순서가 다르다. drawNum은 그리는 우선순위를 반환한다.
const getDrawNum = (category: number): number => {
    switch (category) {
        case 0:
            return 2 // body
        case 1:
            return 4 // hat
        case 2:
            return 3 // hair
        case 3:
            return 7 // eyes
        case 4:
            return 8 // glasses
        case 5:
            return 5 // flush
        case 6:
            return 6 // mouth
        case 7:
            return 11 // shirts
        case 8:
            return 10 // pants
        case 9:
            return 12 // onePiece
        case 10:
            return 13 // lHand
        case 11:
            return 14 // rHand
        case 12:
            return 9 // shoes
        case 13:
            return 1 // wing
        case 14:
            return 0 // background
        default:
            throw new Error('getDrawNum out of range')
    }
}

// s3 에서 이미지 를 가져와서 canvas image로 변환 후 반환한다.
// drawNum은 Promise.all 호출 후 이미지 조합 순서를 맞추기 위해 입력 받는다.
// path 에는 resource/00_body/body_0000.webp 형식으로 값이 들어와야 한다.
type DrawBuffer = { drawNum: number, image: any }
const getImageFromS3 = async (drawNum: number, path: string): Promise<DrawBuffer> => {
    return new Promise(async (resolve, reject) => {
        try {
            const getObjectParams = {
                Bucket: bucketName,
                Key: path
            }
            // GetObject 작업 수행
            const response = await s3Client.send(new GetObjectCommand(getObjectParams));

            // Convert S3 object stream to readable stream
            const objectStream = response.Body;
            const readableStream = new Readable().wrap(objectStream);

            const chunks: Uint8Array[] = [];
            readableStream.on('data', (chunk: Uint8Array) => {
                chunks.push(chunk);
            });

            readableStream.on('end', async () => {
                const buffer = Buffer.concat(chunks);
                const pngBuffer = await convertWebpToPng(buffer)
                const image = new Image();
                image.onload = () => resolve({drawNum, image: image});
                image.onerror = (error: any) => reject(error)
                image.src = pngBuffer
            });

            readableStream.on('error', (error: any) => {
                reject(error);
            });

        } catch (error) {
            console.error(`Error while downloading image from S3: ${error}`);
            reject(error)
        }
    })
}

async function convertWebpToPng(webpBuffer: Buffer) {
    try {
        // WebP 이미지를 PNG 버퍼로 변환
        const pngBuffer = await sharp(webpBuffer).png().toBuffer();
        return pngBuffer
        // PNG 버퍼를 파일로 저장 (옵션)
        // fs.writeFileSync('output.png', pngBuffer);
    } catch (error) {
        console.error('Error converting webp to png:', error);
    }
}

// 각 부위의 리소스 개수 반환
// return value example: { "body": 5, "hat": 0, "hair": 6, "eyes": 2, "glasses": 1, "flush": 1, "mouth": 1, "shirts": 4, "pants": 5, "onePiece": 1, "lHand": 1, "rHand": 1, "shoes": 1, "wing": 0, "background": 0 }
async function getDressroomJson(): Promise<any> {
    try {
        const getObjectParams = {
            Bucket: bucketName,
            Key: 'resource/dressroom.json',
        };

        const response = await s3Client.send(new GetObjectCommand(getObjectParams));
        const chunks: Uint8Array[] = [];
        const readableStream = new Readable().wrap(response.Body);

        return new Promise<any>((resolve, reject) => {
            readableStream.on('data', (chunk: Uint8Array) => {
                chunks.push(chunk);
            });

            readableStream.on('end', () => {
                const buffer = Buffer.concat(chunks);
                const jsonString = buffer.toString();
                const jsonData = JSON.parse(jsonString);
                resolve(jsonData);
            });

            readableStream.on('error', (error: any) => {
                reject(error);
            });
        });
    } catch (error) {
        console.error('Error getting JSON from S3:', error);
        throw error;
    }
}


// 1 -> '0001'
const getNumStr = (num: Number) => {
    return num.toString().padStart(4, '0')
}
const folderPath = 'resource/'
const cat00Body = (num: Number) => {
    const numStr = getNumStr(num)
    return `${folderPath}00_body/body_${numStr}.webp`
}
const cat01Hat = (num: Number) => {
    const numStr = getNumStr(num)
    return `${folderPath}01_hat/hat_${numStr}.webp`
}
const cat02Hair = (num: Number) => {
    const numStr = getNumStr(num)
    return `${folderPath}02_hair/hair_${numStr}.webp`
}
const cat03Eyes = (num: Number) => {
    const numStr = getNumStr(num)
    return `${folderPath}03_eyes/eyes_${numStr}.webp`
}
const cat04Glasses = (num: Number) => {
    const numStr = getNumStr(num)
    return `${folderPath}04_glasses/glasses_${numStr}.webp`
}
const cat05Flush = (num: Number) => {
    const numStr = getNumStr(num)
    return `${folderPath}05_flush/flush_${numStr}.webp`
}
const cat06Mouth = (num: Number) => {
    const numStr = getNumStr(num)
    return `${folderPath}06_mouth/mouth_${numStr}.webp`
}
const cat07Shirts = (num: Number) => {
    const numStr = getNumStr(num)
    return `${folderPath}07_shirts/shirts_${numStr}.webp`
}
const cat08Pants = (num: Number) => {
    const numStr = getNumStr(num)
    return `${folderPath}08_pants/pants_${numStr}.webp`
}
const cat09OnePiece = (num: Number) => {
    const numStr = getNumStr(num)
    return `${folderPath}09_onePiece/onePiece_${numStr}.webp`
}
const cat10LHand = (num: Number) => {
    const numStr = getNumStr(num)
    return `${folderPath}10_lHand/lHand_${numStr}.webp`
}
const cat11RHand = (num: Number) => {
    const numStr = getNumStr(num)
    return `${folderPath}11_rHand/rHand_${numStr}.webp`
}
const cat12Shoes = (num: Number) => {
    const numStr = getNumStr(num)
    return `${folderPath}12_shoes/shoes_${numStr}.webp`
}
const cat13Wing = (num: Number) => {
    const numStr = getNumStr(num)
    return `${folderPath}13_wing/wing_${numStr}.webp`
}
const cat14Background = (num: Number) => {
    const numStr = getNumStr(num)
    return `${folderPath}14_background/background_${numStr}.webp`
}

// 코디 부위 값 입력 받아서 이미지 생성하고 S3에 업로드
// testnet에서는 중복체크 하지 않음.
const dressroomKeys = {
    '00_body': 'body',
    '01_hat': 'hat',
    '02_hair': 'hair',
    '03_eyes': 'eyes',
    '04_glasses': 'glasses',
    '05_flush': 'flush',
    '06_mouth': 'mouth',
    '07_shirts': 'shirts',
    '08_pants': 'pants',
    '09_onePiece': 'onePiece',
    '10_lHand': 'lHand',
    '11_rHand': 'rHand',
    '12_shoes': 'shoes',
    '13_wing': 'wing',
    '14_background': 'background'
}

// params 체크! 범위 값을 벗어나지 않는지
type DrawNumPath = { drawNum: number, path: string }
type CoordinationParamsCheckResult = { msg: string, paths: Array<DrawNumPath> }
const CoordinationParamsCheck = async (coordinationJson: any): Promise<CoordinationParamsCheckResult> => {
    try {
        const dJson = await getDressroomJson()
        // console.log('dJson::', dJson)
        const dKey = dressroomKeys
        const paths: Array<any> = []

        const _00 = dKey["00_body"]
        if (coordinationJson[_00] !== undefined) {
            const val = coordinationJson[_00]
            if (val < 0) {
                return {msg: '00_body value is less than 0.', paths: []}
            } else if (val + 1 > dJson[_00]) {
                return {msg: '00_body value is out of range.', paths: []}
            }
            paths.push({drawNum: getDrawNum(0), path: cat00Body(val)})
        }

        const _01 = dKey["01_hat"]
        if (coordinationJson[_01] !== undefined) {
            const val = coordinationJson[_01]
            if (val < 0) {
                return {msg: '01_hat value is less than 0.', paths: []}
            } else if (val + 1 > dJson[_01]) {
                return {msg: '01_hat value is out of range.', paths: []}
            }
            paths.push({drawNum: getDrawNum(1), path: cat01Hat(val)})
        }

        const _02 = dKey["02_hair"]
        if (coordinationJson[_02] !== undefined) {
            const val = coordinationJson[_02]
            if (val < 0) {
                return {msg: '02_hair value is less than 0.', paths: []}
            } else if (val + 1 > dJson[_02]) {
                return {msg: '02_hair value is out of range.', paths: []}
            }
            paths.push({drawNum: getDrawNum(2), path: cat02Hair(val)})
        }

        const _03 = dKey["03_eyes"]
        if (coordinationJson[_03] !== undefined) {
            const val = coordinationJson[_03]
            if (val < 0) {
                return {msg: '03_eyes value is less than 0.', paths: []}
            } else if (val + 1 > dJson[_03]) {
                return {msg: '03_eyes value is out of range.', paths: []}
            }
            paths.push({drawNum: getDrawNum(3), path: cat03Eyes(val)})
        }

        const _04 = dKey["04_glasses"]
        if (coordinationJson[_04] !== undefined) {
            const val = coordinationJson[_04]
            if (val < 0) {
                return {msg: '04_glasses value is less than 0.', paths: []}
            } else if (val + 1 > dJson[_04]) {
                return {msg: '04_glasses value is out of range.', paths: []}
            }
            paths.push({drawNum: getDrawNum(4), path: cat04Glasses(val)})
        }

        const _05 = dKey["05_flush"]
        if (coordinationJson[_05] !== undefined) {
            const val = coordinationJson[_05]
            if (val < 0) {
                return {msg: '05_flush value is less than 0.', paths: []}
            } else if (val + 1 > dJson[_05]) {
                return {msg: '05_flush value is out of range.', paths: []}
            }
            paths.push({drawNum: getDrawNum(5), path: cat05Flush(val)})
        }

        const _06 = dKey["06_mouth"]
        if (coordinationJson[_06] !== undefined) {
            const val = coordinationJson[_06]
            if (val < 0) {
                return {msg: '06_mouth value is less than 0.', paths: []}
            } else if (val + 1 > dJson[_06]) {
                return {msg: '06_mouth value is out of range.', paths: []}
            }
            paths.push({drawNum: getDrawNum(6), path: cat06Mouth(val)})
        }

        // 원피스가 없는 상태에서만 상의/하의를 입을 수 있음.
        const _09 = dKey["09_onePiece"]
        const _07 = dKey["07_shirts"]
        if (coordinationJson[_09] === undefined && coordinationJson[_07] !== undefined) {
            const val = coordinationJson[_07]
            if (val < 0) {
                return {msg: '07_shirts value is less than 0.', paths: []}
            } else if (val + 1 > dJson[_07]) {
                return {msg: '07_shirts value is out of range.', paths: []}
            }
            paths.push({drawNum: getDrawNum(7), path: cat07Shirts(val)})
        }

        const _08 = dKey["08_pants"]
        if (coordinationJson[_09] === undefined && coordinationJson[_08] !== undefined) {
            const val = coordinationJson[_08]
            if (val < 0) {
                return {msg: '08_pants value is less than 0.', paths: []}
            } else if (val + 1 > dJson[_08]) {
                return {msg: '08_pants value is out of range.', paths: []}
            }
            paths.push({drawNum: getDrawNum(8), path: cat08Pants(val)})
        }

        // _09 is 09_onePiece
        if (coordinationJson[_09] !== undefined) {
            const val = coordinationJson[_09]
            if (val < 0) {
                return {msg: '09_onePiece value is less than 0.', paths: []}
            } else if (val + 1 > dJson[_09]) {
                return {msg: '09_onePiece value is out of range.', paths: []}
            }
            paths.push({drawNum: getDrawNum(9), path: cat09OnePiece(val)})
        }

        const _10 = dKey["10_lHand"]
        if (coordinationJson[_10] !== undefined) {
            const val = coordinationJson[_10]
            if (val < 0) {
                return {msg: '10_lHand value is less than 0.', paths: []}
            } else if (val + 1 > dJson[_10]) {
                return {msg: '10_lHand value is out of range.', paths: []}
            }
            paths.push({drawNum: getDrawNum(10), path: cat10LHand(val)})
        }

        const _11 = dKey["11_rHand"]
        if (coordinationJson[_11] !== undefined) {
            const val = coordinationJson[_11]
            if (val < 0) {
                return {msg: '11_rHand value is less than 0.', paths: []}
            } else if (val + 1 > dJson[_11]) {
                return {msg: '11_rHand value is out of range.', paths: []}
            }
            paths.push({drawNum: getDrawNum(11), path: cat11RHand(val)})
        }

        const _12 = dKey["12_shoes"]
        if (coordinationJson[_12] !== undefined) {
            const val = coordinationJson[_12]
            if (val < 0) {
                return {msg: '12_shoes value is less than 0.', paths: []}
            } else if (val + 1 > dJson[_12]) {
                return {msg: '12_shoes value is out of range.', paths: []}
            }
            paths.push({drawNum: getDrawNum(12), path: cat12Shoes(val)})
        }

        const _13 = dKey["13_wing"]
        if (coordinationJson[_13] !== undefined) {
            const val = coordinationJson[_13]
            if (val < 0) {
                return {msg: '13_wing value is less than 0.', paths: []}
            } else if (val + 1 > dJson[_13]) {
                return {msg: '13_wing value is out of range.', paths: []}
            }
            paths.push({drawNum: getDrawNum(13), path: cat13Wing(val)})
        }

        const _14 = dKey["14_background"]
        if (coordinationJson[_14] !== undefined) {
            const val = coordinationJson[_14]
            if (val < 0) {
                return {msg: '14_background value is less than 0.', paths: []}
            } else if (val + 1 > dJson[_14]) {
                return {msg: '14_background value is out of range.', paths: []}
            }
            paths.push({drawNum: getDrawNum(14), path: cat14Background(val)})
        }

        return {msg: 'success', paths}

    } catch (err) {
        console.error(`CoordinationParamsCheck err: ${err}`)
        throw err
    }
}

// 코디 이미지 생성
const MakeCoordinationImage = async (coordinationJson: any) => {
    return new Promise(async (resolve, reject)=> {
        try {
            const result = await CoordinationParamsCheck(coordinationJson)
            if (result.msg !== 'success') {
                // console.log('뭐지??')
                console.log(result.msg)
                return result.msg
            }

            // paths에 담긴 path랑 cat으로 이미지 가져오기 Promise 만들기
            const promises: Promise<DrawBuffer>[] = []
            for (const path of result.paths) {
                promises.push(getImageFromS3(path.drawNum, path.path))
            }

            // const canvas = createCanvas(512, 512)
            // const ctx = canvas.getContext('2d');
            const tokenId = await GetTokenId(coordinationJson)

            Promise.all(promises).then(async (results) => {
                results.sort((a, b) => a.drawNum - b.drawNum)

                const images: any[] = []
                for (const obj of results) {
                    console.log('drawNum::', obj.drawNum)
                    // buffers.push(obj.buffer)
                    // ctx.drawImage(obj.buffer, 0, 0)
                    images.push(obj.image)
                }
                
                return MakeImage(tokenId, images)
            }).then((url)=>{
                resolve(url)
            }).catch(e => {
                throw e
            })
        } catch (err) {
            console.error(err)
            throw err
        }
    })
}

// 코디 이미지 조합 후 S3에 저장. 저장 경로는 tokenId로 결정 됨.
const MakeImage = async (tokenId: string, images: any[]) => {
    return new Promise(async (resolve, reject) => {
        try {
            const canvas = createCanvas(512, 512)
            const ctx = canvas.getContext('2d');

            for (const image of images) {
                ctx.drawImage(image, 0, 0)
            }

            // webp로 저장하기 위해 변환한다
            const outputBuffer = canvas.toBuffer('image/png');
            const webpImageBuffer = await sharp(outputBuffer).webp().toBuffer();

            const key = `resource/tokens/${tokenId}/index.webp`
            // tokenId 경로에 저장!
            const putObjectParams = {
                Bucket: bucketName,
                Key: key,
                Body: webpImageBuffer,
                ContentType: 'image/webp'
            }

            await s3Client.send(new PutObjectCommand(putObjectParams))
            console.log('이미지 저장 완료!!!')
            
            const url = `${CDN_BASE_URL}/${key}`
            
            resolve(url)
        } catch (err) {
            console.error(err)
            reject(err)
        }
    })
}

const GetTestnetToken = async (coordinationJson: any) => {
    const tokenId = await GetTokenId(coordinationJson)
    const tokenRandId = await GetRandTokenId()
    return { tokenId, tokenRandId }
}

const GetTokenId = async (coordinationJson: any) => {
    const dValues = Object.values(dressroomKeys)

    let tokenStr = ''
    for (const val of dValues) {
        if (coordinationJson[val] === undefined) {
            continue
        }

        const num = coordinationJson[val]
        tokenStr += `${val}${num}/`
    }

    tokenStr += HASH_ADD_TEXT

    const hash = await sha256hash(tokenStr)

    return hash
}

// 테스트넷에 사용될 토큰 아이디.
const GetRandTokenId = async () => {
    const sId = shortid.generate();
    const hash = await sha256hash(sId)
    return hash
}

// {body:0, hat:1 ... }
// const aaaa = async (coordination: Coordination) => {
//     // dressroom.json 가져와서 제한이 몇개있나 확인해야된다.
//    // 여기서 조합하고...
//     // hash 만들어서 중복체크 해야함.
//     //
//     const aa = cat00Body(3)
//     console.log(aa)
//     let paths = 'hello??'
//     for (let i=0; i<100; i++) {
//         paths += 'hello???'
//     }
//
//     // if (coordination.body) {
//     //     const path = cat00Body(coordination.body)
//     //     paths += path
//     // }
//     //
//     // if (coordination.hat) {
//     //     const path = cat00Body(coordination.hat)
//     //     paths += path
//     // }
//
//     const hash = await sha256(paths)
//     // hash 중복 체크 하기!
//     console.log('hash:', hash)
// }

async function testImage() {
    const aa = await MakeCoordinationImage({
        body: 1,
        hair: 1,
        eyes: 1,
        shirts: 1,
        pants: 1
    })
}

async function test() {
    getImageFromS3(1, objectKey)
    // await getImageFromS3(objectKey)
}

module.exports = {test, getImageFromS3,  testImage, GetTokenId, MakeCoordinationImage, GetTestnetToken}

// export { test }

// export function s3test () {
//     console.log(bucketName)
// }

//
// export {s3test}
// export { s3test }
// const
//
// exports.module = 