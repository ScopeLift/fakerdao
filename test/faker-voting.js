const { time, expectRevert, constants, send, ether } = require("@openzeppelin/test-helpers");
const Faker = artifacts.require("Faker");
const TestToken = artifacts.require("TestToken");

const mkrAddress = "0x9f8F72aA9304c8B593d555F12eF6589cC3A579A2"; // GOV
const exchangeAddress = process.env.EXCHANGE_ADDRESS;

contract("Faker Voting", accounts => {
  let instance = null;
  let makerInstance = null;
  let bidTokenInstance = null;
  let periodLength = null;
  const utils = web3.utils;
  const toWei = utils.toWei;

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

    // Get Maker Instance
    makerInstance = await TestToken.at(mkrAddress);

    // Deploy Faker
    instance = await Faker.new(24 * 60 * 60, bidTokenInstance.address);
    periodLength = await instance.periodLength();

    // Send MKR to the depositors
    await makerInstance.transfer(depositor1, toWei("1000", "ether"), { from: exchangeAddress });
    await makerInstance.transfer(depositor2, toWei("1000", "ether"), { from: exchangeAddress });
    await makerInstance.transfer(depositor3, toWei("1000", "ether"), { from: exchangeAddress });

    // Get mock bid token instance
    await bidTokenInstance.mint(bidder1, toWei("100", "ether"));
    await bidTokenInstance.mint(bidder2, toWei("100", "ether"));

    // Approve Faker instance to spend Maker
    await makerInstance.approve(instance.address, constants.MAX_UINT256, {from: depositor1});
    await makerInstance.approve(instance.address, constants.MAX_UINT256, {from: depositor2});
    await makerInstance.approve(instance.address, constants.MAX_UINT256, {from: depositor3});
    await bidTokenInstance.approve(instance.address, constants.MAX_UINT256, {from: bidder1});
    await bidTokenInstance.approve(instance.address, constants.MAX_UINT256, {from: bidder2});
  });

  it("should find the contract instances", async () => {
    assert(instance.address.startsWith("0x"), "Faker deployment not found");
    assert(makerInstance.address.startsWith("0x"), "Maker deployment not found");
  });

  // PERIOD 0

  it('should let users deposit', async () => {
    await instance.deposit(toWei("100", "ether"), {from: depositor1});
    const depositor1Balance = await makerInstance.balanceOf(depositor1);
    assert.equal(depositor1Balance, toWei("900", "ether"), "Unexpected Balance");

    await instance.deposit(toWei("100", "ether"), {from: depositor2});
    const depositor2Balance = await makerInstance.balanceOf(depositor2);
    assert.equal(depositor2Balance, toWei("900", "ether"), "Unexpected Balance");
  });

  it("should not allow depositor to withdraw earnings during shift", async () => {
    await expectRevert(
      instance.withdrawEarnings(["0"], {from: depositor1}),
      "Faker: Earnings For Phase Not Yet Withdrawable"
    );
  });

  // PERIOD 1

  it("should increase time to period 1", async () => {
    await time.increase(periodLength);
  });

  it("should allow a user to submit a bid in period 1", async () => {
    await instance.submitBid(toWei("10", "ether"), {from: bidder1});

    let leadingBid = await instance.bids("0");
    let contractBalance = await bidTokenInstance.balanceOf(instance.address);

    assert.equal(toWei("10", "ether"), contractBalance, "Unexpected Balance");
    assert.equal(leadingBid.bidder, bidder1, "Unexpected bidder");
    assert.equal(leadingBid.amount, toWei("10", "ether"), "Unexpected amount");
  });

  it("should not allow depositor to withdraw earnings for a future phase", async () => {
    await expectRevert(
      instance.withdrawEarnings(["1"], {from: depositor1}),
      "Faker: Phase Is In Future"
    );
  });

  it("should not allow depositor to withdraw earnings during auction", async () => {
    await expectRevert(
      instance.withdrawEarnings(["0"], {from: depositor1}),
      "Faker: Earnings For Phase Not Yet Withdrawable"
    );
  });

  // PERIOD 2

  it("should increase time to period 2", async () => {
    await time.increase(periodLength);
  });

  it("should allow a user to withdraw their earnings from the now-complete auction", async () => {
    await instance.withdrawEarnings(["0"], {from: depositor1});

    let depositor1Balance = await bidTokenInstance.balanceOf(depositor1);
    let contractBalance = await bidTokenInstance.balanceOf(instance.address);

    assert.equal(depositor1Balance, toWei("5", "ether"), "Unexpected Balance");
    assert.equal(contractBalance, toWei("5", "ether"), "Unexpected Balance");
  });

  it("should not allow the same user to withdraw their earnings from the same phase twice", async () => {
    await expectRevert(
      instance.withdrawEarnings(["0"], {from: depositor1}),
      "Faker: Earnings For Phase Already Withdrawn"
    );
  });

  // PERIOD 7

  it("should increase time to period 7", async () => {
    await time.increase(5*periodLength);
  });

  it('should let another user deposit', async () => {
    await instance.deposit(toWei("50", "ether"), {from: depositor3});
    const depositor2Balance = await makerInstance.balanceOf(depositor3);
    assert.equal(depositor2Balance, toWei("950", "ether"), "Unexpected Balance");
  });

  // PERIOD 8

  it("should increase time to period 9", async () => {
    await time.increase(periodLength);
  });

  it("should allow a user to submit a bid in period 8", async () => {
    await instance.submitBid(toWei("10", "ether"), {from: bidder2});

    let leadingBid = await instance.bids("1");
    let contractBalance = await bidTokenInstance.balanceOf(instance.address);

    assert.equal(toWei("15", "ether"), contractBalance, "Unexpected Balance");
    assert.equal(leadingBid.bidder, bidder2, "Unexpected bidder");
    assert.equal(leadingBid.amount, toWei("10", "ether"), "Unexpected amount");
  });

  // PERIOD 10

  it("should increase time to period 9", async () => {
    await time.increase(periodLength);
  });

  it("should not allow a depositor to withdraw from a phase the didn't contribute to", async () => {
    await expectRevert(
      instance.withdrawEarnings(["0"], {from: depositor3}),
      "Faker: Not Eligible For Earnings In This Phase"
    );
  });

  it("should allow a user to withdraw earnings for two phases", async () => {
    await instance.withdrawEarnings(["0", "1"], {from: depositor2});

    let depositor2Balance = await bidTokenInstance.balanceOf(depositor2);
    let contractBalance = await bidTokenInstance.balanceOf(instance.address);

    assert.equal(depositor2Balance, toWei("9", "ether"), "Unexpected Balance");
    assert.equal(contractBalance, toWei("6", "ether"), "Unexpected Balance");
  });

  it("should allow a user to withdraw latest earnings", async () => {
    await instance.withdrawEarnings(["1"], {from: depositor1});

    let depositor1Balance = await bidTokenInstance.balanceOf(depositor1);
    let contractBalance = await bidTokenInstance.balanceOf(instance.address);

    assert.equal(depositor1Balance, toWei("9", "ether"), "Unexpected Balance");
    assert.equal(contractBalance, toWei("2", "ether"), "Unexpected Balance");
  });

  it("should allow latest user to withdraw earnings", async () => {
    await instance.withdrawEarnings(["1"], {from: depositor3});

    let depositor3Balance = await bidTokenInstance.balanceOf(depositor3);
    let contractBalance = await bidTokenInstance.balanceOf(instance.address);

    assert.equal(depositor3Balance, toWei("2", "ether"), "Unexpected Balance");
    assert.equal(contractBalance, toWei("0", "ether"), "Unexpected Balance");
  });
});
