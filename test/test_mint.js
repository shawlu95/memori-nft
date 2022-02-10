const { expect } = require("chai");
const { BigNumber } = require("ethers");
const { ethers, waffle, upgrades } = require("hardhat");
const { constants } = require('@openzeppelin/test-helpers');

describe("Test Mint", function () {
  const hash = 'QmSQ9zAgT4XpVRAvNdFAF5vEjVWdJa9jht8hL3LTpXouY7';
  const hash2 = 'QmUyjqWUf6SzWBTZjCbZh1QbQBb7CyyKGAhxRfADCtVhDg';
  const IPFS = 'ipfs://';
  const price = "10000000000000000000";
  const reward = 0;

  let memento;
  let owner;
  let user;

  beforeEach(async function () {
    [owner, minter, user] = await ethers.getSigners();
    const Memento = await ethers.getContractFactory("MementoV3");
    memento = await upgrades.deployProxy(Memento, [price, reward, constants.ZERO_ADDRESS]);
  });

  it("Test mint by owner", async function () {
    expect(await memento.supply()).to.equal(0);

    await memento.mint(owner.address, owner.address, 0, hash, hash);
    expect(await memento.supply()).to.equal(1);
    expect(await memento.tokenURI(0)).to.equal(IPFS + hash);
    expect(await memento.authorOf(0)).to.equal(owner.address);
    expect(await memento.ownerOf(0)).to.equal(owner.address);

    await memento.mint(owner.address, owner.address, 0, hash2, hash2);
    expect(await memento.supply()).to.equal(2);
    expect(await memento.tokenURI(1)).to.equal(IPFS + hash2);
    expect(await memento.authorOf(1)).to.equal(owner.address);
    expect(await memento.ownerOf(1)).to.equal(owner.address);
  });

  it("Test mint by minter", async function () {
    const minterRole = await memento.MINTER_ROLE();
    expect(await memento.hasRole(minterRole, minter.address)).to.equal(false);
    const grantRole = await memento.connect(owner).grantRole(minterRole, minter.address);
    grantRole.wait();
    expect(await memento.hasRole(minterRole, minter.address)).to.equal(true);

    await memento.connect(minter).mint(minter.address, minter.address, 0, hash, hash);
    expect(await memento.supply()).to.equal(1);
    expect(await memento.ownerOf(0)).to.equal(minter.address);
  });

  it("Test reject duplicate hash", async function () {
    await memento.mint(owner.address, owner.address, 0, hash, hash);

    expect(await memento.supply()).to.equal(1);
    expect(await memento.tokenURI(0)).to.equal(IPFS + hash);
    expect(await memento.authorOf(0)).to.equal(owner.address);
    expect(await memento.ownerOf(0)).to.equal(owner.address);

    await expect(memento.mint(owner.address, owner.address, 0, hash, hash))
      .to.be.revertedWith('Already minted!');
    expect(await memento.supply()).to.equal(1);
  });

  it("Test pay to mint", async function () {
    const price = await memento.price();
    expect(await waffle.provider.getBalance(memento.address)).to.equal(0);

    await memento.payToMint(user.address, 0, hash, hash, { value: price });
    expect(await memento.supply()).to.equal(1);
    expect(await waffle.provider.getBalance(memento.address)).to.equal(price);
  });

  it("Test mint fail non-admin/minter", async function () {
    const [owner, user] = await ethers.getSigners();
    await expect(memento.connect(user).mint(user.address, user.address, 0, hash, hash))
      .to.be.reverted;

    await memento.connect(owner).mint(owner.address, owner.address, 0, hash, hash);
    expect(await memento.supply()).to.equal(1);
  });

  it("Test mint fail insufficient fund", async function () {
    const price = await memento.price();
    await expect(memento.connect(user).payToMint(user.address, 0, hash, hash, { value: price.sub(1) }))
      .to.be.revertedWith("Insufficient fund!");
  });

  after(async function () {
    const balance = await waffle.provider.getBalance(memento.address);
    const tx = await memento.withdrawEther(balance);
    tx.wait();
  })
});