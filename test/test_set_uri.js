const { expect } = require('chai');
const { ethers, waffle, upgrades } = require('hardhat');
const { constants } = require('@openzeppelin/test-helpers');
const { getVersion } = require('../scripts/address');
const { parseEther } = require('ethers/lib/utils');

describe.skip('Test Set URI', function () {
  const hash0 = 'QmSQ9zAgT4XpVRAvNdFAF5vEjVWdJa9jht8hL3LTpXouY7';
  const hash1 = 'QmUyjqWUf6SzWBTZjCbZh1QbQBb7CyyKGAhxRfADCtVhDg';
  const IPFS = 'ipfs://';
  const price = parseEther('0.1');
  const reward = 0;

  let memori;
  let owner;
  let user;

  beforeEach(async function () {
    [owner, user] = await ethers.getSigners();

    const Memori = await ethers.getContractFactory(getVersion());
    memori = await Memori.deploy(price, reward, constants.ZERO_ADDRESS);

    const mint0 = await memori.mint(owner.address, owner.address, 0, hash0, hash0);
    mint0.wait();

    const mint1 = await memori.mint(user.address, owner.address, 0, hash1, hash1);
    mint1.wait();

    expect(await memori.supply()).to.equal(2);
    expect(await memori.tokenURI(0)).to.equal(IPFS + hash0);
    expect(await memori.authorOf(0)).to.equal(owner.address);
    expect(await memori.ownerOf(0)).to.equal(owner.address);

    expect(await memori.tokenURI(1)).to.equal(IPFS + hash1);
    expect(await memori.authorOf(1)).to.equal(owner.address);
    expect(await memori.ownerOf(1)).to.equal(user.address);
  });

  it('Test set uri', async function () {
    await memori.setTokenURI(0, hash1);
    expect(await memori.tokenURI(0)).to.equal(IPFS + hash1);
    expect(await memori.tokenURI(1)).to.equal(IPFS + hash1);
  });

  it('Test set by bad user', async function () {
    await expect(memori.connect().setTokenURI(0, hash1)).to.be.reverted;
  });
});