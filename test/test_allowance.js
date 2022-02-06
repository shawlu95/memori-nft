const { expect } = require("chai");
const { ethers, upgrades } = require("hardhat");
const { constants } = require('@openzeppelin/test-helpers');

describe("Test Allowance", function () {
  const hash = 'QmSQ9zAgT4XpVRAvNdFAF5vEjVWdJa9jht8hL3LTpXouY7';
  const IPFS = 'ipfs://';
  const price = "10000000000000000000";
  const reward = 0;

  let memento;
  let owner, admin, finance, user;

  beforeEach(async function () {
    [owner, admin, finance, user] = await ethers.getSigners();

    const Memento = await ethers.getContractFactory("MementoV2");
    memento = await upgrades.deployProxy(Memento, [price, reward, constants.ZERO_ADDRESS]);
  });

  it("Test set allowance by default admin", async function () {
    await memento.connect(owner).setAllowance(owner.address, 5);
    expect(await memento.allowanceOf(owner.address)).to.equal(5);

    await memento.connect(owner).setAllowance(user.address, 10);
    expect(await memento.allowanceOf(user.address)).to.equal(10);
  });

  it("Test set allowance by finance role", async function () {
    const FINANCE_ROLE = await memento.FINANCE_ROLE();
    const ADMIN_ROLE = await memento.ADMIN_ROLE();
    const setRoleAdmin = await memento.connect(owner).setRoleAdmin(FINANCE_ROLE, ADMIN_ROLE);
    setRoleAdmin.wait();

    const grantAdminRole = await memento.connect(owner).grantRole(ADMIN_ROLE, admin.address);
    grantAdminRole.wait();

    const grantFinanceRole = await memento.connect(admin).grantRole(FINANCE_ROLE, finance.address);
    grantFinanceRole.wait();

    await expect(memento.connect(admin).setAllowance(admin.address, 10)).to.be.reverted;
    expect(await memento.allowanceOf(admin.address)).to.equal(0);

    await memento.connect(finance).setAllowance(owner.address, 5);
    expect(await memento.allowanceOf(owner.address)).to.equal(5);

    await memento.connect(finance).setAllowance(user.address, 10);
    expect(await memento.allowanceOf(user.address)).to.equal(10);
  });

  it("Test reject non-owner trying to set allowance", async function () {
    await expect(memento.connect(user).setAllowance(user.address, 5))
      .to.be.reverted;
  });

  it("Test mint with allowance", async function () {
    await memento.setAllowance(user.address, 5);
    expect(await memento.allowanceOf(user.address)).to.equal(5);

    await memento.connect(user).payToMint(user.address, 0, hash, hash, { "value": 0 });
    expect(await memento.allowanceOf(user.address)).to.equal(4);
    expect(await memento.supply()).to.equal(1);
    expect(await memento.tokenURI(0)).to.equal(IPFS + hash);
    expect(await memento.authorOf(0)).to.equal(user.address);
    expect(await memento.ownerOf(0)).to.equal(user.address);
  });

  after(async function () {
    const balance = await waffle.provider.getBalance(memento.address);
    const tx = await memento.withdrawEther(balance);
    tx.wait();
  });
});