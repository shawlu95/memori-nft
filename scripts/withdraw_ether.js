const { ethers, waffle, upgrades } = require("hardhat");
const hre = require("hardhat");
// const ethers = hre.ethers;

async function main() {
  await hre.run('compile');
  const [owner] = await ethers.getSigners();
  const address = "0x84725B0E283E873105f93B0762257e44c0b16295";
  const MementoV2 = await ethers.getContractFactory("MementoV2");
  const memento = await MementoV2.attach(address);

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
