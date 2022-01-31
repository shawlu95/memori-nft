

const { ethers, upgrades } = require("hardhat");
const hre = require("hardhat");
// const ethers = hre.ethers;

async function main() {
  await hre.run('compile');
  const [owner] = await ethers.getSigners();
  const address = '0x796902eb370a1c8B06Aa2501760c4378a6a01A4e';
  const Memento = await ethers.getContractFactory("Memento");
  const memento = Memento.attach(address);
  console.log("Memento:", memento.address);
  console.log("Name", await memento.name());
  console.log("Symbol", await memento.symbol());

  // const owner = await memento.owner();
  // console.log("Owner", owner);

  const hash = 'QmSghap2dJkv2n2rJxtAxg4qDZYy1kciDANsoQZKuiCCPw';
  const tx = await memento.payToMint(owner.address, hash, { value: "1000000000000000000" });

  await tx.wait();

  console.log(await memento.supply());
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
