const { expect } = require("chai");
const { ethers, waffle, upgrades } = require("hardhat");
const { constants } = require('@openzeppelin/test-helpers');

describe("Test Price", function () {
  const hash = 'QmSQ9zAgT4XpVRAvNdFAF5vEjVWdJa9jht8hL3LTpXouY7';
  const hash2 = 'QmUyjqWUf6SzWBTZjCbZh1QbQBb7CyyKGAhxRfADCtVhDg';
  const price = "10000000000000000000";
  const newPrice = 10 ** 9;
  const reward = 0;

  let oldPrice;

  let memento;
  let owner, admin, finance, user;

  beforeEach(async function () {
    [owner, admin, finance, user] = await ethers.getSigners();

    const Memento = await ethers.getContractFactory("MementoV3");
    memento = await upgrades.deployProxy(Memento, [price, reward, constants.ZERO_ADDRESS]);
    oldPrice = await memento.price();
  });

  it("Test set price by default admin", async function () {
    await memento.payToMint(user.address, 0, hash, hash, { "value": oldPrice });
    expect(await waffle.provider.getBalance(memento.address)).to.equal(oldPrice);

    await memento.setPrice(newPrice);
    await memento.payToMint(user.address, 0, hash2, hash2, { "value": newPrice });
    expect(await memento.price()).to.equal(newPrice);
    expect(await waffle.provider.getBalance(memento.address)).to.equal(oldPrice.add(newPrice));
  });

  it("Test set price by finance role", async function () {
    const FINANCE_ROLE = await memento.FINANCE_ROLE();
    const ADMIN_ROLE = await memento.ADMIN_ROLE();
    const setRoleAdmin = await memento.connect(owner).setRoleAdmin(FINANCE_ROLE, ADMIN_ROLE);
    setRoleAdmin.wait();

    const grantAdminRole = await memento.connect(owner).grantRole(ADMIN_ROLE, admin.address);
    grantAdminRole.wait();

    const grantFinanceRole = await memento.connect(admin).grantRole(FINANCE_ROLE, finance.address);
    grantFinanceRole.wait();

    await expect(memento.connect(admin).setPrice(newPrice)).to.be.reverted;
    expect(await memento.price()).to.equal(oldPrice);

    await memento.connect(finance).setPrice(newPrice);
    expect(await memento.price()).to.equal(newPrice);
  });

  it("Test reject non-owner trying to set price", async function () {
    await expect(memento.connect(user).setPrice(newPrice))
      .to.be.reverted;
  });

  after(async function () {
    const balance = await waffle.provider.getBalance(memento.address);
    const tx = await memento.withdrawEther(balance);
    tx.wait();
  });
});