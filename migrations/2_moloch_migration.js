//const GuildBank = artifacts.require("GuildBank");
//const MolochPool = artifacts.require("MolochPool");
const Faker = artifacts.require("Faker");

module.exports = async function(deployer) {
    await deployer.deploy(Faker, 24*60*60, 7, 2);
};
