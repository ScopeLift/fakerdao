const { time, expectRevert } = require("@openzeppelin/test-helpers");
// time docs: https://docs.openzeppelin.com/test-helpers/0.5/api#time

const Faker = artifacts.require("Faker");

contract("Faker", accounts => {

    let instance = null;
    let periodLength = null;
    const utils = web3.utils;
    const BN = utils.BN;

    const bidder1 = accounts[1];
    const firstBidAmount = utils.toWei("1", "ether");
    const invalidRefundUseAmount = utils.toWei("1.1", "ether");
    const bidAdditionAmount = utils.toWei("0.51", "ether");
    const winningBidAmount = utils.toWei("1.51", "ether");

    const bidder2 = accounts[2];
    const secondBidAmount = utils.toWei("0.5", "ether");
    const thirdBidAmount = utils.toWei("1.5", "ether");

    before(async () => {
        instance = await Faker.deployed();
        periodLength = await instance.periodLength();
    });

    it("should should find the contract instance", async () => {
        assert(instance.address.startsWith("0x"), "Deployment not found");
    });

    // Bids are allowed starting here
    it("should start at period 0", async () => {
        let period = await instance.getCurrentPeriod();
        assert.equal(period, 0, "Invalid initial period");
    });

    it("should not be in a vote phase during the first period", async () => {
        let {isVoteActive, votePhase} = await instance.getCurrentVotingPhase();
        assert(!isVoteActive, "Shows active vote during first period");
    });

    it("should be in the first auction phase during the first period", async () => {
        let {isAuctionActive, auctionPhase} = await instance.getCurrentAuctionPhase();
        assert.equal(auctionPhase.toString(10), "0", "Incorrect voting phase during first period");
        assert(isAuctionActive,  "Shows active vote during first period");
    });

    it("should allow a bid during the first auction phase", async () => {
        await instance.submitBid("0", {from: bidder1, value: firstBidAmount});

        let {auctionPhase} = await instance.getCurrentAuctionPhase();
        const currentBid = await instance.bids(auctionPhase);
        const refundAmount = await instance.refundAmount(bidder1);

        assert.equal(currentBid.bidder, bidder1, "Unexpected bidder");
        assert.equal(currentBid.amount, firstBidAmount, "Unexpect bid amount");
        assert.equal(refundAmount.toString(10), "0", "Unexpected refund amount");
    });

    it("should disallow a bid that is less than the current leader", async () => {
        await expectRevert(
            instance.submitBid("0", { from: bidder2, value: secondBidAmount }),
            'Faker: Bid is less than current leader',
        );
    });

    it("should allow a new leading bid to be submitted", async () => {
        await instance.submitBid("0", {from: bidder2, value: thirdBidAmount});

        let {auctionPhase} = await instance.getCurrentAuctionPhase();
        const currentBid = await instance.bids(auctionPhase);
        const refundAmount = await instance.refundAmount(bidder1);

        assert.equal(currentBid.bidder, bidder2, "Unexpected bidder");
        assert.equal(currentBid.amount, thirdBidAmount, "Unexpect bid amount");
        assert.equal(refundAmount, firstBidAmount, "Unexpected refund amount");
    });

    it("should disallow a bid that tries to use more refund than available", async () => {
        await expectRevert(
            instance.submitBid(invalidRefundUseAmount, { from: bidder1, value: utils.toWei("1", "ether") }),
            "Faker: Refund input too high",
        );
    });

    it("should allow a new leading bid that uses availble refund", async () => {
        await instance.submitBid(firstBidAmount, {from: bidder1, value: bidAdditionAmount});

        let {auctionPhase} = await instance.getCurrentAuctionPhase();
        const currentBid = await instance.bids(auctionPhase);
        const bidder1RefundAmount = await instance.refundAmount(bidder1);
        const bidder2RefundAmount = await instance.refundAmount(bidder2);

        assert.equal(currentBid.bidder, bidder1, "Unexpected bidder");
        assert.equal(currentBid.amount, winningBidAmount, "Unexpect bid amount");
        assert.equal(bidder1RefundAmount.toString(10), "0", "Unexpected refund amount");
        assert.equal(bidder2RefundAmount, thirdBidAmount, "Unexpected Refund Amount");
    });

    it("should show period 1 after 1 period duration", async () => {
        await time.increase(periodLength);
        let period = await instance.getCurrentPeriod();
        assert.equal(period, 1, "Invalid period increase");
    });

    it("should not be in a vote phase during the second period", async () => {
        let {isVoteActive, votePhase} = await instance.getCurrentVotingPhase();
        assert(!isVoteActive, "Shows active vote during second period");
    });

    // Bids end below here
    it("should be in a vote phase during the third period", async () => {
        await time.increase(periodLength);
        let {isVoteActive, votePhase} = await instance.getCurrentVotingPhase();
        assert(isVoteActive, "Does not show active vote during third period");
        assert.equal(votePhase.toString(10), "0", "Incorrect voting phase during first period");
    });

    it("should disallow a bid after the auction phase ends", async () => {
        await expectRevert(
            instance.submitBid("0", { from: bidder1, value: utils.toWei("5", "ether") }),
            "Faker: No auction is ongoing",
        );
    });

    it("should allow a losing bidder to claim a refund", async () => {
        let initialBalance = new BN(await web3.eth.getBalance(bidder2));
        await instance.claimRefund({from: bidder2, gasPrice: "0"});

        let updatedBalance = new BN(await web3.eth.getBalance(bidder2));
        let balanceDiff = updatedBalance.sub(initialBalance);

        assert.equal(balanceDiff, thirdBidAmount, "Unexpected user balance");
    });

    it("should disallow the winner from claiming a refund", async () => {
        await expectRevert(
            instance.claimRefund({ from: bidder1 }),
            "Faker: No refund available for caller",
        );
    });

    it("should show period 3 after 2 more period durations", async () => {
        await time.increase(periodLength);
        let period = await instance.getCurrentPeriod();
        assert.equal(period, 3, "Invalid period increase");
    });

    it("should not be in an auction phase after 3 periods", async () => {
        let {isAuctionActive, auctionPhase} = await instance.getCurrentAuctionPhase();
        assert(!isAuctionActive,  "Shows active vote during first period");
    })

    it("should be in auction phase 1 and vote phase 0 after 7 periods", async () => {
        await time.increase(4*periodLength);

        // Check vote phase
        let {isVoteActive, votePhase} = await instance.getCurrentVotingPhase();
        assert(isVoteActive,  "Shows active vote during zeroth period");
        assert.equal(votePhase.toString(10), "0", "Incorrect voting phase during first period");

        // Check auction phase
        let {isAuctionActive, auctionPhase} = await instance.getCurrentAuctionPhase();
        assert(isAuctionActive,  "Shows active auction during first period");
        assert.equal(auctionPhase.toString(10), "1", "Incorrect voting phase during period 0");
    })
});

