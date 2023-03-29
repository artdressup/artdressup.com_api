// import { connect, Contract, keyStores, utils, WalletConnection } from 'near-api-js';
import {connect, Contract, keyStores, utils, WalletConnection, Account} from 'near-api-js';
import {Provider} from 'near-api-js/lib/providers'

const NEAR_CONTRACT_NAME = process.env.NEAR_CONTRACT_NAME
const NEAR_PRIVATE_KEY = process.env.NEAR_PRIVATE_KEY

class MyContract extends Contract {
    get_owner_id(): Promise<any> {
        return this.account.viewFunction(this.contractId, 'get_something');
    }

    // do_something(arg1: string, arg2: string): Promise<any> {
    //   return this.account.functionCall({
    //     contractId: this.contractId,
    //     methodName: 'do_something',
    //     args: { arg1, arg2 },
    //   });
    // }
}

interface MyContractMethods {
    get_owner_id(): Promise<any>;

    // do_something(arg1: string, arg2: string): Promise<any>;
}

async function callSmartContract() {
    const config = {
        networkId: 'testnet', // 또는 'mainnet'
        nodeUrl: 'https://rpc.testnet.near.org', // 또는 'https://rpc.mainnet.near.org'
        contractName: NEAR_CONTRACT_NAME, // 스마트 계약 이름을 사용하세요.
        privateKey: NEAR_PRIVATE_KEY, // 프라이빗 키를 사용하세요.
    };

    const keyStore = new keyStores.InMemoryKeyStore();
    await keyStore.setKey(config.networkId, config.contractName!, utils.KeyPair.fromString(config.privateKey!));

    const near = await connect({
        networkId: config.networkId,
        nodeUrl: config.nodeUrl,
        keyStore,
    });

    const account = new Account(near.connection, config.contractName!);

    console.log('contractName:', config.contractName!)

    // const walletConnection = new WalletConnection(near, 'your-app-name'); // <-- app name 이건 상관없을듯
    // walletConnection._authData = {allKeys: [config.privateKey!]};
    const contract = new Contract(account, config.contractName!, {
        viewMethods: ['get_owner_id'],
        changeMethods: [],
    });

    const myContract = wrapMyContract(contract);

    const result = await myContract.get_owner_id();
    if (result === 'app.artdressup.testnet') {
        console.log('같다!!')
    }
    console.log('Read-only method result:', result);

    const depositYocto = utils.format.parseNearAmount('100')
    console.log('depositYocto:', depositYocto)

    // const contract = new MyContract(account, config.contractName!, {
    //     viewMethods: ['get_owner_id'],
    //     changeMethods: [],
    // });

    // const result = await contract.get_owner_id();
    // console.log('Read-only method result:', result);

    // const changeResult = await contract.do_something('value1', 'value2');
    // console.log('Change method result:', changeResult);
}

function wrapMyContract(contract: Contract): MyContractMethods {
    return {
        get_owner_id: () => contract.account.viewFunction(contract.contractId, 'get_owner_id')
        // do_something: (arg1: string, arg2: string) => contract.account.functionCall({
        //   contractId: contract.contractId,
        //   methodName: 'do_something',
        //   args: { arg1, arg2 },
        // }),
    };
}

interface JsonRpcProvider extends Provider {
    sendJsonRpc(method: string, params: any): Promise<any>;
}

// 최소, 최대, 가스 제한 반환
type getCurrentGasPriceResult = {min_gas_price: string, max_gas_price: string, gas_limit: number}
async function getCurrentGasPrice(): Promise<getCurrentGasPriceResult> {
    const networkId = 'testnet';
    const nodeUrl = 'https://rpc.testnet.near.org';

    const config = {
        networkId,
        nodeUrl,
    };

    const near = await connect(config);
    const jsonRpcProvider = near.connection.provider as JsonRpcProvider;
    const genesisConfig = await jsonRpcProvider.sendJsonRpc("EXPERIMENTAL_genesis_config", {});

   //  console.log(genesisConfig)
    const min_gas_price: string = genesisConfig.min_gas_price
    const max_gas_price: string = genesisConfig.max_gas_price
    const gas_limit: number = genesisConfig.gas_limit

    console.log('min_gas_price:', min_gas_price) // string
    console.log('max_gas_price:', max_gas_price) // string
    console.log('gas_limit:', gas_limit) // number
    // console.log('Current gas price:', gasPrice, 'yoctoNEAR');

    return { min_gas_price, max_gas_price, gas_limit}
}

module.exports = {callSmartContract, getCurrentGasPrice}