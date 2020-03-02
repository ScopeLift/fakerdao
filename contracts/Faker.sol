pragma solidity ^0.5.0;

/**
 * NOTES
 *
 *   - Chief.hat() contains the address of the current chief (e.g. the winning contract)
 *   - Chief.slates() contains sets of candidates
 *   - When you lock GOV tokens for voting, you receive IOU tokens in return
 *   - To vote:
 *       - First choose a slate with `DSChief.vote(slate)` OR `DSChief.vote(address[])`
 *       - Then call `DSChief.lock(wad)`
 *   - To change vote:
 *       -
 *   - To remove vote, call `DSChief.free(wad)`
 *
 * WORKFLOW
 * Stakeholder = Users who deposit MKR
 *
 *  - Phases
 *      - Shift: This is the only time MKR can be deposited or withdrawn
 *      - Auction: All bidding happens here, MKR is locked, no deposits/withdraws
 *      - Voting: Remaining 5 days, MKR is locked, no deposits/withdraws, earnings withdrawn here
 *
 * ARCHITECTURE
 * Roles: Depositor, Winner, Bidders -- defined in contract, e.g. onlyDepositors, onlyWinner, onlyBidders

 *

     Phase    isShift    isAuction
 M    0         Y
 T    0                     Y
 W    0
 R    0
 F    0
 S    0
 S    0
 ----------------------------------
 M    1         Y
 T    1                     Y
 W    1
 R    1
 F    1
 S    1
 S    1
*/


import "@openzeppelin/contracts-ethereum-package/contracts/math/SafeMath.sol";
import "@openzeppelin/contracts-ethereum-package/contracts/token/ERC20/IERC20.sol";

// import Roles.sol
// import PullPayment.sol

contract Faker {
  using SafeMath for uint256;

  // Token contracts
  IERC20 public mkrContract;
  IERC20 public bidToken;

  // Variables for managing phases
  uint256 public deploymentTime; // needed to determine the current period
  uint256 public periodLength; // 1 day
  uint256 constant phaseLength = 7;   // 7 periods
  uint256 constant shiftPhaseLength = 1;    // 1 periods
  uint256 constant auctionPhaseLength = 1;  // 1 periods

  // Variables for managing deposits
  mapping (address => uint256) public makerDeposits;

  // Variables for managing bids
  struct Bid {
    address Bidder;
    uint256 amount;
  }
  mapping (uint256 => Bid) public bids;


  constructor(uint256 _periodLength, address _mkrAddress, address _bidTokenAddress) public {
    // TODO do the below setup here?
    // "Welcome to the governance voting dashboard Before you can get started voting
    // you will need to set up a voting contract -- Set up now"

    deploymentTime = now;
    periodLength = _periodLength;
    mkrContract = IERC20(_mkrAddress);
    bidToken = IERC20(_bidTokenAddress);
  }

  // ========================================= Shift Phase =========================================

  function deposit(uint256 _mkrAmount) external onlyShift() {
    // Depositor must approve this contract to spend their MKR
    // MKR address: 0x9f8F72aA9304c8B593d555F12eF6589cC3A579A2
    require(_mkrAmount > 0, "Faker: Deposit amount must be greater than zero");

    // Update state
    makerDeposits[msg.sender] = makerDeposits[msg.sender].add(_mkrAmount);

    // TODO move Maker to the current slate

    // Transfer MKR from the user to this contract
    require(
      mkrContract.transferFrom(msg.sender, address(this), _mkrAmount),
      "Faker: Transfer Failed During Deposit"
    );
  }

  function withdrawMaker() external onlyShift() {
    // Always require user to withdraw all Maker
    uint256 _balance = makerDeposits[msg.sender];
    require(_balance > 0, "Faker: Caller has no deposited Maker");

    // Update state
    makerDeposits[msg.sender] = 0;

    // TODO move Maker off the current slate

    // Transfer MKR from the contract to the user
    require(
      mkrContract.transfer(msg.sender, _balance),
      "Faker: Transfer Failed During Withdraw"
    );
  }

  // ======================================== Auction Phase ========================================

  function submitBid(uint256 _bidAmount) external onlyAuction() {
    // Bidder must approve this contract to spend their token
    require(_bidAmount > 0, "Faker: Bid amount must be greater than zero");

    // require (_bidAmount > current bid amount)

    // Transfer token from the user to this contract
    // require(
    //   bidToken.transferFrom(msg.sender, address(this), uint256 _bidAmount),
    //   "Faker: Bid transfer could not be completed"
    // );

    // refund old bidder

    // set new leading bidder
  }



  // =========================================== Helpers ===========================================

  function getCurrentPeriod() public view returns (uint256) {
    // If periodLength = 1 day, this returns day number
    return now.sub(deploymentTime).div(periodLength);
  }

  function getCurrentPhase() public view returns (uint256) {
    return getCurrentPeriod().div(phaseLength);
  }

  function isShift() public view returns (bool) {
    return (getCurrentPeriod() % phaseLength == 0);
  }

  function isAuction() public view returns (bool) {
    return (getCurrentPeriod() % phaseLength == 1);
  }

  modifier onlyShift() {
    require(isShift(), "Faker: Not Shift Period");
    _;
  }

  modifier onlyAuction() {
    require(isAuction(), "Faker: Not Auction Period");
    _;
  }
}