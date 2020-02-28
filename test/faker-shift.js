const { time, expectRevert, constants } = require("@openzeppelin/test-helpers");
// time docs: https://docs.openzeppelin.com/test-helpers/0.5/api#time

const Faker = artifacts.require("Faker");
const TestToken = artifacts.require("TestToken");

contract("Faker", accounts => {
  let instance = null;
  let makerInstance = null;
  let periodLength = null;
  const utils = web3.utils;
  const toWei = utils.toWei;
  const BN = utils.BN;

  const depositor1 = accounts[1];
  const firstBidAmount = toWei("1", "ether");
  const invalidRefundUseAmount = toWei("1.1", "ether");
  const bidAdditionAmount = toWei("0.51", "ether");
  const winningBidAmount = toWei("1.51", "ether");

  const depositor2 = accounts[2];
  const secondBidAmount = toWei("0.5", "ether");
  const thirdBidAmount = toWei("1.5", "ether");

  before(async () => {
    // Deploy Faker
    instance = await Faker.deployed();
    periodLength = await instance.periodLength();

    // Deploy mock Maker token and send tokens to the bidders
    makerInstance = await TestToken.deployed();
    await makerInstance.mint(depositor1, toWei("1000", "ether"));
    await makerInstance.mint(depositor2, toWei("1000", "ether"));

    // Approve Faker instance to spend Maker
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

  it("should let a despositor withdraw in period 7", async () => {
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

  it("should let a user desposit and withdraw in period 7", async () => {
    await instance.deposit(toWei("100", "ether"), {from: depositor1});
    let depositor1Balance = await makerInstance.balanceOf(depositor1);
    assert.equal(depositor1Balance, toWei("900", "ether"), "Unexpected Balance");

    await instance.withdrawMaker({from: depositor1});
    depositor1Balance = await makerInstance.balanceOf(depositor1);
    assert.equal(depositor1Balance, toWei("1000", "ether"), "Unexpected Balance");
  });
});
