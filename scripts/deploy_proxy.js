const { ethers, upgrades } = require("hardhat");
const hre = require("hardhat");

async function main() {
  await hre.run('compile');

  const [owner] = await ethers.getSigners();

  const tokenSupply = "1000000000000000000000000000";
  const Memo = await ethers.getContractFactory("Memo");
  const memo = await upgrades.deployProxy(Memo, ["Memo", "MEMO", tokenSupply]);

  memo.deployed()
  console.log("Token deployed:", memo.address)

  const price = "1000000000000000000";
  const reward = 100;
  const Memento = await ethers.getContractFactory("Memento");
  const memento = await upgrades.deployProxy(Memento, [price, reward, memo.address]);
  console.log("Memento deployed to:", memento.address);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
