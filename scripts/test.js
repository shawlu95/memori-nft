

const { ethers, upgrades } = require("hardhat");
const hre = require("hardhat");
const address = require("./address");

async function main() {
  console.log(address.getNftAddress())

}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
