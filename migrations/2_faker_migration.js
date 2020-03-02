const Faker = artifacts.require("Faker");
const TestToken = artifacts.require("TestToken");

module.exports = async function(deployer, network, accounts) {
  let makerAddress = null;
  let bidTokenAddress = null;

  if ("development" === network) {
    await deployer.deploy(TestToken);
    makerAddress = TestToken.address;

    await deployer.deploy(TestToken);
    bidTokenAddress = TestToken.address;
  } else {
    throw new Error("Unknown network");
    // Mainnet MKR address: 0x9f8F72aA9304c8B593d555F12eF6589cC3A579A2
  }

  await deployer.deploy(Faker, 24 * 60 * 60, makerAddress, bidTokenAddress);
};
