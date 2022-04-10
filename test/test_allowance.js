const { expect } = require('chai');
const { ethers, upgrades } = require('hardhat');
const { constants } = require('@openzeppelin/test-helpers');
const { keccak256, getVersion } = require('../scripts/util');
const { parseEther } = require('ethers/lib/utils');
const { Forwarder } = require('../scripts/config.json')['31337'];

describe('Test Allowance', function () {
  const hash = 'QmSQ9zAgT4XpVRAvNdFAF5vEjVWdJa9jht8hL3LTpXouY7';
  const IPFS = 'ipfs://';
  const price = parseEther('0.1');
  const reward = 0;

  let memori;
  let owner, admin, finance, user;

  beforeEach(async function () {
    [owner, admin, finance, user] = await ethers.getSigners();

    const Memori = await ethers.getContractFactory(getVersion());
    memori = await Memori.deploy(Forwarder);
    await memori.setAllowance(owner.address, 10);
  });

  it('Test set allowance by default admin', async function () {
    await memori.connect(owner).setAllowance(owner.address, 5);
    expect(await memori.allowanceOf(owner.address)).to.equal(5);

    await memori.connect(owner).setAllowance(user.address, 10);
    expect(await memori.allowanceOf(user.address)).to.equal(10);
  });

  it.skip('Test set allowance by finance role', async function () {
    const FINANCE_ROLE = keccak256('FINANCE_ROLE');
    const ADMIN_ROLE = keccak256('ADMIN_ROLE');
    const setRoleAdmin = await memori.connect(owner).setRoleAdmin(FINANCE_ROLE, ADMIN_ROLE);
    setRoleAdmin.wait();

    const grantAdminRole = await memori.connect(owner).grantRole(ADMIN_ROLE, admin.address);
    grantAdminRole.wait();

    const grantFinanceRole = await memori.connect(admin).grantRole(FINANCE_ROLE, finance.address);
    grantFinanceRole.wait();

    await expect(memori.connect(admin).setAllowance(admin.address, 10)).to.be.reverted;
    expect(await memori.allowanceOf(admin.address)).to.equal(0);

    await memori.connect(finance).setAllowance(owner.address, 5);
    expect(await memori.allowanceOf(owner.address)).to.equal(5);

    await memori.connect(finance).setAllowance(user.address, 10);
    expect(await memori.allowanceOf(user.address)).to.equal(10);
  });

  it('Test reject non-owner trying to set allowance', async function () {
    await expect(memori.connect(user).setAllowance(user.address, 5))
      .to.be.reverted;
  });

  it('Test mint with allowance', async function () {
    await memori.setAllowance(user.address, 5);
    expect(await memori.allowanceOf(user.address)).to.equal(5);

    await memori.connect(user).mint(user.address, 0, hash, hash, { 'value': 0 });
    expect(await memori.allowanceOf(user.address)).to.equal(4);
    expect(await memori.supply()).to.equal(1);
    expect(await memori.tokenURI(0)).to.equal(IPFS + hash);
    expect(await memori.authorOf(0)).to.equal(user.address);
    expect(await memori.ownerOf(0)).to.equal(user.address);
  });

  after(async function () {
    const balance = await waffle.provider.getBalance(memori.address);
    const tx = await memori.withdrawEther(balance);
    tx.wait();
  });
});