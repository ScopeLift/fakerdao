// This test is to initialize ganache accounts with MKR for front end testing

const { time, expectRevert, constants, send, ether, balance } = require("@openzeppelin/test-helpers");
const Faker = artifacts.require("Faker");
const TestToken = artifacts.require("TestToken");
const IERC20 = artifacts.require("IERC20");
const IChief = artifacts.require("IChief");

const wethAddress = "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2"
const mkrAddress = "0x9f8F72aA9304c8B593d555F12eF6589cC3A579A2"; // GOV
const mkrHolderAddress = process.env.EXCHANGE_ADDRESS;
const wethHolderAddress = process.env.WETH_HOLDER_ADDRESS;

contract("Initialize ganache for front end", accounts => {
  let makerInstance = null;
  let bidTokenInstance = null;
  const utils = web3.utils;
  const toWei = utils.toWei;

  const depositor1 = accounts[1];
  const depositor2 = accounts[2];
  const depositor3 = accounts[3];
  const bidder1 = accounts[4];
  const bidder2 = accounts[5];
  const bidder3 = accounts[6];

  before(async () => {
    // Ensure environment variables were set
    assert(mkrHolderAddress.startsWith("0x"), "Maker holder address not found");
    assert(wethHolderAddress.startsWith("0x"), "Weth holder address not found");

    // Send Ether to MKR and WETH holder address
    await send.ether(accounts[0], wethHolderAddress, ether("1"));
    await send.ether(accounts[0], mkrHolderAddress, ether("1"));

    // Deploy Bid Token (WETH)
    bidTokenInstance = await IERC20.at(wethAddress);

    // Get Maker instance
    makerInstance = await IERC20.at(mkrAddress);

    // Send bid tokens to bidders
    await bidTokenInstance.transfer(bidder1, toWei("100", "ether"), { from: wethHolderAddress });
    await bidTokenInstance.transfer(bidder2, toWei("100", "ether"), { from: wethHolderAddress });
    await bidTokenInstance.transfer(bidder3, toWei("100", "ether"), { from: wethHolderAddress });

    // Get Maker Tokens
    await makerInstance.transfer(depositor1, toWei("1000", "ether"), { from: mkrHolderAddress });
    await makerInstance.transfer(depositor2, toWei("1000", "ether"), { from: mkrHolderAddress });
    await makerInstance.transfer(depositor3, toWei("1000", "ether"), { from: mkrHolderAddress });

    // Approve Faker instance to spend Maker & Bid Token
    // await makerInstance.approve(instance.address, constants.MAX_UINT256, { from: depositor1 });
    // await makerInstance.approve(instance.address, constants.MAX_UINT256, { from: depositor2 });
    // await makerInstance.approve(instance.address, constants.MAX_UINT256, { from: depositor3 });
    // await bidTokenInstance.approve(instance.address, constants.MAX_UINT256, { from: bidder1 });
    // await bidTokenInstance.approve(instance.address, constants.MAX_UINT256, { from: bidder2 });
  });

  it("should initialize ganache for front-end development", async () => {});
});
