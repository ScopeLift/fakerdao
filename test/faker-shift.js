const { time, expectRevert, constants, send, ether } = require("@openzeppelin/test-helpers");
const Faker = artifacts.require("Faker");
const TestToken = artifacts.require("TestToken");

const mkrAddress = "0x9f8F72aA9304c8B593d555F12eF6589cC3A579A2"; // GOV
const exchangeAddress = process.env.EXCHANGE_ADDRESS;

contract("Faker Shift", accounts => {
  let instance = null;
  let makerInstance = null;
  let periodLength = null;
  const utils = web3.utils;
  const toWei = utils.toWei;

  const depositor1 = accounts[1];
  const depositor2 = accounts[2];

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

    // Approve Faker instance to spend depositors Maker
    await makerInstance.approve(instance.address, constants.MAX_UINT256, {from: depositor1});
    await makerInstance.approve(instance.address, constants.MAX_UINT256, {from: depositor2});
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

  it('should let users deposit', async () => {
    await instance.deposit(toWei("100", "ether"), {from: depositor1});
    const depositor1Balance = await makerInstance.balanceOf(depositor1);
    assert.equal(depositor1Balance, toWei("900", "ether"), "Unexpected Balance");

    await instance.deposit(toWei("100", "ether"), {from: depositor2});
    const depositor2Balance = await makerInstance.balanceOf(depositor2);
    assert.equal(depositor2Balance, toWei("900", "ether"), "Unexpected Balance");
  });

  it('should let users withdraw', async () => {
    await instance.withdrawMaker({from: depositor1});
    const depositor1Balance = await makerInstance.balanceOf(depositor1)
    assert.equal(depositor1Balance, toWei("1000", "ether"), "Unexpected Balance")
  });

  // PERIOD 1

  it("should advance time", async () => {
    await time.increase(periodLength);
  });

  it("should not let users deposit during period 1", async () => {
    await expectRevert(
      instance.deposit(toWei("100", "ether"), {from: depositor1}),
      "Faker: Not Shift Period"
    );
  });

  it("should not lets users withdraw during period 1", async () => {
    await expectRevert(
      instance.withdrawMaker({from: depositor2}),
      "Faker: Not Shift Period"
    );
  });

  // PERIOD 7

  it("should advance time", async () => {
    await time.increase(6*periodLength);
  });

  it("should let a depositor withdraw in period 7", async () => {
    await instance.withdrawMaker({from: depositor2});
    const depositor2Balance = await makerInstance.balanceOf(depositor2);
    assert.equal(depositor2Balance, toWei("1000", "ether"), "Unexpected Balance");
  });

  it("should not let a user with no deposits withdraw", async () => {
    await expectRevert(
      instance.withdrawMaker({from: depositor1}),
      "Faker: Caller has no deposited Maker"
    );
  });

  it("should let a user deposit and withdraw in period 7", async () => {
    await instance.deposit(toWei("100", "ether"), {from: depositor1});
    let depositor1Balance = await makerInstance.balanceOf(depositor1);
    assert.equal(depositor1Balance, toWei("900", "ether"), "Unexpected Balance");

    await instance.withdrawMaker({from: depositor1});
    depositor1Balance = await makerInstance.balanceOf(depositor1);
    assert.equal(depositor1Balance, toWei("1000", "ether"), "Unexpected Balance");
  });

  after(async () => {
    let balance = await makerInstance.balanceOf(depositor1);
    await makerInstance.transfer(exchangeAddress, balance, { from: depositor1 });

    balance = await makerInstance.balanceOf(depositor2);
    await makerInstance.transfer(exchangeAddress, balance, { from: depositor2 });
  });
});
