const { expect } = require("chai");
const { ethers, waffle, upgrades } = require("hardhat");

describe("Test proxy", function () {
  const hash = 'QmSQ9zAgT4XpVRAvNdFAF5vEjVWdJa9jht8hL3LTpXouY7';
  const hash2 = 'QmUyjqWUf6SzWBTZjCbZh1QbQBb7CyyKGAhxRfADCtVhDg';
  const IPFS = 'ipfs://';

  let memento;
  let owner;
  let user;

  beforeEach(async function () {
    [owner, user] = await ethers.getSigners();

    const Memento = await ethers.getContractFactory("Memento");
    memento = await upgrades.deployProxy(Memento, []);
  });

  it("Test upgrade proxy", async function () {
    expect(await memento.supply()).to.equal(0);

    await memento.mint(owner.address, owner.address, hash);
    expect(await memento.supply()).to.equal(1);
    expect(await memento.tokenURI(0)).to.equal(IPFS + hash);
    expect(await memento.authorOf(0)).to.equal(owner.address);
    expect(await memento.ownerOf(0)).to.equal(owner.address);

    expect(await memento.name()).to.equal("Memento Script Betas");
    
    const MementoV2 = await ethers.getContractFactory("MementoV2");
    const mementoV2 = await upgrades.upgradeProxy(memento.address, MementoV2);

    expect(await mementoV2.supply()).to.equal(1);
    expect(await mementoV2.tokenURI(0)).to.equal(IPFS + hash);
    expect(await mementoV2.authorOf(0)).to.equal(owner.address);
    expect(await mementoV2.ownerOf(0)).to.equal(owner.address);

    expect(await memento.name()).to.equal("Memento Script Betas");
  });
});