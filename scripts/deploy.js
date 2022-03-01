const { ethers, upgrades } = require("hardhat");
const hre = require("hardhat");
const address = require("./address");

async function main() {
  await hre.run('compile');
  const chainId = hre.network.config.chainId;

  const [owner] = await ethers.getSigners();


  const Memo = await ethers.getContractFactory("Memo");
  let memo, memento;
  let tokenAddress = address.getTokenAddress(chainId);

  const tokenSupply = "1000000000000000000000000000";
  if (!tokenAddress) {
    memo = await Memo.deploy(tokenSupply, { gasLimit: 3056626 });
    memo.deployed()
    tokenAddress = memo.address;
    console.log("Token deployed:", tokenAddress);
  } else {
    memo = await Memo.attach(tokenAddress);
    console.log('tokenAddress:', tokenAddress);
  }

  const price = "10000000000000000000";
  const reward = "10000000000000000000";
  const Memento = await ethers.getContractFactory("Memori");
  let mementosAddress = address.getNftAddress(chainId);
  if (!mementosAddress) {
    memento = await upgrades.deployProxy(Memento, [price, reward, memo.address], { gasLimit: 3056626 });
    console.log("Memento deployed to:", memento.address);
  } else {
    memento = Memento.attach(mementosAddress);
    console.log('mementosAddress:', mementosAddress);
  }

  // transfer balance to the NFT proxy contract
  await memo.connect(owner).send(memento.address, tokenSupply, [], { gasLimit: 210000 });
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
