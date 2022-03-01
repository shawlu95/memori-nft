const { ethers, upgrades } = require("hardhat");
const hre = require("hardhat");
const address = require("./address");

async function main() {
  await hre.run('compile');
  const chainId = hre.network.config.chainId;
  const [owner] = await ethers.getSigners();
  const nftAddress = address.getNftAddress(chainId);
  const tokenAddress = address.getTokenAddress(chainId);
  console.log('nftAddress:', nftAddress);
  console.log('tokenAddress:', tokenAddress);

  const Memento = await ethers.getContractFactory("MementoV4");
  const memento = await upgrades.upgradeProxy(nftAddress, Memento);
  console.log("Memento upgraded:", memento.address);

  memento.connect(owner).setToken(tokenAddress);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
