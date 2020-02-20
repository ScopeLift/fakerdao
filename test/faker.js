const { time } = require("@openzeppelin/test-helpers");
// time docs: https://docs.openzeppelin.com/test-helpers/0.5/api#time

const Faker = artifacts.require("Faker");

contract("Faker", accounts => {

    var instance = null;
    var periodLength = null;

    before(async () => {
        instance = await Faker.deployed();
        periodLength = await instance.periodLength();
    });

    it("should should find the contract instance", async () => {
        assert(instance.address.startsWith("0x"), "Deployment not found");
    });

    it("should start at period 0", async () => {
        let period = await instance.getCurrentPeriod();
        assert.equal(period, 0, "Invalid initial period");
    });

    it("should not be in a vote phase during the first period", async () => {
        let {isActive, _phase} = await instance.getCurrentVotingPhase();
        assert(!isActive, "Shows active vote during first period");
    });

    it("should be in the first auction phase during the first period", async () => {
        let {isActive, phase} = await instance.getCurrentAuctionPhase();
        assert.equal(phase.toString(10), "0", "Incorrect voting phase during first period");
        assert(isActive,  "Shows active vote during first period");
    })

    it("should show period 1 after 1 period duration", async () => {
        await time.increase(periodLength);
        let period = await instance.getCurrentPeriod();
        assert.equal(period, 1, "Invalid period increase");
    });

    it("should not be in a vote phase during the second period", async () => {
        let {isActive, _phase} = await instance.getCurrentVotingPhase();
        assert(!isActive, "Shows active vote during second period");
    });

    it("should show period 3 after 2 more period durations", async () => {
        await time.increase(2*periodLength);
        let period = await instance.getCurrentPeriod();
        assert.equal(period, 3, "Invalid period increase");
    });

    it("should not be in an auction phase after 3 periods", async () => {
        let {isActive, _phase} = await instance.getCurrentAuctionPhase();
        assert(!isActive,  "Shows active vote during first period");
    })

    it("should be in auction phase 1 and vote phase 0 after 7 periods", async () => {
        await time.increase(4*periodLength);
        let period = await instance.getCurrentPeriod();
        console.log('period: ', period);
        console.log("auction phase lenght: " + (await instance.auctionPhaseLength()));
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

