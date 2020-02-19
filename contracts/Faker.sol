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
 */

import "@openzeppelin/contracts-ethereum-package/contracts/math/SafeMath.sol";

contract Faker {
  using SafeMath for uint256;

  uint256 public totalDeposited;
  address[] public depositors;
  mapping (address => uint256) public balances;

  address winningBidder;

  constructor() {
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

}