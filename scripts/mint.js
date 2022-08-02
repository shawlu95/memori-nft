const { ethers, upgrades } = require('hardhat');
const hre = require('hardhat');
const { parseEther } = require('ethers/lib/utils');
const fs = require('fs');
const readline = require("readline");

async function main() {
  await hre.run('compile');
  const chainId = hre.network.config.chainId;
  const [admin] = await ethers.getSigners();
  const { Memori: memoriAddress } = require("./config.json")[chainId];
  const Memori = await ethers.getContractFactory('Memori');
  const memori = Memori.attach(memoriAddress);

  const readInterface = readline.createInterface({
    input: fs.createReadStream('scripts/log.txt')
  });

  // MEMO Safe
  const recipient = "0x805e28ED2897891C1167311dcC2d124C859F77C4";

  for await (const line of readInterface) {
    var [id, author, owner, uri, revealAt, revealed, preview] = line.split(',');
    console.log(id, owner, author, revealAt, uri, preview || uri)
    const tx = await memori.mint(recipient, revealAt, uri, preview || uri, { gasLimit: 500000 });
    await tx.wait();
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
