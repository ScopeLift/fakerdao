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

  // Test deposit during first shift
  // Test withdraw during first shift
  // Test no deposit after shift
  // test no withdraw after shift
  // Test deposit in next shift
  // Test withdraw in next shift

  it('should let users deposit', async () => {
    await instance.deposit(toWei("100", "ether"), {from: depositor1});
    const depositor1Balance = await makerInstance.balanceOf(depositor1);
    assert(depositor1Balance, toWei("900", "ether"), "Unexpected Balance");

    await instance.deposit(toWei("100", "ether"), {from: depositor2});
    const depositor2Balance = await makerInstance.balanceOf(depositor2);
    assert(depositor2Balance, toWei("900", "ether"), "Unexpected Balance");
  });

  it('should let users withdraw', async () => {
    await instance.withdrawMaker({from: depositor1});
    const depositor1Balance = await makerInstance.balanceOf(depositor1)
    assert(depositor1Balance, toWei("1000", "ether"), "Unexpected Balance")
  });
});
