const { ethers, upgrades } = require("hardhat");
const hre = require("hardhat");
const address = require("./address");

async function main() {
  await hre.run('compile');
  const chainId = hre.network.config.chainId;
  const [owner] = await ethers.getSigners();
  const nftAddress = address.getNftAddress(chainId);
  const Memento = await ethers.getContractFactory("Memento");
  const memento = Memento.attach(nftAddress);
  const price = await memento.price();
  console.log('owner', owner.address);
  console.log("Memento:", memento.address);
  console.log("Name", await memento.name());
  console.log("Price", price);
  console.log("Symbol", await memento.symbol());

  const hash = 'QmScRachNaWvpsShc1UNwppBy27nRwdGUJLyPLAVcTsGFs';
  const tx = await memento.payToMint(owner.address, 0, hash, hash, { value: "100000000000000000", gasLimit: 500000 });

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
