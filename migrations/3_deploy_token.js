var Staking = artifacts.require("Staking");
var RewardToken = artifacts.require("RewardToken");

module.exports = async (deployer) => {
  await deployer.deploy(RewardToken);
  const app = await RewardToken.deployed();

  const _address = app.address;
  await deployer.deploy(Staking, _address, _address);
};
