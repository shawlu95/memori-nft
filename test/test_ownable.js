const { expect } = require("chai");
const { ethers, upgrades } = require("hardhat");

describe("Test Ownable", function () {
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

  it("Test owner", async function () {
    expect(await memento.owner()).to.equal(owner.address);
    await expect(memento.connect(user).mint(user.address, user.address, hash))
      .to.be.revertedWith("Ownable: caller is not the owner");
  });

  it("Test transfer ownsership", async function () {
    memento.transferOwnership(user.address);
    expect(await memento.owner()).to.equal(user.address);
    await memento.connect(user).mint(user.address, user.address, hash);
    expect(await memento.supply()).to.equal(1);
    expect(await memento.ownerOf(0)).to.equal(user.address);
  });
});