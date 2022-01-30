const { expect } = require("chai");
const { ethers, waffle, upgrades } = require("hardhat");

describe("Test Price", function () {
  const hash = 'QmSQ9zAgT4XpVRAvNdFAF5vEjVWdJa9jht8hL3LTpXouY7';
  const hash2 = 'QmUyjqWUf6SzWBTZjCbZh1QbQBb7CyyKGAhxRfADCtVhDg';
  const newPrice = 10 ** 9;

  let memento;
  let owner;
  let user;

  beforeEach(async function () {
    [owner, user] = await ethers.getSigners();

    const Memento = await ethers.getContractFactory("Memento");
    memento = await upgrades.deployProxy(Memento, []);
  });

  it("Test owner set price", async function () {
    const oldPrice = await memento.price();

    await memento.payToMint(user.address, hash, {"value": oldPrice});
    expect(await waffle.provider.getBalance(memento.address)).to.equal(oldPrice);

    await memento.setPrice(newPrice);
    await memento.payToMint(user.address, hash2, {"value": newPrice});
    expect(await memento.price()).to.equal(newPrice);
    expect(await waffle.provider.getBalance(memento.address)).to.equal(oldPrice.add(newPrice));
  });

  it("Test reject non-owner trying to set price", async function () {
    await expect(memento.connect(user).setPrice(newPrice))
        .to.be.revertedWith("Ownable: caller is not the owner");
  });
});