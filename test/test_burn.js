const { expect } = require("chai");
const { ethers, waffle, upgrades } = require("hardhat");
const { constants } = require('@openzeppelin/test-helpers');

describe("Test Burn", function () {
  const hash0 = 'QmSQ9zAgT4XpVRAvNdFAF5vEjVWdJa9jht8hL3LTpXouY7';
  const hash1 = 'QmUyjqWUf6SzWBTZjCbZh1QbQBb7CyyKGAhxRfADCtVhDg';
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

    const mint0 = await memento.mint(owner.address, owner.address, 0, hash0, hash0);
    mint0.wait();

    const mint1 = await memento.mint(user.address, owner.address, 0, hash1, hash1);
    mint1.wait();

    expect(await memento.supply()).to.equal(2);
    expect(await memento.tokenURI(0)).to.equal(IPFS + hash0);
    expect(await memento.authorOf(0)).to.equal(owner.address);
    expect(await memento.ownerOf(0)).to.equal(owner.address);

    expect(await memento.tokenURI(1)).to.equal(IPFS + hash1);
    expect(await memento.authorOf(1)).to.equal(owner.address);
    expect(await memento.ownerOf(1)).to.equal(user.address);
  });

  it("Test burn by admin", async function () {
    const burn = await memento.connect(owner).burn(0);
    burn.wait();

    expect(await memento.supply()).to.equal(1);

    await expect(memento.tokenURI(0)).to.be.reverted;
    await expect(memento.authorOf(0)).to.be.reverted;
    await expect(memento.ownerOf(0)).to.be.reverted;

    expect(await memento.tokenURI(1)).to.equal(IPFS + hash1);
    expect(await memento.authorOf(1)).to.equal(owner.address);
    expect(await memento.ownerOf(1)).to.equal(user.address);
  });

  it("Test burn by owner", async function () {
    const burn = await memento.connect(user).burn(1);
    burn.wait();

    expect(await memento.supply()).to.equal(1);

    expect(await memento.tokenURI(0)).to.equal(IPFS + hash0);
    expect(await memento.authorOf(0)).to.equal(owner.address);
    expect(await memento.ownerOf(0)).to.equal(owner.address);

    await expect(memento.tokenURI(1)).to.be.reverted;
    await expect(memento.authorOf(1)).to.be.reverted;
    await expect(memento.ownerOf(1)).to.be.reverted;
  });
});