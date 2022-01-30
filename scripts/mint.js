

const { ethers, upgrades } = require("hardhat");
const hre = require("hardhat");
// const ethers = hre.ethers;

async function main() {
  await hre.run('compile');
  const address = '0xF47702A21ef206320eEc99ADaA542321544887E4';
  const Memento = await ethers.getContractFactory("Memento");
  const memento = Memento.attach(address);
  console.log("Memento:", memento.address);
  console.log("Name", await memento.name());
  console.log("Symbol", await memento.symbol());

  const owner = await memento.owner();
  console.log("Owner", owner);

  const hash = 'QmSghap2dJkv2n2rJxtAxg4qDZYy1kciDANsoQZKuiCCPw';
  const tx = await memento.mint(owner, owner, hash);

  await tx.wait();

  console.log(await memento.supply());
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
