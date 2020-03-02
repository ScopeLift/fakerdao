const { time, expectRevert, constants } = require("@openzeppelin/test-helpers");
// time docs: https://docs.openzeppelin.com/test-helpers/0.5/api#time

const Faker = artifacts.require("Faker");
const TestToken = artifacts.require("TestToken");

contract("Faker", accounts => {
  let instance = null;
  let makerInstance = null;
  let bidTokenInstance = null;
  let periodLength = null;
  const utils = web3.utils;
  const toWei = utils.toWei;
  const BN = utils.BN;

  const depositor1 = accounts[1];
  const depositor2 = accounts[2];

  const bidder1 = accounts[3];
  const firstBidAmount = toWei("1", "ether");
  const invalidRefundUseAmount = toWei("1.1", "ether");
  const bidAdditionAmount = toWei("0.51", "ether");
  const winningBidAmount = toWei("1.51", "ether");

  const bidder2 = accounts[4];
  const secondBidAmount = toWei("0.5", "ether");
  const thirdBidAmount = toWei("1.5", "ether");

  before(async () => {
    // Deploy Faker
    instance = await Faker.deployed();
    periodLength = await instance.periodLength();

    // Get mock Maker token and send tokens to the bidders
    let makerAddr = await instance.mkrContract();
    makerInstance = await TestToken.at(makerAddr);
    await makerInstance.mint(depositor1, toWei("1000", "ether"));
    await makerInstance.mint(depositor2, toWei("1000", "ether"));

    // Get mock bid token instance
    let bidTokenAddr = await instance.bidToken();
    bidTokenInstance = await TestToken.at(bidTokenAddr);
    await bidTokenInstance.mint(bidder1, toWei("100", "ether"));
    await bidTokenInstance.mint(bidder2, toWei("100", "ether"));

    // Approve Faker instance to spend Maker
    await makerInstance.approve(instance.address, constants.MAX_UINT256, {from: depositor1});
    await makerInstance.approve(instance.address, constants.MAX_UINT256, {from: depositor2});
    await bidTokenInstance.approve(instance.address, constants.MAX_UINT256, {from: bidder1});
    await bidTokenInstance.approve(instance.address, constants.MAX_UINT256, {from: bidder2});
  });

  it("should find the contract instances", async () => {
    assert(instance.address.startsWith("0x"), "Faker deployment not found");
    assert(makerInstance.address.startsWith("0x"), "Maker deployment not found");
  });

  it('should initialize the bidders balances with Maker', async() => {
    const depositor1Balance = await makerInstance.balanceOf(depositor1);
    assert.equal(depositor1Balance, toWei("1000", "ether"), "Invalid depositor balance");
    const depositor2Balance = await makerInstance.balanceOf(depositor2);
    assert.equal(depositor2Balance, toWei("1000", "ether"), "Invalid depositor balance");
  });

  // PERIOD 0

  it("should not allow bidding in period 0", async () => {
    await expectRevert(
      instance.submitBid(toWei("10", "ether"), {from: bidder1}),
      "Faker: Not Auction Period"
    );
  });

  // PERIOD 1

  it("should increase time to period 1", async () => {
    await time.increase(periodLength);
  });

  it("should not allow a zero amount bid", async () => {
    await expectRevert(
      instance.submitBid(toWei("0", "ether"), {from: bidder1}),
      "Faker: Bid amount must be greater than zero"
    );
  });

  it("should allow a user to submit a bid in period 1", async () => {
    await instance.submitBid(toWei("10", "ether"), {from: bidder1});

    let leadingBid = await instance.bids("0");
    let contractBalance = await bidTokenInstance.balanceOf(instance.address);

    assert.equal(toWei("10", "ether"), contractBalance, "Unexpected Balance");
    assert.equal(leadingBid.bidder, bidder1, "Unexpected bidder");
    assert.equal(leadingBid.amount, toWei("10", "ether"), "Unexpected amount");
  });

  it("should not allow a bid for less than the previous bid", async () => {
    await expectRevert(
      instance.submitBid(toWei("9", "ether"), {from: bidder2}),
      "Faker: Bid is not above leading bid"
    );
  });

  it("should allow the current leader to increase their bid", async () => {
    await instance.submitBid(toWei("11", "ether"), {from: bidder1});

    let leadingBid = await instance.bids("0");
    let contractBalance = await bidTokenInstance.balanceOf(instance.address);

    assert.equal(toWei("11", "ether"), contractBalance, "Unexpected Balance");
    assert.equal(leadingBid.bidder, bidder1, "Unexpected bidder");
    assert.equal(leadingBid.amount, toWei("11", "ether"), "Unexpected amount");
  });

  it("should allow a new user to outbid the previous", async () => {
    await instance.submitBid(toWei("12", "ether"), {from: bidder2});

    let leadingBid = await instance.bids("0");
    let contractBalance = await bidTokenInstance.balanceOf(instance.address);
    let oldBidderBalance = await bidTokenInstance.balanceOf(bidder1);

    assert.equal(toWei("12", "ether"), contractBalance, "Unexpected Balance");
    assert.equal(toWei("100", "ether"), oldBidderBalance, "Unexpected Balance");
    assert.equal(leadingBid.bidder, bidder2, "Unexpected bidder");
    assert.equal(leadingBid.amount, toWei("12", "ether"), "Unexpected amount");
  });

  // PERIOD 2

  it("should increase time to period 2", async () => {
    await time.increase(periodLength);
  });

  it("should not allow bidding in period 2", async () => {
    await expectRevert(
      instance.submitBid(toWei("10", "ether"), {from: bidder1}),
      "Faker: Not Auction Period"
    );
  });
});
