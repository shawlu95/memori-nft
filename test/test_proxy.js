const { expect } = require('chai');
const { ethers, waffle, upgrades } = require('hardhat');
const { constants } = require('@openzeppelin/test-helpers');
const { getVersion } = require('../scripts/util');
const { parseEther } = require('ethers/lib/utils');
const { Forwarder } = require('../scripts/config.json')['31337'];

describe.skip('Test proxy', function () {
  const hash = 'QmSQ9zAgT4XpVRAvNdFAF5vEjVWdJa9jht8hL3LTpXouY7';
  const hash2 = 'QmUyjqWUf6SzWBTZjCbZh1QbQBb7CyyKGAhxRfADCtVhDg';
  const IPFS = 'ipfs://';
  const price = parseEther('0.1');
  const reward = 0;

  let memori;
  let owner;
  let user;

  beforeEach(async function () {
    [owner, user] = await ethers.getSigners();

    const Memori = await ethers.getContractFactory('Memori');
    memori = await Memori.deploy(Forwarder);
  });

  it('Test upgrade proxy', async function () {
    expect(await memori.supply()).to.equal(0);

    await memori.mint(owner.address, owner.address, hash);
    expect(await memori.supply()).to.equal(1);
    expect(await memori.tokenURI(0)).to.equal(IPFS + hash);
    expect(await memori.authorOf(0)).to.equal(owner.address);
    expect(await memori.ownerOf(0)).to.equal(owner.address);

    const MemoriNew = await ethers.getContractFactory(getVersion());
    const memoriNew = await upgrades.upgradeProxy(memori.address, MemoriNew);

    expect(await memoriNew.supply()).to.equal(1);
    expect(await memoriNew.tokenURI(0)).to.equal(IPFS + hash);
    expect(await memoriNew.authorOf(0)).to.equal(owner.address);
    expect(await memoriNew.ownerOf(0)).to.equal(owner.address);
    expect(await memoriNew.name()).to.equal('Memori');
  });

  after(async function () {
    const balance = await waffle.provider.getBalance(memori.address);
    const tx = await memori.withdrawEther(balance);
    tx.wait();
  });
});
