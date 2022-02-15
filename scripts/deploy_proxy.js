const { ethers, upgrades } = require("hardhat");
const hre = require("hardhat");
const address = require("./address");

async function main() {
  await hre.run('compile');

  const [owner] = await ethers.getSigners();

  const tokenSupply = "1000000000000000000000000000";
  const Memo = await ethers.getContractFactory("Memo");
  const memo = await Memo.deploy("Memo", "MEMO", tokenSupply);
  memo.deployed()
  console.log("Token deployed:", memo.address);
  // in console, grab a handle of the token
  // const tokenAddress = address.getTokenAddress();
  // const memo = await Memo.attach(tokenAddress);

  const price = "100000000000000000";
  const reward = "1000000000000000000";
  const Memento = await ethers.getContractFactory("MementoV3");
  const memento = await upgrades.deployProxy(Memento, [price, reward, memo.address]);
  console.log("Memento deployed to:", memento.address);
  // in console, grab a handle of the nft
  // const nftAddress = address.getNftAddress();
  // const memento = await Memento.attach(nftAddress);

  // transfer balance to the NFT proxy contract
  await memo.connect(owner).send(memento.address, tokenSupply, []);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
