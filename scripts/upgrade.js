const { ethers, upgrades } = require('hardhat');
const hre = require('hardhat');
const address = require('./address');

async function main() {
  await hre.run('compile');
  const chainId = hre.network.config.chainId;

  const nftAddress = address.getNftAddress(chainId);
  const Memori = await ethers.getContractFactory('Memori');
  const memori = await upgrades.upgradeProxy(nftAddress, Memori, { gasLimit: 5000000 });
  console.log('Memori upgraded:', memori.address);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
