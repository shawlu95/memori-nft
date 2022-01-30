

const { ethers, upgrades } = require("hardhat");
const hre = require("hardhat");
// const ethers = hre.ethers;

async function main() {
  await hre.run('compile');
  const address = '0x06B7e365aFB064A9b499Ff0A26F39CF0C30e1424';
  const Memento = await ethers.getContractFactory("Memento");
  const memento = Memento.attach(address);
  console.log("Memento:", memento.address);
  console.log("Name", await memento.name());
  console.log("Symbol", await memento.symbol());

  const owner = await memento.owner();
  console.log("Owner", owner);

  const hash = '61ef088f9a4ba38adcfaeddf';
  await memento.mint(owner, owner, hash);

  console.log(await memento.supply());
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
