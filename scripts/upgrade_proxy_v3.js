const { ethers, upgrades } = require("hardhat");
const hre = require("hardhat");
const address = require("./address");

// hh verify --network rinkeby --contract contracts/MementoV3.sol:MementoV3 0x5ce5Ac477284A9cEae9E47f3d7643e538348425c
// impl address: 0x5ce5Ac477284A9cEae9E47f3d7643e538348425c
async function main() {
  await hre.run('compile');
  const chainId = hre.network.config.chainId;
  const [owner] = await ethers.getSigners();
  const nftAddress = address.getNftAddress(chainId);
  const tokenAddress = address.getTokenAddress();
  const Memento = await ethers.getContractFactory("MementoV3");
  const memento = await upgrades.upgradeProxy(nftAddress, Memento);
  console.log("Memento upgraded:", memento.address);

  memento.connect(owner).setToken(tokenAddress);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
