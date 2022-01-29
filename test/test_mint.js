const { expect } = require("chai");
const { ethers, waffle } = require("hardhat");

describe("Test Mint", function () {
  const hash = 'QmSQ9zAgT4XpVRAvNdFAF5vEjVWdJa9jht8hL3LTpXouY7';
  const hash2 = 'QmUyjqWUf6SzWBTZjCbZh1QbQBb7CyyKGAhxRfADCtVhDg';
  const IPFS = 'ipfs://';

  let memento;
  let owner;
  let user;

  beforeEach(async function () {
    [owner, user] = await ethers.getSigners();

    const Memento = await ethers.getContractFactory("Memento");
    memento = await Memento.deploy();
  });

  it("Test mint by owner", async function () {
    expect(await memento.supply()).to.equal(0);

    await memento.mint(owner.address, owner.address, hash);
    expect(await memento.supply()).to.equal(1);
    expect(await memento.tokenURI(0)).to.equal(IPFS + hash);
    expect(await memento.authorOf(0)).to.equal(owner.address);
    expect(await memento.ownerOf(0)).to.equal(owner.address);
    
    await memento.mint(owner.address, owner.address, hash2);
    expect(await memento.supply()).to.equal(2);
    expect(await memento.tokenURI(1)).to.equal(IPFS + hash2);
    expect(await memento.authorOf(1)).to.equal(owner.address);
    expect(await memento.ownerOf(1)).to.equal(owner.address);
  });

  it("Test reject duplicate hash", async function () {
    await memento.mint(owner.address, owner.address, hash);

    expect(await memento.supply()).to.equal(1);
    expect(await memento.tokenURI(0)).to.equal(IPFS + hash);
    expect(await memento.authorOf(0)).to.equal(owner.address);
    expect(await memento.ownerOf(0)).to.equal(owner.address);

    await expect(memento.mint(owner.address, owner.address, hash))
      .to.be.revertedWith('Already minted!');
    expect(await memento.supply()).to.equal(1);
  });

  it("Test pay to mint", async function () {
    const price = await memento.price();
    expect(await waffle.provider.getBalance(memento.address)).to.equal(0);

    await memento.payToMint(user.address, hash, {value: price});
    expect(await memento.supply()).to.equal(1);
    expect(await waffle.provider.getBalance(memento.address)).to.equal(price);
  });

  it("Test mint fail non-owner", async function () {
    const [owner, user] = await ethers.getSigners();
    await expect(memento.connect(user).mint(user.address, user.address, hash))
      .to.be.revertedWith("Ownable: caller is not the owner");
  });

  it("Test mint fail insufficient fund", async function() {
    const price = await memento.price();
    await expect(memento.connect(user).payToMint(user.address, hash, {value: price.sub(1)}))
      .to.be.revertedWith("Insufficient fund!");
  });

});