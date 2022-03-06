const { expect } = require('chai');
const { ethers, waffle, upgrades } = require('hardhat');
const { constants } = require('@openzeppelin/test-helpers');
const { getVersion } = require('../scripts/address');
const { keccak256 } = require('../scripts/util');
const { parseEther } = require('ethers/lib/utils');

describe('Test Mint', function () {
  const hash = 'QmSQ9zAgT4XpVRAvNdFAF5vEjVWdJa9jht8hL3LTpXouY7';
  const hash2 = 'QmUyjqWUf6SzWBTZjCbZh1QbQBb7CyyKGAhxRfADCtVhDg';
  const IPFS = 'ipfs://';
  const price = parseEther('0.1');
  const reward = 0;

  let memori;
  let owner;
  let user;

  beforeEach(async function () {
    [owner, minter, user] = await ethers.getSigners();
    const Memori = await ethers.getContractFactory(getVersion());
    memori = await Memori.deploy(price, reward, constants.ZERO_ADDRESS);
  });

  it('Test mint by owner', async function () {
    expect(await memori.supply()).to.equal(0);

    await memori.mint(owner.address, owner.address, 0, hash, hash);
    expect(await memori.supply()).to.equal(1);
    expect(await memori.tokenURI(0)).to.equal(IPFS + hash);
    expect(await memori.authorOf(0)).to.equal(owner.address);
    expect(await memori.ownerOf(0)).to.equal(owner.address);

    await memori.mint(owner.address, owner.address, 0, hash2, hash2);
    expect(await memori.supply()).to.equal(2);
    expect(await memori.tokenURI(1)).to.equal(IPFS + hash2);
    expect(await memori.authorOf(1)).to.equal(owner.address);
    expect(await memori.ownerOf(1)).to.equal(owner.address);
  });

  it('Test mint by minter', async function () {
    const minterRole = keccak256('MINTER_ROLE');
    expect(await memori.hasRole(minterRole, minter.address)).to.equal(false);
    const grantRole = await memori.connect(owner).grantRole(minterRole, minter.address);
    grantRole.wait();
    expect(await memori.hasRole(minterRole, minter.address)).to.equal(true);

    await memori.connect(minter).mint(minter.address, minter.address, 0, hash, hash);
    expect(await memori.supply()).to.equal(1);
    expect(await memori.ownerOf(0)).to.equal(minter.address);
  });

  it('Test reject duplicate hash', async function () {
    await memori.mint(owner.address, owner.address, 0, hash, hash);

    expect(await memori.supply()).to.equal(1);
    expect(await memori.tokenURI(0)).to.equal(IPFS + hash);
    expect(await memori.authorOf(0)).to.equal(owner.address);
    expect(await memori.ownerOf(0)).to.equal(owner.address);

    await expect(memori.mint(owner.address, owner.address, 0, hash, hash))
      .to.be.reverted;
    expect(await memori.supply()).to.equal(1);
  });

  it('Test pay to mint', async function () {
    const price = await memori.price();
    expect(await waffle.provider.getBalance(memori.address)).to.equal(0);

    await memori.payToMint(user.address, 0, hash, hash, { value: price });
    expect(await memori.supply()).to.equal(1);
    expect(await waffle.provider.getBalance(memori.address)).to.equal(price);
  });

  it('Test mint fail non-admin/minter', async function () {
    const [owner, user] = await ethers.getSigners();
    await expect(memori.connect(user).mint(user.address, user.address, 0, hash, hash))
      .to.be.reverted;

    await memori.connect(owner).mint(owner.address, owner.address, 0, hash, hash);
    expect(await memori.supply()).to.equal(1);
  });

  it('Test mint fail insufficient fund', async function () {
    const price = await memori.price();
    await expect(memori.connect(user).payToMint(user.address, 0, hash, hash, { value: price.sub(1) }))
      .to.be.reverted;
  });

  after(async function () {
    const balance = await waffle.provider.getBalance(memori.address);
    const tx = await memori.withdrawEther(balance);
    tx.wait();
  })
});