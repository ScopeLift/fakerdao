const { time, expectRevert, constants, send, ether } = require("@openzeppelin/test-helpers");

const Faker = artifacts.require("Faker");
const TestToken = artifacts.require("TestToken");
const IERC20 = artifacts.require("IERC20");
const IChief = artifacts.require("IChief");

const mkrAddress = '0x9f8F72aA9304c8B593d555F12eF6589cC3A579A2'; // GOV
const iouAddress = '0x496c67a4ced9c453a60f3166ab4b329870c8e355'; // IOU (Locked GOV)
const chiefAddress = '0x9eF05f7F6deB616fd37aC3c959a2dDD25A54E4F5';
const hatAddress = '0xD24FbbB4497AD32308BDa735683B55499Ddc2CaD'; // current governing contract
const exchangeAddress = process.env.EXCHANGE_ADDRESS;

async function stealTokens(instance, amount, holder, recipient) {
    await instance.transfer(recipient, amount, {from: holder});
}

async function sendBalance(instance, holder, recipient) {
    let balance = await instance.balanceOf(holder);
    // stealTokens(instance, balance, holder, recipient);
    await makerInstance.transfer(recipient, balance, {from: holder})
}

contract("Faker Voting", accounts => {

    let instance = null;
    let makerInstance = null;
    let chiefInstance = null;
    let bidTokenInstance = null;
    let periodLength = null;
    const utils = web3.utils;
    const toWei = utils.toWei;
    const BN = utils.BN;

    const depositor1 = accounts[1];
    const depositor2 = accounts[2];
    const depositor3 = accounts[5];
    const bidder1 = accounts[3];
    const bidder2 = accounts[4];

    before(async () => {

        // Send Ether to a16z MKR address
        await send.ether(accounts[0], exchangeAddress, ether('1'));

        // Deploy Bid Token

        bidTokenInstance = await TestToken.new();

        // Get Maker & Chief Instance

        makerInstance = await IERC20.at(mkrAddress);
        chiefInstance = await IChief.at(chiefAddress);

        // // Deploy Faker

        instance = await Faker.deployed(24 * 60 * 60, makerInstance.address, bidTokenInstance.address);
        periodLength = await instance.periodLength();

        // Get mock bid token instance
        await bidTokenInstance.mint(bidder1, toWei("100", "ether"));
        await bidTokenInstance.mint(bidder2, toWei("100", "ether"));

        // Get Maker Tokens
        await makerInstance.transfer(depositor1, toWei("1000", "ether"), {from: exchangeAddress})
        await makerInstance.transfer(depositor2, toWei("1000", "ether"), {from: exchangeAddress})
        await makerInstance.transfer(depositor3, toWei("1000", "ether"), {from: exchangeAddress})
    });

    it("should find the contract instances", async () => {
        assert(instance.address.startsWith("0x"), "Faker deployment not found");
        assert(bidTokenInstance.address.startsWith("0x"), "Bid Token deployment not found");
        assert(exchangeAddress.startsWith("0x"), "Exchange address not found in .env file");
        assert.equal(mkrAddress, makerInstance.address, "Maker deployment not found");
        assert.equal(chiefAddress, chiefInstance.address, "Chief address not found");
    });

    after(async () => {
        let balance = await makerInstance.balanceOf(depositor1);
        await makerInstance.transfer(depositor1, balance, {from: exchangeAddress})

        balance = await makerInstance.balanceOf(depositor2);
        await makerInstance.transfer(depositor2, balance, {from: exchangeAddress})

        balance = await makerInstance.balanceOf(depositor3);
        await makerInstance.transfer(depositor3, balance, {from: exchangeAddress})
    });
});
