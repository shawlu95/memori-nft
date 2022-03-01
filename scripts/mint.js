const { ethers, upgrades } = require('hardhat');
const hre = require('hardhat');
const { parseEther } = require('ethers/lib/utils');
const address = require('./address');

async function main() {
  await hre.run('compile');
  const chainId = hre.network.config.chainId;
  const [owner] = await ethers.getSigners();
  const nftAddress = address.getNftAddress(chainId);
  const Memori = await ethers.getContractFactory('Memori');
  const memori = Memori.attach(nftAddress);
  const price = await memori.price();
  console.log('owner', owner.address);
  console.log('Memori:', memori.address);
  console.log('Name', await memori.name());
  console.log('Price', price);
  console.log('Symbol', await memori.symbol());

  const hash = 'QmZVqpCChRFsB89REPRY2ractznCv4KXsL6N4P1QYpZ4Mc';
  const tx = await memori.mint(
    owner.address, owner.address,
    0, hash, hash, { gasLimit: 500000 });

  await tx.wait();
  const supply = (await memori.supply()).toNumber();
  console.log('Supply:', supply);
  console.log('Newly minted:', await memori.tokenURI(supply - 1));
  console.log('Author:', await memori.authorOf(supply - 1));
  console.log('Owner:', await memori.ownerOf(supply - 1));
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
