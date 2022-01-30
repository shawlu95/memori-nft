

const { ethers, upgrades } = require("hardhat");
const hre = require("hardhat");
// const ethers = hre.ethers;

async function main() {
  await hre.run('compile');

  const address = "0x06B7e365aFB064A9b499Ff0A26F39CF0C30e1424";

  const MementoV2 = await ethers.getContractFactory("MementoV2");
  const mementoV2 = await upgrades.upgradeProxy(address, MementoV2);
  console.log("Memento upgraded:", mementoV2.address);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
