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

  // const tokenAddress = '0xbbeD381763561Ccc4Ffd45589A26894D4f803960';
  // const memo = await Memo.attach(tokenAddress);

  const price = "100000000000000000";
  const reward = "1000000000000000000";
  const Memento = await ethers.getContractFactory("Memento");
  const memento = await upgrades.deployProxy(Memento, [price, reward, memo.address]);
  console.log("Memento deployed to:", memento.address);

  // const nftAddress = '0x2310A2e50747BDC79704B58b42D52f6Ee9519A7E';
  // const memento = await Memento.attach(nftAddress);

  await memo.connect(owner).send(memento.address, tokenSupply, []);
  // await memento.connect(owner).setPrice('100000000000000000');


}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
