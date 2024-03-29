const { expect } = require('chai');
const { ethers, waffle } = require('hardhat');
const { keccak256, getVersion } = require('../scripts/util');
const { parseEther } = require('ethers/lib/utils');

describe.skip('Test Role', function () {
  const price = parseEther('0.1');
  const reward = 0;

  let memori;
  let owner, admin, minter, user; // same applies to pauser, burner, finance roles
  let ADMIN_ROLE, MINTER_ROLE, PAUSER_ROLE, BURNER_ROLE, FINANCE_ROLE;

  beforeEach(async function () {
    [owner, admin, minter, user] = await ethers.getSigners();

    const Memori = await ethers.getContractFactory(getVersion());
    memori = await Memori.deploy();

    ADMIN_ROLE = keccak256('ADMIN_ROLE');
    MINTER_ROLE = keccak256('MINTER_ROLE');
    PAUSER_ROLE = keccak256('PAUSER_ROLE');
    BURNER_ROLE = keccak256('BURNER_ROLE');
    FINANCE_ROLE = keccak256('FINANCE_ROLE');
  });

  it('Test default admin has all roles', async function () {
    expect(await memori.hasRole(ADMIN_ROLE, owner.address)).to.equal(true);
    expect(await memori.hasRole(MINTER_ROLE, owner.address)).to.equal(true);
    expect(await memori.hasRole(BURNER_ROLE, owner.address)).to.equal(true);
    expect(await memori.hasRole(FINANCE_ROLE, owner.address)).to.equal(true);
  });

  it('Test default admin assigns role admin to role', async function () {
    const setRoleAdmin = await memori
      .connect(owner)
      .setRoleAdmin(MINTER_ROLE, ADMIN_ROLE);
    setRoleAdmin.wait();

    const grantRole = await memori
      .connect(owner)
      .grantRole(ADMIN_ROLE, admin.address);
    grantRole.wait();
    expect(await memori.getRoleAdmin(MINTER_ROLE)).to.equal(ADMIN_ROLE);
    expect(await memori.hasRole(ADMIN_ROLE, admin.address)).to.equal(true);
  });

  it('Test default admin add account to role', async function () {
    const addMinter = await memori
      .connect(owner)
      .grantRole(MINTER_ROLE, minter.address);
    addMinter.wait();
    expect(await memori.hasRole(MINTER_ROLE, minter.address)).to.equal(true);
    expect(await memori.hasRole(MINTER_ROLE, user.address)).to.equal(false);
  });

  it('Test admin add account to role', async function () {
    const setRoleAdmin = await memori.setRoleAdmin(MINTER_ROLE, ADMIN_ROLE);
    setRoleAdmin.wait();
    expect(await memori.getRoleAdmin(MINTER_ROLE)).to.equal(ADMIN_ROLE);

    const grantRole = await memori
      .connect(owner)
      .grantRole(ADMIN_ROLE, admin.address);
    grantRole.wait();
    expect(await memori.hasRole(ADMIN_ROLE, admin.address)).to.equal(true);
    expect(await memori.hasRole(ADMIN_ROLE, user.address)).to.equal(false);

    const addMinter = await memori
      .connect(admin)
      .grantRole(MINTER_ROLE, minter.address);
    addMinter.wait();
    expect(await memori.hasRole(MINTER_ROLE, minter.address)).to.equal(true);
    expect(await memori.hasRole(MINTER_ROLE, user.address)).to.equal(false);
  });

  it('Test revoke admin by owner', async function () {
    const grantRole = await memori
      .connect(owner)
      .grantRole(ADMIN_ROLE, admin.address);
    grantRole.wait();
    expect(await memori.hasRole(ADMIN_ROLE, admin.address)).to.equal(true);

    await expect(memori.connect(admin).revokeRole(ADMIN_ROLE, admin.address)).to
      .be.reverted;

    const revoke = await memori
      .connect(owner)
      .revokeRole(ADMIN_ROLE, admin.address);
    revoke.wait();
    expect(await memori.hasRole(ADMIN_ROLE, admin.address)).to.equal(false);
  });

  it('Test revoke role by admin', async function () {
    const setRoleAdmin = await memori.setRoleAdmin(MINTER_ROLE, ADMIN_ROLE);
    setRoleAdmin.wait();

    const grantRole = await memori
      .connect(owner)
      .grantRole(ADMIN_ROLE, admin.address);
    grantRole.wait();
    expect(await memori.hasRole(ADMIN_ROLE, admin.address)).to.equal(true);

    const addMinter = await memori
      .connect(admin)
      .grantRole(MINTER_ROLE, minter.address);
    addMinter.wait();
    expect(await memori.hasRole(MINTER_ROLE, minter.address)).to.equal(true);

    const revoke = await memori
      .connect(admin)
      .revokeRole(MINTER_ROLE, minter.address);
    revoke.wait();
    expect(await memori.hasRole(MINTER_ROLE, minter.address)).to.equal(false);
  });

  it('Test renounce role', async function () {
    const grantRole = await memori
      .connect(owner)
      .grantRole(ADMIN_ROLE, admin.address);
    grantRole.wait();
    expect(await memori.hasRole(ADMIN_ROLE, admin.address)).to.equal(true);

    const renounce = await memori
      .connect(admin)
      .renounceRole(ADMIN_ROLE, admin.address);
    renounce.wait();
    expect(await memori.hasRole(ADMIN_ROLE, admin.address)).to.equal(false);
  });

  after(async function () {
    const balance = await waffle.provider.getBalance(memori.address);
    const tx = await memori.withdrawEther(balance);
    tx.wait();
  });
});
