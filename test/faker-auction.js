const { time, expectRevert, constants, ether, send } = require("@openzeppelin/test-helpers");
const Faker = artifacts.require("Faker");
const TestToken = artifacts.require("TestToken");
const IERC20 = artifacts.require("IERC20");

// const mkrAddress = "0x9f8F72aA9304c8B593d555F12eF6589cC3A579A2";
const mkrAddress = "0xAaF64BFCC32d0F15873a02163e7E500671a4ffcD"; // GOV mainnent
const exchangeAddress = process.env.EXCHANGE_ADDRESS;

contract("Faker Auctions", accounts => {
  let instance = null;
  let makerInstance = null;
  let bidTokenInstance = null;
  let periodLength = null;
  const utils = web3.utils;
  const toWei = utils.toWei;

  const depositor1 = accounts[1];
  const depositor2 = accounts[2];

  const bidder1 = accounts[3];
  const bidder2 = accounts[4];

  before(async () => {
    // Send Ether to a16z MKR address
    await send.ether(accounts[0], exchangeAddress, ether("1"));

    // Deploy Bid Token (e.g. WETH)
    bidTokenInstance = await TestToken.new();

    // Get Maker Instance
    makerInstance = await IERC20.at(mkrAddress);

    // Deploy Faker
    instance = await Faker.new(24 * 60 * 60, bidTokenInstance.address);
    periodLength = await instance.periodLength();

    // Get mock Maker token and send tokens to the bidders
    await makerInstance.transfer(depositor1, toWei("1000", "ether"), { from: exchangeAddress });
    await makerInstance.transfer(depositor2, toWei("1000", "ether"), { from: exchangeAddress });

    // Send bid tokens to bidders
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

  // PERIOD 8

  it("should increase time to period 8", async () => {
    await time.increase(6*periodLength);
  });

  it("should start with no leading bidder", async () => {
    let leadingBid = await instance.bids('1');
    assert.equal(leadingBid.amount, '0', 'Unexpected amount');
    assert.equal(leadingBid.bidder, constants.ZERO_ADDRESS, 'Unexpected bidder');
  });

  it("should allow a new bid for this phase", async () => {
    await instance.submitBid(toWei("10", "ether"), {from: bidder1});

    let contractBalance = await bidTokenInstance.balanceOf(instance.address);
    let bidderBalance = await bidTokenInstance.balanceOf(bidder1);
    let leadingBid = await instance.bids('1');

    assert.equal(toWei("22", "ether"), contractBalance, "Unexpected Balance");
    assert.equal(toWei("90", "ether"), bidderBalance, "Unexpected Balance");
    assert.equal(leadingBid.bidder, bidder1, "Unexpected bidder");
    assert.equal(leadingBid.amount, toWei("10", "ether"), "Unexpected amount");
  });

  it('should not overwrite previous bids', async() => {
    let oldBid = await instance.bids('0');
    assert.equal(oldBid.bidder, bidder2, "Unexpected bidder");
    assert.equal(oldBid.amount, toWei("12", "ether"), "Unexpected amount");
  });

  after(async () => {
    let balance = await makerInstance.balanceOf(depositor1);
    await makerInstance.transfer(exchangeAddress, balance, { from: depositor1 });

    balance = await makerInstance.balanceOf(depositor2);
    await makerInstance.transfer(exchangeAddress, balance, { from: depositor2 });
  });
});
