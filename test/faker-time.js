const { time } = require("@openzeppelin/test-helpers");
// time docs: https://docs.openzeppelin.com/test-helpers/0.5/api#time
const Faker = artifacts.require("Faker");

async function timeToPeriodOffset(instance, periodOffset = 1) {
  const periodLength = parseInt( (await instance.periodLength()).toString(10) );
  const deploymentTime = parseInt( (await instance.deploymentTime()).toString(10) );
  const currentPeriod = parseInt( (await instance.getCurrentPeriod()).toString(10) );
  const nextPeriodTime = deploymentTime + (currentPeriod + periodOffset) * periodLength
  const secondsToNextPeriod = nextPeriodTime - (Date.now() / 1000); // assumes local clock is correct
  return secondsToNextPeriod;
}

async function timeToNextActionPeriod(instance) {
  const isShift = await instance.isShift();
  if (isShift) {
    return (await timeToPeriodOffset(instance, 1));
  }

  const isAuction = await instance.isAuction();
  if (isAuction) {
    return (await timeToPeriodOffset(instance, 1));
  }

  const currentPeriod = parseInt( (await instance.getCurrentPeriod()).toString(10) );
  const phaseLength = 7; // How to get constant from contract? //parseInt( (await instance.phaseLength()).toString(10) );
  const periodsToNextPhase = phaseLength - (currentPeriod % phaseLength);

  return (await timeToPeriodOffset(instance, periodsToNextPhase));
}

contract("Faker Time", accounts => {
  let instance = null;
  let periodLength = null;

  before(async () => {
    instance = await Faker.deployed();
    periodLength = await instance.periodLength();
  });

  it("should should find the contract instance", async () => {
    assert(instance.address.startsWith("0x"), "Deployment not found");
  });

  // PERIOD 0

  it("should start at period 0", async () => {
    const period = await instance.getCurrentPeriod();
    assert.equal(period, 0, "Invalid initial period");
    console.log("Time to next action 0: ", await timeToNextActionPeriod(instance));
  });

  it("should be in phase 0 during the 0th period", async () => {
    const phase = await instance.getCurrentPhase();
    assert.equal(phase, 0, "Incorrect phase for period");
  });

  it("shift should be active during period 0", async () => {
    const isShift = await instance.isShift();
    assert(isShift, "Invalid shift status");
  });

  it("auction should not be active during period 0", async () => {
    const isAuction = await instance.isAuction();
    assert(!isAuction, "Invalid auction status");
  });

  // PERIOD 1

  it("auction should be active during period 1", async () => {
    await time.increase(periodLength);
    const isAuction = await instance.isAuction();
    assert(isAuction, "Invalid auctions status");
    console.log("Time to next action 1: ", await timeToNextActionPeriod(instance));
  });

  it("shift should not be active during period 1", async () => {
    const isShift = await instance.isShift();
    assert(!isShift, "Invalid shift status");
  });

  // PERIOD 2

  it("auction should not be active during period 2", async () => {
    await time.increase(periodLength);
    const isAuction = await instance.isAuction();
    assert(!isAuction, "Invalid auctions status");
    console.log("Time to next action 2: ", await timeToNextActionPeriod(instance));
  });

  it("shift should not be active during period 2", async () => {
    const isShift = await instance.isShift();
    assert(!isShift, "Invalid shift status");
  });

  // PERIOD 7

  it("should be in period 7", async () => {
    await time.increase(5 * periodLength);
    const period = await instance.getCurrentPeriod();
    assert.equal(period, 7, "Invalid period");
    console.log("Time to next action 7: ", await timeToNextActionPeriod(instance));
  });

  it("should be in phase 1 during the 7th period", async () => {
    const phase = await instance.getCurrentPhase();
    assert.equal(phase, 1, "Incorrect phase for period");
  });

  it("shift should be active during period 7", async () => {
    const isShift = await instance.isShift();
    assert(isShift, "Invalid shift status");
  });

  it("auction should not be active during period 7", async () => {
    const isAuction = await instance.isAuction();
    assert(!isAuction, "Invalid auction status");
  });

  // PERIOD 8

  it("should be in period 8", async () => {
    await time.increase(periodLength);
    const period = await instance.getCurrentPeriod();
    assert.equal(period, 8, "Invalid period");
    console.log("Time to next action 8: ", await timeToNextActionPeriod(instance));
  });

  it("should be in phase 1 during the 8th period", async () => {
    const phase = await instance.getCurrentPhase();
    assert.equal(phase, 1, "Incorrect phase for period");
  });

  it("shift should not be active during period 8", async () => {
    const isShift = await instance.isShift();
    assert(!isShift, "Invalid shift status");
  });

  it("auction should be active during period 8", async () => {
    const isAuction = await instance.isAuction();
    assert(isAuction, "Invalid auction status");
  });
});
