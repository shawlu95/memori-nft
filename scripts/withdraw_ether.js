const { ethers, waffle, upgrades } = require("hardhat");
const hre = require("hardhat");
const address = require("./address");

async function main() {
  await hre.run('compile');
  const [owner] = await ethers.getSigners();
  const nftAddress = address.getNftAddress();
  const MementoV2 = await ethers.getContractFactory("MementoV2");
  const memento = await MementoV2.attach(nftAddress);

  const balance = await waffle.provider.getBalance(memento.address);
  (await memento.connect(owner).withdrawEther(balance)).wait();
  const balanceAfter = await waffle.provider.getBalance(memento.address);

  console.log("Contract balance before", balance);
  console.log("Contract balance after", balanceAfter);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
