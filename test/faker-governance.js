const { time, expectRevert, constants, send, ether } = require("@openzeppelin/test-helpers");
const Faker = artifacts.require("Faker");
const TestToken = artifacts.require("TestToken");
const IERC20 = artifacts.require("IERC20");
const IChief = artifacts.require("IChief");

// const mkrAddress = "0x9f8F72aA9304c8B593d555F12eF6589cC3A579A2"; // GOV mainnent
const mkrAddress = "0xAaF64BFCC32d0F15873a02163e7E500671a4ffcD"; // GOV kovan
// const iouAddress = "0x496c67a4ced9c453a60f3166ab4b329870c8e355"; // IOU (Locked GOV)
// const chiefAddress = "0x9eF05f7F6deB616fd37aC3c959a2dDD25A54E4F5"; // mainnet
const chiefAddress = "0xbBFFC76e94B34F72D96D054b31f6424249c1337d"; // kovan
const exchangeAddress = process.env.EXCHANGE_ADDRESS;

contract("Faker Governance", accounts => {
  let instance = null;
  let makerInstance = null;
  let chiefInstance = null;
  let bidTokenInstance = null;
  let periodLength = null;
  const utils = web3.utils;
  const toWei = utils.toWei;
  const BN = utils.BN;
  let initialVoteCount = null;

  const depositor1 = accounts[1];
  const depositor2 = accounts[2];
  const depositor3 = accounts[5];
  const bidder1 = accounts[3];
  const bidder2 = accounts[4];

  before(async () => {
    // Send Ether to a16z MKR address
    await send.ether(accounts[0], exchangeAddress, ether("1"));

    // Deploy Bid Token (e.g. WETH)
    bidTokenInstance = await TestToken.new();

    // Get Maker & Chief Instance
    makerInstance = await IERC20.at(mkrAddress);
    chiefInstance = await IChief.at(chiefAddress);

    // defaultSlate = 0x9fcc2b823274b6d91dea0a59083969eb2b3bc41539bd9908df30e141a690b23e
    // This slate has one candidate of 0xd24fbbb4497ad32308bda735683b55499ddc2cad
    // So, really we check that the candidate has 0 votes

    initialVoteCount = await chiefInstance.approvals("0xafb2bb6255d981953eddb2896a15a84dbd8d032e");

    // Deploy Faker
    instance = await Faker.new(24 * 60 * 60, bidTokenInstance.address);
    periodLength = await instance.periodLength();

    // Send bid tokens to bidders
    await bidTokenInstance.mint(bidder1, toWei("100", "ether"));
    await bidTokenInstance.mint(bidder2, toWei("100", "ether"));

    // Get Maker Tokens
    await makerInstance.transfer(depositor1, toWei("1000", "ether"), { from: exchangeAddress });
    await makerInstance.transfer(depositor2, toWei("1000", "ether"), { from: exchangeAddress });
    await makerInstance.transfer(depositor3, toWei("1000", "ether"), { from: exchangeAddress });

    // Approve Faker instance to spend Maker & Bid Token
    await makerInstance.approve(instance.address, constants.MAX_UINT256, { from: depositor1 });
    await makerInstance.approve(instance.address, constants.MAX_UINT256, { from: depositor2 });
    await makerInstance.approve(instance.address, constants.MAX_UINT256, { from: depositor3 });
    await bidTokenInstance.approve(instance.address, constants.MAX_UINT256, { from: bidder1 });
    await bidTokenInstance.approve(instance.address, constants.MAX_UINT256, { from: bidder2 });
  });

  it("should find the contract instances", async () => {
    assert(instance.address.startsWith("0x"), "Faker deployment not found");
    assert(bidTokenInstance.address.startsWith("0x"), "Bid Token deployment not found");
    assert(exchangeAddress.startsWith("0x"), "Exchange address not found in .env file");
    assert.equal(mkrAddress, makerInstance.address, "Maker deployment not found");
    assert.equal(chiefAddress, chiefInstance.address, "Chief address not found");
  });

  // PERIOD 0

  it("should place new deposits on the currently selected slate", async () => {
    // Deposit Maker
    await instance.deposit(toWei("100", "ether"), { from: depositor1 });
    const expectedFinalCount = initialVoteCount.add(new BN(toWei("100", "ether")));

    // Check that defaultSlate candidate has > 0 votes
    const finalVoteCount = await chiefInstance.approvals("0xafb2bb6255d981953eddb2896a15a84dbd8d032e");
    assert.equal(finalVoteCount.toString(), expectedFinalCount, "Unexpected vote count");
  });

  // PERIOD 1

  it("advance time and submit bid", async () => {
    await time.increase(periodLength);
    await instance.submitBid(toWei("10", "ether"), { from: bidder1 });
  });

  // PERIOD 2

  it("should advance time", async () => {
    await time.increase(periodLength);
  });

  it("should not let a non-winning bidder update the slate", async () => {
    await expectRevert(
      instance.voteByAddresses([constants.ZERO_ADDRESS], { from: bidder2 }),
      "Faker: Not Auction Winner"
    );
    await expectRevert(
      instance.voteBySlate(
        "0x85c5658262531e9d211c409678dedece8322d82e625e8207d38bdccda0bd4dc2",
        { from: bidder2 }
      ),
      "Faker: Not Auction Winner"
    );
  });

  it("should allow the winning bidder to change the slate", async () => {
    // The below slate contains just one candidate address
    const newSlate = "0x3acfefd63eeb87b18e75b288312910175eb2a866d55da514806ff7e2f03368e5";
    const newCandidate = "0x182230e9370248b0948d604845d382b969ce1830";
    const initialApprovalCount = await chiefInstance.approvals(newCandidate);

    await instance.voteBySlate(newSlate, { from: bidder1 });

    const updatedApprovalCount = await chiefInstance.approvals(newCandidate);
    const approvalChange = updatedApprovalCount.sub(initialApprovalCount);

    assert.equal(approvalChange.toString(), toWei("100", "ether"), "Unexpected approval count");
  });

  it("should allow the winning bidder to create a new slate", async () => {
    await instance.voteByAddresses([instance.address], { from: bidder1 });
    const approvalCount = await chiefInstance.approvals(instance.address);
    assert.equal(approvalCount, toWei("100", "ether"), "Unexpected approval count");
  });

  // PERIOD 7

  it("should advance time", async () => {
    await time.increase(5 * periodLength);
  });

  it("should allow withdrawing Maker and remove it from the selected slate", async () => {
    await instance.withdrawMaker({ from: depositor1 });
    const expectedFinalCount = initialVoteCount;

    const finalVoteCount = await chiefInstance.approvals("0xafb2bb6255d981953eddb2896a15a84dbd8d032e");
    assert.equal(finalVoteCount.toString(), expectedFinalCount, "Unexpected vote count");
  });

  after(async () => {
    let balance = await makerInstance.balanceOf(depositor1);
    await makerInstance.transfer(exchangeAddress, balance, { from: depositor1 });

    balance = await makerInstance.balanceOf(depositor2);
    await makerInstance.transfer(exchangeAddress, balance, { from: depositor2 });

    balance = await makerInstance.balanceOf(depositor3);
    await makerInstance.transfer(exchangeAddress, balance, { from: depositor3 });
  });
});
