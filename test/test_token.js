const { ethers } = require('hardhat');
const { expect } = require('chai');
const { getVersion } = require('../scripts/util');

describe.skip('Memo', function () {
  const hash = 'QmSQ9zAgT4XpVRAvNdFAF5vEjVWdJa9jht8hL3LTpXouY7';
  const totalSupply = 1000;

  let token, memori;
  let owner, user;

  beforeEach(async function () {
    [owner, user] = await ethers.getSigners();

    const Memo = await ethers.getContractFactory('Memo');
    token = await Memo.deploy(totalSupply);

    const Memori = await ethers.getContractFactory(getVersion());
    memori = await Memori.deploy();
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
    const deposit = 100;

    const tx = await token.connect(owner).send(memori.address, deposit, []);
    tx.wait();

    expect(await token.balanceOf(owner.address)).to.equal(
      totalSupply - deposit
    );
    expect(await token.balanceOf(memori.address)).to.equal(deposit);
  });

  it('Test reward minter', async function () {
    const price = await memori.price();
    const deposit = 100;

    const tx = await token.connect(owner).send(memori.address, deposit, []);
    tx.wait();

    expect(await token.balanceOf(memori.address)).to.equal(deposit);

    await memori.connect(user).payToMint(user.address, hash, { value: price });

    expect(await token.balanceOf(memori.address)).to.equal(deposit - 10);
    expect(await token.balanceOf(user.address)).to.equal(10);
  });
});
