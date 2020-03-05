const { time, expectRevert, constants, send, ether} = require("@openzeppelin/test-helpers");

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

contract("Faker Governance", accounts => {

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

        // Deploy Faker
        instance = await Faker.new(24 * 60 * 60, makerInstance.address, bidTokenInstance.address);
        periodLength = await instance.periodLength();

        // Get mock bid token instance
        await bidTokenInstance.mint(bidder1, toWei("100", "ether"));
        await bidTokenInstance.mint(bidder2, toWei("100", "ether"));

        // Get Maker Tokens
        await makerInstance.transfer(depositor1, toWei("1000", "ether"), {from: exchangeAddress})
        await makerInstance.transfer(depositor2, toWei("1000", "ether"), {from: exchangeAddress})
        await makerInstance.transfer(depositor3, toWei("1000", "ether"), {from: exchangeAddress})

        // Approve Faker instance to spend Maker & Bid Token
        await makerInstance.approve(instance.address, constants.MAX_UINT256, {from: depositor1});
        await makerInstance.approve(instance.address, constants.MAX_UINT256, {from: depositor2});
        await makerInstance.approve(instance.address, constants.MAX_UINT256, {from: depositor3});
        await bidTokenInstance.approve(instance.address, constants.MAX_UINT256, {from: bidder1});
        await bidTokenInstance.approve(instance.address, constants.MAX_UINT256, {from: bidder2});
    });

    it("should find the contract instances", async () => {
        assert(instance.address.startsWith("0x"), "Faker deployment not found");
        assert(bidTokenInstance.address.startsWith("0x"), "Bid Token deployment not found");
        assert(exchangeAddress.startsWith("0x"), "Exchange address not found in .env file");
        assert.equal(mkrAddress, makerInstance.address, "Maker deployment not found");
        assert.equal(chiefAddress, chiefInstance.address, "Chief address not found");
    });

    it('should allow votes to be placed on the slate', async() => {
        // Check that defaultSlate has 0 votes
        //   defaultSlate = 0x85c5658262531e9d211c409678dedece8322d82e625e8207d38bdccda0bd4dc2
        //   this slate has one candidate of 0x7a87acb1f92c50297239ef9b0ef9387105bd4fc5
        // So, really we check that the candidate has 0 votes
        const initialVoteCount = await chiefInstance.approvals('0x7a87acb1f92c50297239ef9b0ef9387105bd4fc5');

        // Deposit Maker
        await instance.deposit(toWei("100", "ether"), {from: depositor1});
        const expectedFinalCount = initialVoteCount.add(new BN(toWei("100", "ether")));

        // Check that defaultSlate candidate has > 0 votes
        const finalVoteCount = await chiefInstance.approvals('0x7a87acb1f92c50297239ef9b0ef9387105bd4fc5');
        assert.equal(finalVoteCount.toString(), expectedFinalCount, "Unexpected vote count");
    })

    after(async () => {
        let balance = await makerInstance.balanceOf(depositor1);
        await makerInstance.transfer(exchangeAddress, balance, {from:depositor1})

        balance = await makerInstance.balanceOf(depositor2);
        await makerInstance.transfer(exchangeAddress, balance, {from: depositor2})

        balance = await makerInstance.balanceOf(depositor3);
        await makerInstance.transfer(exchangeAddress, balance, {from: depositor3})
    });
});
