const { expect } = require("chai");
const { ethers, waffle, upgrades } = require("hardhat");
const { constants } = require('@openzeppelin/test-helpers');
const { getVersion } = require('../scripts/address');

describe("Test timed reveal", function () {
  const timeURI = 'QmSQ9zAgT4XpVRAvNdFAF5vEjVWdJa9jht8hL3LTpXouY7';
  const actualURI = 'QmUyjqWUf6SzWBTZjCbZh1QbQBb7CyyKGAhxRfADCtVhDg';
  const IPFS = 'ipfs://';
  const price = "10000000000000000000";
  const reward = 0;

  let memori;
  let owner;
  let user;

  beforeEach(async function () {
    [owner, user] = await ethers.getSigners();

    const Memori = await ethers.getContractFactory(getVersion());
    memori = await upgrades.deployProxy(Memori, [price, reward, constants.ZERO_ADDRESS]);
  });

  it("Test timed reveal", async function () {
    const oneHour = 60 * 60;
    const blockNumBefore = await ethers.provider.getBlockNumber();
    const blockBefore = await ethers.provider.getBlock(blockNumBefore);
    const timestampBefore = blockBefore.timestamp;
    const revealAt = timestampBefore + oneHour; // e.g. 1644133774

    expect(await memori.supply()).to.equal(0);

    await memori.mint(owner.address, owner.address, revealAt, timeURI, actualURI);
    expect(await memori.supply()).to.equal(1);
    expect(await memori.tokenURI(0)).to.equal(IPFS + timeURI);
    expect(await memori.authorOf(0)).to.equal(owner.address);
    expect(await memori.ownerOf(0)).to.equal(owner.address);
    expect(await memori.revealAt(0)).to.equal(revealAt);

    await ethers.provider.send('evm_increaseTime', [oneHour]);
    await ethers.provider.send('evm_mine');

    expect(await memori.tokenURI(0)).to.equal(IPFS + actualURI);
  });

  after(async function () {
    const balance = await waffle.provider.getBalance(memori.address);
    const tx = await memori.withdrawEther(balance);
    tx.wait();
  });
});