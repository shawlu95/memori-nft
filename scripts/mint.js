

const { ethers, upgrades } = require("hardhat");
const hre = require("hardhat");
const address = require("./address");

async function main() {
  await hre.run('compile');
  const chainId = hre.network.config.chainId;
  const [owner] = await ethers.getSigners();
  const nftAddress = address.getNftAddress(chainId);
  const recipient = ethers.utils.getAddress('0xBe83329a94e96298C9eCBaaEb81094b42b294aeB');
  const Memento = await ethers.getContractFactory("Memento");
  const memento = Memento.attach(nftAddress);
  console.log("Memento:", memento.address);
  console.log("Name", await memento.name());
  console.log("Symbol", await memento.symbol());

  const tokenAddress = address.getTokenAddress();
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
