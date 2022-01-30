const { expect } = require("chai");
const { ethers, waffle, upgrades } = require("hardhat");

describe("Test Transaction", function () {
  const hash = 'QmSQ9zAgT4XpVRAvNdFAF5vEjVWdJa9jht8hL3LTpXouY7';

  let memento;
  let owner;
  let user;

  beforeEach(async function () {
    [owner, user] = await ethers.getSigners();

    const Memento = await ethers.getContractFactory("Memento");
    memento = await upgrades.deployProxy(Memento, []);
  });

  it("Test pay to mint and withdraw", async function () {
    const price = await memento.price();
    expect(await memento.provider.getBalance(memento.address)).to.equal(0);

    await memento.connect(user).payToMint(user.address, hash, {value: price});
    expect(await memento.supply()).to.equal(1);
    expect(await waffle.provider.getBalance(memento.address)).to.equal(price);

    await memento.connect(owner).withdraw(price);
    expect(await waffle.provider.getBalance(memento.address)).to.equal(0);
  });

});