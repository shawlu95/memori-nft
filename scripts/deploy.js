const { ethers, upgrades } = require('hardhat');
const hre = require('hardhat');
const { getVersion } = require('./util');
const { parseEther } = require('ethers/lib/utils');

async function main() {
  await hre.run('compile');
  const chainId = hre.network.config.chainId;

  const [owner] = await ethers.getSigners();
  console.log("owner", owner.address);

  const price = parseEther('10');
  const Memori = await ethers.getContractFactory(getVersion());
  const { Forwarder, RelayHub } = require('./config.json')[chainId];
  const memori = await Memori.deploy(Forwarder);
  await memori.setPrice(price);
  await memori.setAllowance(owner.address, 1000);
  console.log('Memori deployed to:', memori.address);

  const Paymaster = await ethers.getContractFactory("MemoriPaymaster");
  const paymaster = await Paymaster.deploy();
  await paymaster.whitelistSender(owner.address);
  await paymaster.whitelistTarget(memori.address);
  await paymaster.setRelayHub(RelayHub);
  await paymaster.setTrustedForwarder(Forwarder);
  console.log("Paymaster deployed to:", paymaster.address);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
