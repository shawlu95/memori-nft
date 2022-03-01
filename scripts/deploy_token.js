const { ethers, upgrades } = require("hardhat");
const hre = require("hardhat");
const address = require("./address");

async function main() {
  await hre.run('compile');
  const chainId = hre.network.config.chainId;

  const tokenSupply = "1000000000000000000000000000";
  const Memo = await ethers.getContractFactory("Memo");
  const memo = await Memo.deploy(tokenSupply);
  memo.deployed()
  console.log("Token deployed:", memo.address);

  // in console, grab a handle of the token
  // const tokenAddress = address.getTokenAddress(chainId);
  // const memo = await Memo.attach(tokenAddress);

  // transfer balance to the NFT proxy contract
  // const [owner] = await ethers.getSigners();
  // await(memo.connect(owner).send(memento.address, tokenSupply, []);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
