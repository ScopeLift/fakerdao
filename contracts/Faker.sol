pragma solidity ^0.5.0;

/**
 * QUESTIONS
 *
 *   1. What does this do exactly?
 *       "Welcome to the governance voting dashboard Before you can get started voting
 *        you will need to set up a voting contract -- Set up now"
 *
 * NOTES
 *
 *   - Chief.hat() contains the address of the current cheif (e.g. the winning contract)
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
 *      - Auction: 2 days
 *          - MKR floor is locked (i.e. no withdraws)
 *          - Deposits are allowed
 *          - Bids are accepted in Ether
 *              - If Ether, refunds as pull payment. If ERC20/ETH, just transfer token
 *      - Voting: Rolling 1 week period
 *          - Winning bidder can do whatever they want with MKR or MKR is committed to pre-determined slate
 *          - No MKR withdrawals allowed
 *          - MKR deposits are held until next auction
 *          - Pull payments allowed -- What if user doesn't withdraw? Track state, or do they lose payment?
 *
 * ARCHITECTURE
 * Roles: Depositor, Winner, Bidders -- defined in contract, e.g. onlyDepositors, onlyWinner, onlyBidders

 *
     Auction    Vote
 M    0
 T    0
 W              0
 R              0
 F              0
 S              0
 S              0
 ------------------------
 M    1         0
 T    1         0
 W              1
 R              1
 F              1
 S              1
 S              1

 */

import "@openzeppelin/contracts-ethereum-package/contracts/math/SafeMath.sol";
// import Roles.sol
// import PullPayment.sol

contract Faker {
  using SafeMath for uint256;

  // Variables for managing phases
  uint256 public deploymentTime; // needed to determine the current period
  uint256 public periodLength; // default 1 day
  uint256 public votingPhaseLength; // default 7 periods
  uint256 public auctionPhaseLength; // default 2 periods

  // Variables for managing deposits
  uint256 public totalDeposited;
  address[] public depositors;
  mapping (address => uint256) public balances;

  // Variables for managing auction winner
  address winningBidder;

  constructor(uint256 _periodLength, uint256 _votingPhaseLength, uint256 _auctionPhaseLength) {
    require(_auctionPeriods <= _votingPeriods, "Faker: Auction period duration must be <= voting period duration");

    deploymentTime = now;
    votingPhaseLength = _votingPeriods;
    auctionPhaseLength = _auctionPeriods;

    require(auctionPhaseLength.mul(_periodLength) <= 1 weeks, "Faker: Auction period duration must be less than 1 week");
  }

  function submitBid() external {
  }

  function submitVote() external {
  }

  function deposit(uint256 _mkrAmount) external {
    require(_mkrAmount > 0, "Faker: Deposit amount must be greater than zero");
    // User must approve this contract to spend their MKR
    // Transfer MKR from the user to this contract
    mkrContract.transferFrom(msg.sender, address(this), _mkrAmount);

    // Update their MKR balance
    totalDeposited.add(_mkrAmount);
    balances[msg.sender].add(_mkrAmount);

    // Add user to list of all depositors
    if (balances[msg.sender] == 0) {
      depositors.push(msg.sender);
    }
  }

  function claimPayout() external {
  }


  // ======================================== Helpers ========================================
  function getCurrentPeriod() public view returns (uint256) {
    // If periodLength = 1 day, this returns day number
    return now.sub(deploymentTime).div(periodLength);
  }

  function getCurrentVotingPhase() public view returns (bool, uint256) {
    uint256 _period = getCurrentPeriod()

    // If we are in the first two days after deployment, voting has not yet started
    if (_period <= auctionPhaseLength) {
      return (false, 0);
    }

    // Otherwise, return the current voting phase number
    uint256 _phase = _period.div(votingPhaseLength);
    return (true, _phase);
  }

  function getCurrentAuctionPhase() public view returns (bool, uint256) {
     // If we are in the first two days after deployment, this is the first auction period
    (bool _isVotingActive, uint256 _votingPhase) = getCurrentVotingPhase();
    if (!_isVotingActuve) {
      return (true, 0);
    }

    uint256 _period = getCurrentPeriod();
    // If modulus day, we are in an auction phase
    // TODO unhardcode the 7 and 8 based on votingPhaseLength, auctionPhaseLength
    bool _isModulusDay = ( (_period % 7 == 0) || (_period % 8 == 0) );
    return (_isModulusDay, _vothingPhase + 1);
  }

}