pragma solidity ^0.5.0;

/**
 * PHASES
 * Shift: This is the only time MKR can be deposited or withdrawn
 * Auction: All bidding happens here, MKR is locked, no deposits/withdraws
 * Voting: Remaining 5 days, MKR is locked (i.e. no deposits/withdraws), earnings withdrawn here
 *
 * SAME TIMELINE USING DEFAULT PERIOD LENGTH
 *
 *        Phase    isShift    isAuction
 *     M    0         Y
 *     T    0                     Y
 *     W    0
 *     R    0
 *     F    0
 *     S    0
 *     S    0
 *     ----------------------------------
 *     M    1         Y
 *     T    1                     Y
 *     W    1
 *     R    1
 *     F    1
 *     S    1
 *     S    1
*/

import "@openzeppelin/contracts-ethereum-package/contracts/math/SafeMath.sol";
import "@openzeppelin/contracts-ethereum-package/contracts/token/ERC20/IERC20.sol";
import "./IChief.sol";

contract Faker {
    using SafeMath for uint256;

    // Token contracts
    IERC20 public mkrContract;
    IERC20 public bidToken;

    // Governance contract
    IChief public chiefContract;

    // Variables for managing phases
    uint256 public deploymentTime; // needed to determine the current period
    uint256 public periodLength; // 1 day
    uint256 constant phaseLength = 7; // 7 periods

    // Variables for managing deposits
    struct Deposit {
        uint256 amount; // amount of maker user contributes
        uint256 phase; // phase when contribution added
    }
    mapping(address => Deposit) public makerDeposits;
    uint256 public totalMaker;

    // Variables for managing earnings
    mapping(address => mapping(uint256 => bool)) phaseEarningWithdrawals;

    // Variables for managing bids
    struct Bid {
        address bidder;
        uint256 amount;
        uint256 makerAmount; // amount of maker being bid on
    }
    mapping(uint256 => Bid) public bids; // phase number => Bid

    // Events
    event MakeDeposit(address indexed depositer, uint256 indexed phase, uint256 indexed amount);
    event WithdrawDeposit(address indexed withdrawer, uint256 indexed phase, uint256 indexed amount);
    event SubmitBid(address indexed bidder, uint256 indexed phase, uint256 indexed amount);
    event ChangeVote(address indexed voter, uint256 indexed phase, bytes32 indexed slate);
    event WithdrawEarnings(address indexed withdrawer, uint256 indexed earnedPhase, uint256 indexed amount);

    constructor(uint256 _periodLength, address _bidTokenAddress) public {
        deploymentTime = now;
        periodLength = _periodLength;
        bidToken = IERC20(_bidTokenAddress);
        chiefContract = IChief(0xbBFFC76e94B34F72D96D054b31f6424249c1337d);
        mkrContract = IERC20(chiefContract.GOV());

        // Approve Chief to spend our Maker and IOU
        require(
            mkrContract.approve(address(chiefContract), uint256(-1)),
            "Faker: MKR approval failed"
        );

        IERC20 _iouContract = IERC20(chiefContract.IOU());
        require(
            _iouContract.approve(address(chiefContract), uint256(-1)),
            "Faker: IOU approval failed"
        );

        // Default slate upon deployment will be current leading candidate
        bytes32 _defaultSlate = 0xf2259bb710658f0bfccd4ec5e838ee9a64979b9491d9d74d45639610f2579fa8;
        chiefContract.vote(_defaultSlate);
    }

    // ========================================= Shift Phase =========================================

    function deposit(uint256 _mkrAmount) external onlyShift() {
        // Depositor must approve this contract to spend their MKR
        // MKR address: 0x9f8F72aA9304c8B593d555F12eF6589cC3A579A2
        require(_mkrAmount > 0, "Faker: Deposit amount must be greater than zero");

        // Update state
        uint256 _newDeposit = makerDeposits[msg.sender].amount.add(_mkrAmount);
        uint256 _currentPhase = getCurrentPhase();
        makerDeposits[msg.sender] = Deposit(_newDeposit, _currentPhase);
        totalMaker += _mkrAmount;

        // Transfer MKR from the user to this contract
        require(
            mkrContract.transferFrom(msg.sender, address(this), _mkrAmount),
            "Faker: Transfer Failed During Deposit"
        );

        // Move Maker to the current slate
        chiefContract.lock(_mkrAmount);

        emit MakeDeposit(msg.sender, _currentPhase, _mkrAmount);
    }

    function withdrawMaker() external onlyShift() {
        // Always require user to withdraw all Maker
        uint256 _balance = makerDeposits[msg.sender].amount;
        require(_balance > 0, "Faker: Caller has no deposited Maker");

        // Update state
        delete makerDeposits[msg.sender];
        totalMaker -= _balance;

        // Move Maker off the current slate
        chiefContract.free(_balance);

        // Transfer MKR from the contract to the user
        require(
            mkrContract.transfer(msg.sender, _balance),
            "Faker: Transfer Failed During Withdraw"
        );

        emit WithdrawDeposit(msg.sender, getCurrentPhase(), _balance);
    }

    // ======================================== Auction Phase ========================================

    function submitBid(uint256 _bidAmount) external onlyAuction() {
        // Bidder must approve this contract to spend their token
        require(_bidAmount > 0, "Faker: Bid amount must be greater than zero");

        uint256 _phase = getCurrentPhase();
        require(_bidAmount > bids[_phase].amount, "Faker: Bid is not above leading bid");

        // Update state
        Bid memory _previousBid = bids[_phase];

        bids[_phase].bidder = msg.sender;
        bids[_phase].amount = _bidAmount;
        bids[_phase].makerAmount = totalMaker;

        // Refund old bidder
        if (_previousBid.bidder != address(0)) {
            require(
                bidToken.transfer(_previousBid.bidder, _previousBid.amount),
                "Faker: Bid transfer could not be completed"
            );
        }

        // Transfer tokens from the user to this contract
        require(
            bidToken.transferFrom(msg.sender, address(this), _bidAmount),
            "Faker: Bid transfer could not be completed"
        );

        emit SubmitBid(msg.sender, _phase, _bidAmount);
    }

    // ======================================== Voting Phase ========================================

    function voteByAddresses(address[] calldata _yays) external onlyWinner returns (bytes32) {
        // Create a slate and vote for it
        bytes32 _slate = chiefContract.vote(_yays);
        emit ChangeVote(msg.sender, getCurrentPhase(), _slate);
        return _slate;
    }

    function voteBySlate(bytes32 _slate) external onlyWinner {
        // Vote for an existing slate
        emit ChangeVote(msg.sender, getCurrentPhase(), _slate);
        chiefContract.vote(_slate);
    }

    function withdrawEarnings(uint256[] calldata _phases) external {
        // Whenever you add or withdraw maker, you withdraw earnings
        for (uint256 i = 0; i < _phases.length; i++) {
            withdrawPhaseEarnings(_phases[i]);
        }
    }

    function withdrawPhaseEarnings(uint256 _phase) internal {
        uint256 _depositPhase = makerDeposits[msg.sender].phase;
        require(_phase >= _depositPhase, "Faker: Not Eligible For Earnings In This Phase");

        uint256 _currentPhase = getCurrentPhase();
        require(_phase <= _currentPhase, "Faker: Phase Is In Future");
        require(
            !hasWithdrawnEarnings(msg.sender, _phase),
            "Faker: Earnings For Phase Already Withdrawn"
        );

        bool isCurrentPhase = _phase == _currentPhase;
        bool isAfterAuction = ((!isShift()) && (!isAuction()));
        require(
            (!isCurrentPhase) || isAfterAuction,
            "Faker: Earnings For Phase Not Yet Withdrawable"
        );

        recordEarningsWithdrawal(msg.sender, _phase);
        uint256 _earnings = makerDeposits[msg.sender].amount
            .mul(bids[_phase].amount)
            .div(bids[_phase].makerAmount);

        require(bidToken.transfer(msg.sender, _earnings), "Faker: Earnings Transfer Failed");

        emit WithdrawEarnings(msg.sender, _depositPhase, _earnings);
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

    function recordEarningsWithdrawal(address _depositor, uint256 _phase) internal {
        phaseEarningWithdrawals[_depositor][_phase] = true;
    }

    function hasWithdrawnEarnings(address _depositor, uint256 _phase) public view returns (bool) {
        return phaseEarningWithdrawals[_depositor][_phase];
    }

    modifier onlyShift() {
        require(isShift(), "Faker: Not Shift Period");
        _;
    }

    modifier onlyAuction() {
        require(isAuction(), "Faker: Not Auction Period");
        _;
    }

    modifier onlyWinner() {
        uint256 _phase = getCurrentPhase();
        require(msg.sender == bids[_phase].bidder, "Faker: Not Auction Winner");
        _;
    }
}
