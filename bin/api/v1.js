"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
var Router = require('koa-router');
var api = new Router();
var _a = require('../common/contract'), getContract = _a.getContract, getTokenMetaData = _a.getTokenMetaData;
var MakeCoordinationImage = require('../common/s3_nft_util').MakeCoordinationImage;
var TEST_KEY = process.env.TEST_KEY;
function convertPngToWebp(inputPath, outputPath) {
    return __awaiter(this, void 0, void 0, function () {
        var error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    return [4, sharp(inputPath)
                            .webp({ quality: 100 })
                            .toFile(outputPath)];
                case 1:
                    _a.sent();
                    console.log('이미지가 성공적으로 WebP 형식으로 변환되었습니다.');
                    return [3, 3];
                case 2:
                    error_1 = _a.sent();
                    console.error('이미지 변환 중 오류가 발생했습니다:', error_1);
                    return [3, 3];
                case 3: return [2];
            }
        });
    });
}
api.get('/health', function (ctx) { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        ctx.type = 'application/json';
        ctx.body = { hello: 'world' };
        return [2];
    });
}); });
api.post('/getnft', function (ctx) { return __awaiter(void 0, void 0, void 0, function () {
    var req, body, account_id, token_id, coordination, url, metadata, contract, o_id, result, transaction_hash, e_1;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 6, , 7]);
                req = ctx.request;
                body = req['body'];
                account_id = body.account_id;
                token_id = body.token_id;
                coordination = body.coordination;
                console.log('body::', body);
                return [4, MakeCoordinationImage(coordination)];
            case 1:
                url = _a.sent();
                return [4, getTokenMetaData(url)];
            case 2:
                metadata = _a.sent();
                console.log('url::', url);
                console.log('metadata::', metadata);
                return [4, getContract()];
            case 3:
                contract = _a.sent();
                return [4, contract.get_owner_id()];
            case 4:
                o_id = _a.sent();
                console.log('o_id:', o_id);
                return [4, contract.complete_reservation(account_id, token_id, metadata)];
            case 5:
                result = _a.sent();
                console.log('complete_reservation::result::', result);
                transaction_hash = result.transaction.hash;
                ctx.type = 'application/json';
                ctx.body = { transaction_hash: transaction_hash, token_id: token_id };
                return [3, 7];
            case 6:
                e_1 = _a.sent();
                console.error(e_1);
                ctx.throw(400, "Bad Request");
                return [3, 7];
            case 7: return [2];
        }
    });
}); });
module.exports = api;
//# sourceMappingURL=v1.js.map