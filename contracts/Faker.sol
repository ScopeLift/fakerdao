pragma solidity ^0.5.0;

/**
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

  // Variables for managing phases
  uint256 public deploymentTime; // needed to determine the current period
  uint256 public periodLength; // default 1 day
  uint256 constant shiftPhaseLength = 1;    // default 1 periods
  uint256 constant auctionPhaseLength = 1;  // default 1 periods
  uint256 constant phaseLength = 7;   // default 7 periods
  uint256 public votingPhaseLength; // TODO delete this

  // Variables for managing deposits
  uint256 public totalDeposited;
  address[] public depositors;
  mapping (address => uint256) public balances;

  // Variables for managing bidders
  struct Bid {
    address bidder;
    uint256 amount;
  }
  mapping (uint256 => Bid) public bids; // mapping of phase number to current leading bid
  mapping (address => uint256) public refundAmount; // mapping of addresses to their available refund

  constructor(uint256 _periodLength) public {
    // TODO do the below setup here?
    // "Welcome to the governance voting dashboard Before you can get started voting
    // you will need to set up a voting contract -- Set up now"

    deploymentTime = now;
    periodLength = _periodLength;
  }

  function submitBid(uint256 _useRefundAmount) external payable {
    // Get phase and current bid info
    (bool _isAuctionActive, uint256 _auctionPhase) = getCurrentAuctionPhase();
    require(_isAuctionActive, "Faker: No auction is ongoing");
    Bid memory _leadingBid = bids[_auctionPhase];

    // Make sure bidder refund inclusion amount is valid
    require(_useRefundAmount <= refundAmount[msg.sender], "Faker: Refund input too high");

    // Adjust refund available to the losing bidder (they are still leading bidder)
    refundAmount[_leadingBid.bidder] = refundAmount[_leadingBid.bidder].add(_leadingBid.amount);

    // Adjust refund available to the new winning bidder
    refundAmount[msg.sender] = refundAmount[msg.sender].sub(_useRefundAmount);

    // Calculate total bid amount of sender and update bid
    uint256 _bidAmount = msg.value.add(_useRefundAmount);
    require(_bidAmount > _leadingBid.amount, "Faker: Bid is less than current leader");
    bids[_auctionPhase] = Bid(msg.sender, _bidAmount); // update leading bid for current phase
  }

  function claimRefund() external {
    // Prevent calling if no refund is available
    uint256 _refundAmount = refundAmount[msg.sender];
    require(_refundAmount > 0, "Faker: No refund available for caller");

    // Update state
    refundAmount[msg.sender] = 0;

    msg.sender.transfer(_refundAmount);
  }

  function submitVote() external {
  }

  function deposit(uint256 _mkrAmount) external {
    // TODO
    require(_mkrAmount > 0, "Faker: Deposit amount must be greater than zero");
    // User must approve this contract to spend their MKR
    // Transfer MKR from the user to this contract
    // mkrContract.transferFrom(msg.sender, address(this), _mkrAmount);
    // MKR address: 0x9f8F72aA9304c8B593d555F12eF6589cC3A579A2

    // Update their MKR balance
    totalDeposited.add(_mkrAmount);
    balances[msg.sender].add(_mkrAmount);

    // Add user to list of all depositors
    if (balances[msg.sender] == 0) {
      depositors.push(msg.sender);
    }
  }


  // ======================================== Helpers ========================================
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

  // BELOW THIS IS OUTDATED!
  function getCurrentVotingPhase() public view returns (bool isVoteActive, uint256 votePhase) {
    uint256 _period = getCurrentPeriod();

    // If we are in the first two days after deployment, voting has not yet started
    if (_period < auctionPhaseLength) {
      return (false, 0);
    }

    // Otherwise, return the current voting phase number
    uint256 _phase = _period.sub(auctionPhaseLength).div(votingPhaseLength);
    return (true, _phase);
  }

  function getCurrentAuctionPhase() public view returns (bool isAuctionActive, uint256 auctionPhase) {
     // If we are in the first two days after deployment, this is the first auction period
    (bool _isVotingActive, uint256 _votingPhase) = getCurrentVotingPhase();
    if (!_isVotingActive) {
      return (true, 0);
    }

    uint256 _period = getCurrentPeriod();
    // If modulus day, we are in an auction phase
    uint256 _modulusResult = _period % votingPhaseLength;
    bool _isModulusDay = _modulusResult < auctionPhaseLength;

    return (_isModulusDay, _votingPhase + 1);
  }

}