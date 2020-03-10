const { time } = require("@openzeppelin/test-helpers");
// time docs: https://docs.openzeppelin.com/test-helpers/0.5/api#time
const Faker = artifacts.require("Faker");

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
