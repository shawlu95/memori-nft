const { ethers, upgrades } = require("hardhat");
const { expect } = require('chai');
const { constants } = require('@openzeppelin/test-helpers');
const { getVersion } = require('../scripts/address');

describe('Memo', function () {
  const hash = 'QmSQ9zAgT4XpVRAvNdFAF5vEjVWdJa9jht8hL3LTpXouY7';
  const totalSupply = 1000;
  const price = "10000000000000000000";
  const reward = 10;
  let token, memento;
  let owner, user;

  beforeEach(async function () {
    [owner, user] = await ethers.getSigners();

    const Memo = await ethers.getContractFactory("Memo");
    token = await Memo.deploy(totalSupply);

    const Memento = await ethers.getContractFactory(getVersion());
    memento = await upgrades.deployProxy(Memento, [price, reward, constants.ZERO_ADDRESS]);
  });

  it('Test name', async function () {
    expect(await token.name()).to.equal('Memo');
  });

  it('Test symbol', async function () {
    expect(await token.symbol()).to.equal('MEMO');
  });

  it('Test mint', async function () {
    const creatorBalance = await token.balanceOf(owner.address);
    expect(creatorBalance).to.equal(totalSupply);
  });

  it('Test deposit token to 721 address', async function () {
    await expect(token.connect(owner).send(memento.address, 10, [])).to.be.reverted;
    await memento.setToken(token.address);
    const deposit = 100;

    const tx = await token.connect(owner).send(memento.address, deposit, []);
    tx.wait();

    expect(await token.balanceOf(owner.address)).to.equal(totalSupply - deposit);
    expect(await token.balanceOf(memento.address)).to.equal(deposit);
  });

  it('Test reward minter', async function () {
    await memento.setToken(token.address);
    const price = await memento.price();
    const deposit = 100;

    const tx = await token.connect(owner).send(memento.address, deposit, []);
    tx.wait();

    expect(await token.balanceOf(memento.address)).to.equal(deposit);

    await memento.connect(user).payToMint(user.address, 0, hash, hash, { value: price });

    expect(await token.balanceOf(memento.address)).to.equal(deposit - 10);
    expect(await token.balanceOf(user.address)).to.equal(10);
  });

});