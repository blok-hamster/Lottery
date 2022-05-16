"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCommonForChain = void 0;
const common_1 = require("@ethereumjs/common");
function createCommonFork(chainId, fork = common_1.Hardfork.Istanbul) {
    return common_1.default.custom({
        chainId,
        name: `common-${fork}-${chainId}`,
        defaultHardfork: fork,
    }, {
        baseChain: common_1.Chain.Mainnet,
    });
}
// tslint:disable: indent
const DEFAULT_COMMON_BY_CHAIN_ID = {
    [common_1.Chain.Mainnet]: createCommonFork(common_1.Chain.Mainnet, common_1.Hardfork.London),
    [common_1.Chain.Ropsten]: createCommonFork(common_1.Chain.Ropsten, common_1.Hardfork.London),
    [common_1.Chain.Rinkeby]: createCommonFork(common_1.Chain.Rinkeby, common_1.Hardfork.London),
    [common_1.Chain.Kovan]: createCommonFork(common_1.Chain.Kovan, common_1.Hardfork.Berlin),
    '1337': createCommonFork(1337, common_1.Hardfork.Istanbul),
};
/**
 * Create a Common instance given a chainId and optional hardfork.
 */
function getCommonForChain(chainId, hardfork) {
    return hardfork || !DEFAULT_COMMON_BY_CHAIN_ID[chainId]
        ? createCommonFork(chainId, hardfork)
        : DEFAULT_COMMON_BY_CHAIN_ID[chainId];
}
exports.getCommonForChain = getCommonForChain;
//# sourceMappingURL=chain_utils.js.map