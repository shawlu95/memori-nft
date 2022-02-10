const { ethers, upgrades } = require("hardhat");
const hre = require("hardhat");
const address = require("./address");

async function main() {
  await hre.run('compile');

  const nftAddress = address.getNftAddress();
  const MementoV2 = await ethers.getContractFactory("MementoV2");
  const mementoV2 = await upgrades.upgradeProxy(nftAddress, MementoV2);
  console.log("Memento upgraded:", mementoV2.address);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
