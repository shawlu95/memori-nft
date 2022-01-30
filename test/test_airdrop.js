const { expect } = require("chai");
const { ethers, upgrades } = require("hardhat");

describe("Test Airdrop", function () {
  const hash = 'QmSQ9zAgT4XpVRAvNdFAF5vEjVWdJa9jht8hL3LTpXouY7';
  const IPFS = 'ipfs://';

  let memento;
  let owner;
  let user1;
  let user2;

  beforeEach(async function () {
    [owner, user1, user2] = await ethers.getSigners();

    const Memento = await ethers.getContractFactory("Memento");
    memento = await upgrades.deployProxy(Memento, []);
  });

  it("Mint by owner, assign to another user", async function () {
    expect(await memento.supply()).to.equal(0);

    await memento.mint(user1.address, owner.address, hash);
    expect(await memento.supply()).to.equal(1);
    expect(await memento.tokenURI(0)).to.equal(IPFS + hash);
    expect(await memento.authorOf(0)).to.equal(owner.address);
    expect(await memento.ownerOf(0)).to.equal(user1.address);
  });

  it("Mint by owner, assign to another user", async function () {
    const price = await memento.price();
    expect(await memento.supply()).to.equal(0);

    await memento.connect(user1).payToMint(user2.address, hash, {"value": price});
    expect(await memento.supply()).to.equal(1);
    expect(await memento.tokenURI(0)).to.equal(IPFS + hash);
    expect(await memento.authorOf(0)).to.equal(user1.address);
    expect(await memento.ownerOf(0)).to.equal(user2.address);
  });
});