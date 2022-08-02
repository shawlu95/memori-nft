const { expect } = require('chai');
const { ethers } = require('hardhat');
const { getVersion } = require('../scripts/util');
const { parseEther } = require('ethers/lib/utils');

describe('Test Ownable', function () {
  let memori;
  let owner;
  let user;

  beforeEach(async function () {
    [owner, user] = await ethers.getSigners();

    const Memori = await ethers.getContractFactory(getVersion());
    memori = await Memori.deploy();
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
