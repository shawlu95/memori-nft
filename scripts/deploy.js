const { ethers } = require('hardhat');
const hre = require('hardhat');
const { getVersion } = require('./util');
const { parseEther } = require('ethers/lib/utils');

async function main() {
  await hre.run('compile');

  const [owner, minter] = await ethers.getSigners();
  console.log('owner', owner.address);
  console.log('minter', minter.address);

  const price = parseEther('0.1');
  const Memori = await ethers.getContractFactory(getVersion());
  const memori = await Memori.deploy();
  await memori.setPrice(price);
  await memori.setAllowance(minter.address, 365);
  console.log('Memori deployed to:', memori.address);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
