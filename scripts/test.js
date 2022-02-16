

const { ethers, upgrades } = require("hardhat");
const hre = require("hardhat");
const address = require("./address");

async function main() {
  const chainId = hre.network.config.chainId;
  console.log(chainId, address.getNftAddress(chainId));
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
