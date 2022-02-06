const { ethers, upgrades } = require("hardhat");
const hre = require("hardhat");
// const ethers = hre.ethers;

async function main() {
  await hre.run('compile');

  const address = "0x84725B0E283E873105f93B0762257e44c0b16295";

  const MementoV2 = await ethers.getContractFactory("MementoV2");
  const mementoV2 = await upgrades.upgradeProxy(address, MementoV2);
  console.log("Memento upgraded:", mementoV2.address);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
