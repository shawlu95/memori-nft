

const { ethers, upgrades } = require("hardhat");
const hre = require("hardhat");
// const ethers = hre.ethers;

async function main() {
  await hre.run('compile');
  const [owner] = await ethers.getSigners();
  const address = '0x84725B0E283E873105f93B0762257e44c0b16295';
  const Memento = await ethers.getContractFactory("Memento");
  const memento = Memento.attach(address);
  console.log("Memento:", memento.address);
  console.log("Name", await memento.name());
  console.log("Symbol", await memento.symbol());

  // const owner = await memento.owner();
  // console.log("Owner", owner);

  const hash = 'QmRDAncvW7ryAauni8Fe3QzFFc1tvpmH6S45VAwa19R457';
  const tx = await memento.payToMint(owner.address, hash, { value: "100000000000000000" });

  // await tx.wait();
  // console.log(await memento.supply());
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
