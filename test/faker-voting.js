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

  // PERIOD 0



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

  it('should allow depositors to withdraw', async() => {

  })

});
