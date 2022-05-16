const Lottery = artifacts.require('Lottery')
const {LinkToken} = require('@chainlink/contracts/src/v0.4/LinkToken.sol')

module.exports = async (deployer, network, accounts) => {
  
        const KOVAN_KEYHASH = '0x6c3699283bda56ad74f6b855546325b68d482e983852a7a82979cc4807b641f4'
        const KOVAN_VRF_COORDINATOR = '0xdD3782915140c8f3b190B5D67eAc6dc5760C46E9'
        const ETH_USD_PRICE_FEED = '0x9326BFA02ADD2366b30bacB125260Af641031331'
        const KOVAN_LINK_TOKEN = '0xC843F43093f8d32c01a065ed2a0a34fb54BAaf3F'
        deployer.deploy(Lottery, ETH_USD_PRICE_FEED, KOVAN_VRF_COORDINATOR, KOVAN_LINK_TOKEN, KOVAN_KEYHASH)
  
}
