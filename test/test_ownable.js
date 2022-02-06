const { expect } = require("chai");
const { ethers, upgrades } = require("hardhat");
const { constants } = require('@openzeppelin/test-helpers');

describe.skip("Test Ownable", function () {
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

  it("Test owner", async function () {
    expect(await memento.owner()).to.equal(owner.address);
    await expect(memento.connect(user).mint(user.address, user.address, 0, hash, hash))
      .to.be.revertedWith("Ownable: caller is not the owner");
  });

  it("Test transfer ownsership", async function () {
    const tx = await memento.connect(owner).transferOwnership(user.address);
    tx.wait();
    expect(await memento.owner()).to.equal(user.address);
    await memento.connect(user).mint(user.address, user.address, 0, hash, hash);
    expect(await memento.supply()).to.equal(1);
    expect(await memento.ownerOf(0)).to.equal(user.address);
  });
});