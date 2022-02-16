const { ethers, waffle, upgrades } = require("hardhat");
const hre = require("hardhat");
const address = require("./address");

async function main() {
  await hre.run('compile');
  const chainId = hre.network.config.chainId;
  const [owner] = await ethers.getSigners();
  const nftAddress = address.getNftAddress(chainId);
  const Memento = await ethers.getContractFactory("MementoV3");
  const memento = await Memento.attach(nftAddress);

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
