const { expect } = require('chai');
const { ethers, waffle } = require('hardhat');
const { getVersion } = require('../scripts/util');

describe('Test Transaction', function () {
  const hash = 'QmSQ9zAgT4XpVRAvNdFAF5vEjVWdJa9jht8hL3LTpXouY7';

  let memori;
  let owner;
  let user;

  beforeEach(async function () {
    [owner, user] = await ethers.getSigners();

    const Memori = await ethers.getContractFactory(getVersion());
    memori = await Memori.deploy();
    await memori.setAllowance(owner.address, 10);
  });

  it('Test pay to mint and withdraw', async function () {
    const price = await memori.price();
    expect(await memori.provider.getBalance(memori.address)).to.equal(0);

    await memori.connect(user).mint(user.address, hash, { value: price });
    expect(await memori.supply()).to.equal(1);
    expect(await waffle.provider.getBalance(memori.address)).to.equal(price);

    await memori.connect(owner).withdrawEther(price);
    expect(await waffle.provider.getBalance(memori.address)).to.equal(0);
  });

  after(async function () {
    const balance = await waffle.provider.getBalance(memori.address);
    const tx = await memori.withdrawEther(balance);
    tx.wait();
  });
});
