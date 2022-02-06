const { expect } = require("chai");
const { ethers, waffle, upgrades } = require("hardhat");
const { constants } = require('@openzeppelin/test-helpers');

describe("Test timed reveal", function () {
  const timeURI = 'QmSQ9zAgT4XpVRAvNdFAF5vEjVWdJa9jht8hL3LTpXouY7';
  const actualURI = 'QmUyjqWUf6SzWBTZjCbZh1QbQBb7CyyKGAhxRfADCtVhDg';
  const IPFS = 'ipfs://';
  const price = "10000000000000000000";
  const reward = 0;

  let memento;
  let owner;
  let user;

  beforeEach(async function () {
    [owner, user] = await ethers.getSigners();

    const Memento = await ethers.getContractFactory("MementoV2");
    memento = await upgrades.deployProxy(Memento, [price, reward, constants.ZERO_ADDRESS]);
  });

  it("Test timed reveal", async function () {
    const oneHour = 60 * 60;
    const blockNumBefore = await ethers.provider.getBlockNumber();
    const blockBefore = await ethers.provider.getBlock(blockNumBefore);
    const timestampBefore = blockBefore.timestamp;
    const revealAt = timestampBefore + oneHour; // e.g. 1644133774

    expect(await memento.supply()).to.equal(0);

    await memento.mint(owner.address, owner.address, revealAt, timeURI, actualURI);
    expect(await memento.supply()).to.equal(1);
    expect(await memento.tokenURI(0)).to.equal(IPFS + timeURI);
    expect(await memento.authorOf(0)).to.equal(owner.address);
    expect(await memento.ownerOf(0)).to.equal(owner.address);
    expect(await memento.revealAt(0)).to.equal(revealAt);

    await ethers.provider.send('evm_increaseTime', [oneHour]);
    await ethers.provider.send('evm_mine');

    expect(await memento.tokenURI(0)).to.equal(IPFS + actualURI);
  });

  after(async function () {
    const balance = await waffle.provider.getBalance(memento.address);
    const tx = await memento.withdrawEther(balance);
    tx.wait();
  });
});