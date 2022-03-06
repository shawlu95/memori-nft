const { ethers, upgrades } = require('hardhat');
const hre = require('hardhat');
const { parseEther } = require('ethers/lib/utils');
const address = require('./address');

async function main() {
  await hre.run('compile');
  const chainId = hre.network.config.chainId;

  const [owner] = await ethers.getSigners();


  const Memo = await ethers.getContractFactory('Memo');
  let memo, memento;
  let tokenAddress = address.getTokenAddress(chainId);

  const tokenSupply = parseEther('1000000000');
  if (!tokenAddress) {
    memo = await Memo.deploy(tokenSupply, { gasLimit: 3000000 });
    memo.deployed()
    tokenAddress = memo.address;
    console.log('Token deployed:', tokenAddress);
  } else {
    memo = await Memo.attach(tokenAddress);
    console.log('tokenAddress:', tokenAddress);
  }

  const price = parseEther('10');
  const reward = parseEther('10');
  const Memori = await ethers.getContractFactory('Memori');
  let memoriAddress = address.getNftAddress(chainId);
  if (!memoriAddress) {
    memento = await Memori.deploy(price, reward, memo.address, { gasLimit: 4000000 });
    console.log('Memori deployed to:', memento.address);
  } else {
    memento = Memori.attach(memoriAddress);
    console.log('memoriAddress:', memoriAddress);
  }

  // transfer balance to the NFT proxy contract
  await memo.connect(owner).send(memento.address, tokenSupply, [], { gasLimit: 210000 });
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
