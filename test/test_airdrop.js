const { expect } = require('chai');
const { ethers, upgrades } = require('hardhat');
const { constants } = require('@openzeppelin/test-helpers');
const { getVersion } = require('../scripts/address');
const { parseEther } = require('ethers/lib/utils');

describe('Test Airdrop', function () {
  const hash = 'QmSQ9zAgT4XpVRAvNdFAF5vEjVWdJa9jht8hL3LTpXouY7';
  const IPFS = 'ipfs://';
  const price = parseEther('0.1');
  const reward = 0;

  let memori;
  let owner;
  let user1;
  let user2;

  beforeEach(async function () {
    [owner, user1, user2] = await ethers.getSigners();

    const Memori = await ethers.getContractFactory(getVersion());
    memori = await Memori.deploy(price);
  });

  it('Mint by owner, assign to another user', async function () {
    expect(await memori.supply()).to.equal(0);

    await memori.mint(user1.address, owner.address, 0, hash, hash);
    expect(await memori.supply()).to.equal(1);
    expect(await memori.tokenURI(0)).to.equal(IPFS + hash);
    expect(await memori.authorOf(0)).to.equal(owner.address);
    expect(await memori.ownerOf(0)).to.equal(user1.address);
  });

  it('Mint by owner, assign to another user', async function () {
    const price = await memori.price();
    expect(await memori.supply()).to.equal(0);

    await memori.connect(user1).payToMint(user2.address, 0, hash, hash, { 'value': price });
    expect(await memori.supply()).to.equal(1);
    expect(await memori.tokenURI(0)).to.equal(IPFS + hash);
    expect(await memori.authorOf(0)).to.equal(user1.address);
    expect(await memori.ownerOf(0)).to.equal(user2.address);
  });

  after(async function () {
    const balance = await waffle.provider.getBalance(memori.address);
    const tx = await memori.withdrawEther(balance);
    tx.wait();
  });
});