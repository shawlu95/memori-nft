const { expect } = require("chai");
const { ethers, waffle, upgrades } = require("hardhat");
const { constants } = require('@openzeppelin/test-helpers');
const { getVersion } = require('../scripts/address');

describe("Test Transaction", function () {
  const hash = 'QmSQ9zAgT4XpVRAvNdFAF5vEjVWdJa9jht8hL3LTpXouY7';
  const price = "10000000000000000000";
  const reward = 0;

  let memento;
  let owner;
  let user;

  beforeEach(async function () {
    [owner, user] = await ethers.getSigners();

    const Memento = await ethers.getContractFactory(getVersion());
    memento = await upgrades.deployProxy(Memento, [price, reward, constants.ZERO_ADDRESS]);
  });

  it("Test pay to mint and withdraw", async function () {
    const price = await memento.price();
    expect(await memento.provider.getBalance(memento.address)).to.equal(0);

    await memento.connect(user).payToMint(user.address, 0, hash, hash, { value: price });
    expect(await memento.supply()).to.equal(1);
    expect(await waffle.provider.getBalance(memento.address)).to.equal(price);

    await memento.connect(owner).withdrawEther(price);
    expect(await waffle.provider.getBalance(memento.address)).to.equal(0);
  });

  after(async function () {
    const balance = await waffle.provider.getBalance(memento.address);
    const tx = await memento.withdrawEther(balance);
    tx.wait();
  });
});