const { expect } = require('chai');
const { ethers, waffle, upgrades } = require('hardhat');
const { constants } = require('@openzeppelin/test-helpers');
const { getVersion } = require('../scripts/address');
const { keccak256 } = require('../scripts/util');
const { parseEther } = require('ethers/lib/utils');

describe('Test Price', function () {
  const hash = 'QmSQ9zAgT4XpVRAvNdFAF5vEjVWdJa9jht8hL3LTpXouY7';
  const hash2 = 'QmUyjqWUf6SzWBTZjCbZh1QbQBb7CyyKGAhxRfADCtVhDg';
  const price = parseEther('0.1');
  const newPrice = 10 ** 9;
  const reward = 0;

  let oldPrice;

  let memori;
  let owner, admin, finance, user;

  beforeEach(async function () {
    [owner, admin, finance, user] = await ethers.getSigners();

    const Memori = await ethers.getContractFactory(getVersion());
    memori = await Memori.deploy(price);
    await memori.setAllowance(owner.address, 10);
    oldPrice = await memori.price();
  });

  it('Test set price by default admin', async function () {
    await memori.mint(user.address, 0, hash, hash, { 'value': oldPrice });
    expect(await waffle.provider.getBalance(memori.address)).to.equal(oldPrice);

    await memori.setPrice(newPrice);
    await memori.mint(user.address, 0, hash2, hash2, { 'value': newPrice });
    expect(await memori.price()).to.equal(newPrice);
    expect(await waffle.provider.getBalance(memori.address)).to.equal(oldPrice.add(newPrice));
  });

  it.skip('Test set price by finance role', async function () {
    const FINANCE_ROLE = await keccak256('FINANCE_ROLE');
    const ADMIN_ROLE = await keccak256('ADMIN_ROLE');
    const setRoleAdmin = await memori.connect(owner).setRoleAdmin(FINANCE_ROLE, ADMIN_ROLE);
    setRoleAdmin.wait();

    const grantAdminRole = await memori.connect(owner).grantRole(ADMIN_ROLE, admin.address);
    grantAdminRole.wait();

    const grantFinanceRole = await memori.connect(admin).grantRole(FINANCE_ROLE, finance.address);
    grantFinanceRole.wait();

    await expect(memori.connect(admin).setPrice(newPrice)).to.be.reverted;
    expect(await memori.price()).to.equal(oldPrice);

    await memori.connect(finance).setPrice(newPrice);
    expect(await memori.price()).to.equal(newPrice);
  });

  it('Test reject non-owner trying to set price', async function () {
    await expect(memori.connect(user).setPrice(newPrice))
      .to.be.reverted;
  });

  after(async function () {
    const balance = await waffle.provider.getBalance(memori.address);
    const tx = await memori.withdrawEther(balance);
    tx.wait();
  });
});