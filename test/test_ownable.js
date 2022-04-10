const { expect } = require('chai');
const { ethers, upgrades } = require('hardhat');
const { constants } = require('@openzeppelin/test-helpers');
const { getVersion } = require('../scripts/util');
const { parseEther } = require('ethers/lib/utils');
const { Forwarder } = require('../scripts/config.json')['31337'];

describe('Test Ownable', function () {
  const hash = 'QmSQ9zAgT4XpVRAvNdFAF5vEjVWdJa9jht8hL3LTpXouY7';

  const price = parseEther('0.1');
  const reward = 0;

  let memori;
  let owner;
  let user;

  beforeEach(async function () {
    [owner, user] = await ethers.getSigners();

    const Memori = await ethers.getContractFactory(getVersion());
    memori = await Memori.deploy(Forwarder);
  });

  it('Test owner', async function () {
    expect(await memori.owner()).to.equal(owner.address);
  });

  it('Test transfer ownsership', async function () {
    const tx = await memori.connect(owner).transferOwnership(user.address);
    tx.wait();
    expect(await memori.owner()).to.equal(user.address);
  });
});