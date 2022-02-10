const { expect } = require("chai");
const { ethers, waffle, upgrades } = require("hardhat");
const { constants } = require('@openzeppelin/test-helpers');

describe("Test proxy", function () {
  const hash = 'QmSQ9zAgT4XpVRAvNdFAF5vEjVWdJa9jht8hL3LTpXouY7';
  const hash2 = 'QmUyjqWUf6SzWBTZjCbZh1QbQBb7CyyKGAhxRfADCtVhDg';
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

  it("Test upgrade proxy", async function () {
    expect(await memento.supply()).to.equal(0);

    await memento.mint(owner.address, owner.address, 0, hash, hash);
    expect(await memento.supply()).to.equal(1);
    expect(await memento.tokenURI(0)).to.equal(IPFS + hash);
    expect(await memento.authorOf(0)).to.equal(owner.address);
    expect(await memento.ownerOf(0)).to.equal(owner.address);

    const MementoNew = await ethers.getContractFactory("MementoV3");
    const mementoNew = await upgrades.upgradeProxy(memento.address, MementoNew);

    expect(await mementoNew.supply()).to.equal(1);
    expect(await mementoNew.tokenURI(0)).to.equal(IPFS + hash);
    expect(await mementoNew.authorOf(0)).to.equal(owner.address);
    expect(await mementoNew.ownerOf(0)).to.equal(owner.address);
    expect(await mementoNew.name()).to.equal("Memento Script Beta 2.2");
  });

  after(async function () {
    const balance = await waffle.provider.getBalance(memento.address);
    const tx = await memento.withdrawEther(balance);
    tx.wait();
  });
});