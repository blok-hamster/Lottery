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
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PrivateKeyWalletSubprovider = void 0;
const assert_1 = require("@0x/assert");
const utils_1 = require("@0x/utils");
const common_1 = require("@ethereumjs/common");
const ethjsTx = require("@ethereumjs/tx");
const ethUtil = require("ethereumjs-util");
const types_1 = require("../types");
const chain_utils_1 = require("../utils/chain_utils");
const base_wallet_subprovider_1 = require("./base_wallet_subprovider");
// tslint is so confused by this file for some reason
// tslint:disable: indent align
/**
 * This class implements the [web3-provider-engine](https://github.com/MetaMask/provider-engine) subprovider interface.
 * This subprovider intercepts all account related RPC requests (e.g message/transaction signing, etc...) and handles
 * all requests with the supplied Ethereum private key.
 */
class PrivateKeyWalletSubprovider extends base_wallet_subprovider_1.BaseWalletSubprovider {
    /**
     * Instantiates a PrivateKeyWalletSubprovider.
     * @param privateKey The corresponding private key to an Ethereum address
     * @param chainId The chain ID. Defaults to 1 (mainnet).
     * @return PrivateKeyWalletSubprovider instance
     */
    constructor(privateKey, chainId = 1, hardfork) {
        assert_1.assert.isString('privateKey', privateKey);
        super();
        this._privateKeyBuffer = Buffer.from(ethUtil.stripHexPrefix(privateKey), 'hex');
        this._address = `0x${ethUtil.privateToAddress(this._privateKeyBuffer).toString('hex')}`;
        this._common = chain_utils_1.getCommonForChain(chainId, hardfork);
    }
    /**
     * Retrieve the account associated with the supplied private key.
     * This method is implicitly called when issuing a `eth_accounts` JSON RPC request
     * via your providerEngine instance.
     * @return An array of accounts
     */
    getAccountsAsync() {
        return __awaiter(this, void 0, void 0, function* () {
            return [this._address];
        });
    }
    /**
     * Sign a transaction with the private key. If you've added this Subprovider to your
     * app's provider, you can simply send an `eth_sendTransaction` JSON RPC request, and
     * this method will be called auto-magically. If you are not using this via a ProviderEngine
     * instance, you can call it directly.
     * @param txParams Parameters of the transaction to sign
     * @return Signed transaction hex string
     */
    signTransactionAsync(txParams) {
        return __awaiter(this, void 0, void 0, function* () {
            PrivateKeyWalletSubprovider._validateTxParams(txParams);
            if (txParams.from !== undefined && txParams.from.toLowerCase() !== this._address.toLowerCase()) {
                throw new Error(`Requested to sign transaction with address: ${txParams.from}, instantiated with address: ${this._address}`);
            }
            const tx = createTransactionObject(this._common, txParams).sign(this._privateKeyBuffer);
            const rawTx = `0x${tx.serialize().toString('hex')}`;
            return rawTx;
        });
    }
    /**
     * Sign a personal Ethereum signed message. The signing address will be calculated from the private key.
     * The address must be provided it must match the address calculated from the private key.
     * If you've added this Subprovider to your app's provider, you can simply send an `eth_sign`
     * or `personal_sign` JSON RPC request, and this method will be called auto-magically.
     * If you are not using this via a ProviderEngine instance, you can call it directly.
     * @param data Hex string message to sign
     * @param address Address of the account to sign with
     * @return Signature hex string (order: rsv)
     */
    signPersonalMessageAsync(data, address) {
        return __awaiter(this, void 0, void 0, function* () {
            if (data === undefined) {
                throw new Error(types_1.WalletSubproviderErrors.DataMissingForSignPersonalMessage);
            }
            assert_1.assert.isHexString('data', data);
            assert_1.assert.isETHAddressHex('address', address);
            if (address.toLowerCase() !== this._address.toLowerCase()) {
                throw new Error(`Requested to sign message with address: ${address}, instantiated with address: ${this._address}`);
            }
            const dataBuff = ethUtil.toBuffer(data);
            const msgHashBuff = ethUtil.hashPersonalMessage(dataBuff);
            const sig = ethUtil.ecsign(msgHashBuff, this._privateKeyBuffer);
            const rpcSig = ethUtil.toRpcSig(sig.v, sig.r, sig.s);
            return rpcSig;
        });
    }
    /**
     * Sign an EIP712 Typed Data message. The signing address will be calculated from the private key.
     * The address must be provided it must match the address calculated from the private key.
     * If you've added this Subprovider to your app's provider, you can simply send an `eth_signTypedData`
     * JSON RPC request, and this method will be called auto-magically.
     * If you are not using this via a ProviderEngine instance, you can call it directly.
     * @param address Address of the account to sign with
     * @param data the typed data object
     * @return Signature hex string (order: rsv)
     */
    signTypedDataAsync(address, typedData) {
        return __awaiter(this, void 0, void 0, function* () {
            if (typedData === undefined) {
                throw new Error(types_1.WalletSubproviderErrors.DataMissingForSignTypedData);
            }
            assert_1.assert.isETHAddressHex('address', address);
            if (address.toLowerCase() !== this._address.toLowerCase()) {
                throw new Error(`Requested to sign message with address: ${address}, instantiated with address: ${this._address}`);
            }
            const dataBuff = utils_1.signTypedDataUtils.generateTypedDataHash(typedData);
            const sig = ethUtil.ecsign(dataBuff, this._privateKeyBuffer);
            const rpcSig = ethUtil.toRpcSig(sig.v, sig.r, sig.s);
            return rpcSig;
        });
    }
}
exports.PrivateKeyWalletSubprovider = PrivateKeyWalletSubprovider;
/**
 * Create a transaction object based on the default network Common and transaction params.
 */
function createTransactionObject(common, txParams) {
    const normalizedTxParams = Object.assign(Object.assign({}, txParams), { gasLimit: txParams.gas });
    let effectiveHardfork = common.hardfork();
    // tslint:disable-next-line:custom-no-magic-numbers
    if (common.isActivatedEIP(1559)) {
        if (!normalizedTxParams.maxFeePerGas || !normalizedTxParams.maxPriorityFeePerGas) {
            // Use legacy transaction if neither new gas fields are present.
            effectiveHardfork = common_1.Hardfork.Berlin;
        }
    }
    let tx;
    if (effectiveHardfork === common_1.Hardfork.London) {
        const { gasPrice: _gasPrice } = normalizedTxParams, txWithoutGasPrice = __rest(normalizedTxParams, ["gasPrice"]);
        tx = ethjsTx.FeeMarketEIP1559Transaction.fromTxData(txWithoutGasPrice, { common });
    }
    else if (effectiveHardfork === common_1.Hardfork.Berlin && normalizedTxParams.accessList) {
        tx = ethjsTx.AccessListEIP2930Transaction.fromTxData(normalizedTxParams, { common });
    }
    else {
        tx = ethjsTx.Transaction.fromTxData(normalizedTxParams, { common });
    }
    return tx;
}
//# sourceMappingURL=private_key_wallet.js.map