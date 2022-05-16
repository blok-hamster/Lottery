pragma solidity ^0.6.6;

import "@chainlink/contracts/src/v0.6/interfaces/AggregatorV3Interface.sol";
import "@chainlink/contracts/src/v0.6/vendor/SafeMathChainlink.sol";
import "@chainlink/contracts/src/v0.6/VRFConsumerBase.sol";

contract Lottery is VRFConsumerBase {
    using SafeMathChainlink for uint256;
    AggregatorV3Interface internal ethUsdPriceFeed;

    enum LotteryState{
        OPEN,
        CLOSE,
        CALCULATING_WINNING
    }
    
    LotteryState public lotteryState;
    uint public usdEntryFee;
    uint public _randomness;
    uint public fee;
    address payable[] public players;
    address public owner;
    address public recentWinner;
    bytes32 keyHash;

    event RequestedRandomness(bytes32 requestId);

    modifier onlyOwner {
        require(msg.sender == owner);
        _;
    }

    // VRFConsumerBase takes the vrfCoordinator and link token address as arguments
    constructor(address _ethUsdPriceFeed, uint _usdEntryFee, address _vrfCoordinator, address _link, bytes32 _keyHash) 
        public VRFConsumerBase(_vrfCoordinator, _link) {
            ethUsdPriceFeed = AggregatorV3Interface(_ethUsdPriceFeed);
            usdEntryFee = _usdEntryFee;
            lotteryState = LotteryState.CLOSE;
            owner = msg.sender;
            fee = 100000000000000000;
            keyHash = _keyHash;
    }

    function enter() public payable{
        require(msg.value >= getEntranceFee(), "Not Enough Eth to enter!");
        require(lotteryState == LotteryState.OPEN);
        players.push(msg.sender);
    }

    function getEntranceFee() public view returns(uint){
        uint precision = 1 * 10 ** 18;
        uint price = getLatestEthUsdPrice();
        uint costTEnter = (precision / price) * (usdEntryFee * 100000000);
        return costTEnter;
    }

    function getLatestEthUsdPrice() public view returns(uint){
        (
            uint80 roundID,
            int price,
            uint startedAt ,
            uint timeStamp ,
            uint80 answeredInRound
        ) = ethUsdPriceFeed.latestRoundData();
        return uint256(price);
    }

    function startLottery() public onlyOwner {
        require(lotteryState == LotteryState.CLOSE, "Lottery Currently Closed");
        lotteryState = LotteryState.OPEN;
        _randomness = 0;
    }

    function endLottery(uint _seed) public onlyOwner {
        require(lotteryState == LotteryState.OPEN, "You cant end lottery ay this time");
        lotteryState = LotteryState.CALCULATING_WINNING;
        pickWinner();
    }

    function pickWinner() private onlyOwner returns(bytes32) {
        require(lotteryState == LotteryState.CALCULATING_WINNING);
        bytes32 requestId = requestRandomness(keyHash, fee);
        emit RequestedRandomness(requestId);
    }

     function fulfillRandomness(bytes32 requestId, uint256 randomness) internal override {
        require(randomness > 0, "Random number not found");
        uint index = randomness % players.length;
        
        players[index].transfer(address(this).balance);
        recentWinner = players[index];
        players = new address payable[](0);
        lotteryState = LotteryState.CLOSE;
        _randomness = randomness;
    }

}
