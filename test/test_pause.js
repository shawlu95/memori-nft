const { expect } = require("chai");
const { ethers, waffle, upgrades } = require("hardhat");
const { constants } = require('@openzeppelin/test-helpers');
const { getVersion } = require('../scripts/address');

describe("Test Pause", function () {
  const hash = 'QmSQ9zAgT4XpVRAvNdFAF5vEjVWdJa9jht8hL3LTpXouY7';
  const hash2 = 'QmUyjqWUf6SzWBTZjCbZh1QbQBb7CyyKGAhxRfADCtVhDg';
  const price = "10000000000000000000";
  const reward = 0;

  let memento;
  let owner;
  let pauser;
  let user;

  beforeEach(async function () {
    [owner, pauser, user] = await ethers.getSigners();

    const Memento = await ethers.getContractFactory(getVersion());
    memento = await upgrades.deployProxy(Memento, [price, reward, constants.ZERO_ADDRESS]);
  });

  it("Test pause by non-admin", async function () {
    await expect(memento.connect(user).pause()).to.be.reverted;
  });

  it("Test pause & unpause by admin", async function () {
    expect(await memento.paused()).to.equal(false);
    const tx = await memento.connect(owner).pause();
    tx.wait();
    expect(await memento.paused()).to.equal(true);

    const tx2 = await memento.connect(owner).unpause();
    tx2.wait();
    expect(await memento.paused()).to.equal(false);
  });

  it("Test pause & unpause by pauser", async function () {
    const pauserRole = await memento.PAUSER_ROLE();

    expect(await memento.hasRole(pauserRole, pauser.address)).to.equal(false);
    const tx1 = await memento.connect(owner).grantRole(pauserRole, pauser.address);
    tx1.wait();
    expect(await memento.hasRole(pauserRole, pauser.address)).to.equal(true);

    expect(await memento.paused()).to.equal(false);
    const tx2 = await memento.connect(pauser).pause();
    tx2.wait();
    expect(await memento.paused()).to.equal(true);

    const tx3 = await memento.connect(pauser).unpause();
    tx3.wait();
    expect(await memento.paused()).to.equal(false);
  });

  it("Test pause mint, pay to mint, transfer, burn", async function () {
    const price = await memento.price();

    const pause = await memento.connect(owner).pause();
    pause.wait();
    expect(await memento.paused()).to.equal(true);

    await expect(memento.connect(owner).mint(owner.address, owner.address, 0, hash, hash)).to.be.reverted;
    await expect(memento.connect(user).payToMint(user.address, 0, hash2, hash2, { value: price })).to.be.reverted;
    await expect(memento.connect(user).transferFrom(user.address, owner.address, 0)).to.be.reverted;
    await expect(memento.burn(0)).to.be.reverted;
  });

  it("Test unpause mint, pay to mint, transfer, burn", async function () {
    const price = await memento.price();

    const pause = await memento.connect(owner).pause();
    pause.wait();
    expect(await memento.paused()).to.equal(true);

    const unpause = await memento.connect(owner).unpause();
    unpause.wait();
    expect(await memento.paused()).to.equal(false);

    const mint = await memento.connect(owner).mint(owner.address, owner.address, 0, hash, hash);
    mint.wait();
    expect(await memento.ownerOf(0)).to.equal(owner.address);

    const payToMint = await memento.connect(user).payToMint(user.address, 0, hash2, hash2, { value: price });
    payToMint.wait();
    expect(await memento.ownerOf(1)).to.equal(user.address);

    const transfer = await memento.connect(owner).transferFrom(owner.address, user.address, 0);
    transfer.wait();
    expect(await memento.ownerOf(0)).to.equal(user.address);
    expect(await memento.balanceOf(user.address)).to.equal(2);
    expect(await memento.supply()).to.equal(2);

    const burn = await memento.connect(user).burn(1);
    burn.wait();
    expect(await memento.balanceOf(user.address)).to.equal(1);
    expect(await memento.supply()).to.equal(1);
  });

  after(async function () {
    const balance = await waffle.provider.getBalance(memento.address);
    const tx = await memento.withdrawEther(balance);
    tx.wait();
  });
});