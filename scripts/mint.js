

const { ethers, upgrades } = require("hardhat");
const hre = require("hardhat");

async function main() {
  await hre.run('compile');
  const [owner] = await ethers.getSigners();
  const nftAddress = '0x84725B0E283E873105f93B0762257e44c0b16295';
  const recipient = ethers.utils.getAddress('0xBe83329a94e96298C9eCBaaEb81094b42b294aeB');
  const Memento = await ethers.getContractFactory("Memento");
  const memento = Memento.attach(nftAddress);
  console.log("Memento:", memento.address);
  console.log("Name", await memento.name());
  console.log("Symbol", await memento.symbol());

  const tokenAddress = '0x9824A6d079dE2eD925E5DbcE2C0c2E2D468b0705';
  const Memo = await ethers.getContractFactory("Memo");
  const memo = Memo.attach(tokenAddress);

  const hash = 'Qmb5PrYvtVDMtwgjfSmYbmZL6ZAicqVK8ojW6hUqnhgWVx';
  const tx = await memento.payToMint(owner.address, hash, { value: "100000000000000000" });

  await tx.wait();
  const supply = (await memento.supply()).toNumber();
  console.log("Supply:", supply);
  console.log("Newly minted:", await memento.tokenURI(supply - 1));
  console.log("Author:", await memento.authorOf(supply - 1));
  console.log("Owner:", await memento.ownerOf(supply - 1));
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
