const { expect } = require("chai");
const { ethers, waffle, upgrades } = require("hardhat");
const { constants } = require('@openzeppelin/test-helpers');

describe("Test Role", function () {
  const price = "10000000000000000000";
  const reward = 0;

  let memento;
  let owner, admin, minter, user; // same applies to pauser, burner, finance roles
  let ADMIN_ROLE, MINTER_ROLE, PAUSER_ROLE, BURNER_ROLE, FINANCE_ROLE;

  beforeEach(async function () {
    [owner, admin, minter, user] = await ethers.getSigners();

    const Memento = await ethers.getContractFactory("MementoV2");
    memento = await upgrades.deployProxy(Memento, [price, reward, constants.ZERO_ADDRESS]);

    ADMIN_ROLE = await memento.ADMIN_ROLE();
    MINTER_ROLE = await memento.MINTER_ROLE();
    PAUSER_ROLE = await memento.PAUSER_ROLE();
    BURNER_ROLE = await memento.BURNER_ROLE();
    FINANCE_ROLE = await memento.FINANCE_ROLE();
  });

  it("Test default admin has all roles", async function () {
    expect(await memento.hasRole(ADMIN_ROLE, owner.address)).to.equal(true);
    expect(await memento.hasRole(MINTER_ROLE, owner.address)).to.equal(true);
    expect(await memento.hasRole(PAUSER_ROLE, owner.address)).to.equal(true);
    expect(await memento.hasRole(BURNER_ROLE, owner.address)).to.equal(true);
    expect(await memento.hasRole(FINANCE_ROLE, owner.address)).to.equal(true);
  });

  it("Test default admin assigns role admin to role", async function () {
    const setRoleAdmin = await memento.connect(owner).setRoleAdmin(MINTER_ROLE, ADMIN_ROLE);
    setRoleAdmin.wait();

    const grantRole = await memento.connect(owner).grantRole(ADMIN_ROLE, admin.address);
    grantRole.wait();
    expect(await memento.getRoleAdmin(MINTER_ROLE)).to.equal(ADMIN_ROLE);
    expect(await memento.hasRole(ADMIN_ROLE, admin.address)).to.equal(true);
  });

  it("Test default admin add account to role", async function () {
    const addMinter = await memento.connect(owner).grantRole(MINTER_ROLE, minter.address);
    addMinter.wait();
    expect(await memento.hasRole(MINTER_ROLE, minter.address)).to.equal(true);
    expect(await memento.hasRole(MINTER_ROLE, user.address)).to.equal(false);
  });

  it("Test admin add account to role", async function () {
    const setRoleAdmin = await memento.setRoleAdmin(MINTER_ROLE, ADMIN_ROLE);
    setRoleAdmin.wait();
    expect(await memento.getRoleAdmin(MINTER_ROLE)).to.equal(ADMIN_ROLE);

    const grantRole = await memento.connect(owner).grantRole(ADMIN_ROLE, admin.address);
    grantRole.wait();
    expect(await memento.hasRole(ADMIN_ROLE, admin.address)).to.equal(true);
    expect(await memento.hasRole(ADMIN_ROLE, user.address)).to.equal(false);

    const addMinter = await memento.connect(admin).grantRole(MINTER_ROLE, minter.address);
    addMinter.wait();
    expect(await memento.hasRole(MINTER_ROLE, minter.address)).to.equal(true);
    expect(await memento.hasRole(MINTER_ROLE, user.address)).to.equal(false);
  });

  it("Test revoke admin by owner", async function () {
    const grantRole = await memento.connect(owner).grantRole(ADMIN_ROLE, admin.address);
    grantRole.wait();
    expect(await memento.hasRole(ADMIN_ROLE, admin.address)).to.equal(true);

    await expect(memento.connect(admin).revokeRole(ADMIN_ROLE, admin.address)).to.be.reverted;

    const revoke = await memento.connect(owner).revokeRole(ADMIN_ROLE, admin.address);
    revoke.wait();
    expect(await memento.hasRole(ADMIN_ROLE, admin.address)).to.equal(false);
  });

  it("Test revoke role by admin", async function () {
    const setRoleAdmin = await memento.setRoleAdmin(MINTER_ROLE, ADMIN_ROLE);
    setRoleAdmin.wait();

    const grantRole = await memento.connect(owner).grantRole(ADMIN_ROLE, admin.address);
    grantRole.wait();
    expect(await memento.hasRole(ADMIN_ROLE, admin.address)).to.equal(true);

    const addMinter = await memento.connect(admin).grantRole(MINTER_ROLE, minter.address);
    addMinter.wait();
    expect(await memento.hasRole(MINTER_ROLE, minter.address)).to.equal(true);

    const revoke = await memento.connect(admin).revokeRole(MINTER_ROLE, minter.address);
    revoke.wait();
    expect(await memento.hasRole(MINTER_ROLE, minter.address)).to.equal(false);
  });

  it("Test renounce role", async function () {
    const grantRole = await memento.connect(owner).grantRole(ADMIN_ROLE, admin.address);
    grantRole.wait();
    expect(await memento.hasRole(ADMIN_ROLE, admin.address)).to.equal(true);

    const renounce = await memento.connect(admin).renounceRole(ADMIN_ROLE, admin.address);
    renounce.wait();
    expect(await memento.hasRole(ADMIN_ROLE, admin.address)).to.equal(false);
  });

  after(async function () {
    const balance = await waffle.provider.getBalance(memento.address);
    const tx = await memento.withdrawEther(balance);
    tx.wait();
  });
});