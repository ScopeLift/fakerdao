const Faker = artifacts.require("Faker");
const TestToken = artifacts.require("TestToken");
const addresses = require('../abi/addresses.json')

module.exports = async function(deployer, network, accounts) {
  let bidTokenAddress = null;

  if ("development" === network) {
    await deployer.deploy(TestToken);

    await deployer.deploy(TestToken);
    bidTokenAddress = TestToken.address;
    await deployer.deploy(Faker, 24 * 60 * 60, bidTokenAddress);
  } else {
    // Mainnet MKR address: 0x9f8F72aA9304c8B593d555F12eF6589cC3A579A2
    await deployer.deploy(Faker, 24 * 60 * 60, addresses.weth);
  }
};
