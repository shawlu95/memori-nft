const { ethers, waffle } = require('hardhat');
const hre = require('hardhat');
const address = require('./address');

async function main() {
  await hre.run('compile');
  const chainId = hre.network.config.chainId;
  const [owner] = await ethers.getSigners();
  const nftAddress = address.getNftAddress(chainId);
  const Memori = await ethers.getContractFactory('MemoriV3');
  const memori = await Memori.attach(nftAddress);

  const balance = await waffle.provider.getBalance(memori.address);
  (await memori.connect(owner).withdrawEther(balance)).wait();
  const balanceAfter = await waffle.provider.getBalance(memori.address);

  console.log('Contract balance before', balance);
  console.log('Contract balance after', balanceAfter);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
