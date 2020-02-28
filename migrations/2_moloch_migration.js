const Faker = artifacts.require("Faker");

module.exports = async function(deployer) {
    await deployer.deploy(Faker, 24*60*60);
};
