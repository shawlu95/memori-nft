

const { ethers, upgrades } = require("hardhat");
const hre = require("hardhat");
// const ethers = hre.ethers;

async function main() {
  await hre.run('compile');

  const Memento = await ethers.getContractFactory("Memento");
  const memento = await upgrades.deployProxy(Memento, []);
  console.log("Memento deployed to:", memento.address);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
