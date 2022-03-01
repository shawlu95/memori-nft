const { expect } = require("chai");
const { ethers, upgrades } = require("hardhat");
const { constants } = require('@openzeppelin/test-helpers');
const { getVersion } = require('../scripts/address');

// Deprecated: use role-based access control
describe.skip("Test Ownable", function () {
  const hash = 'QmSQ9zAgT4XpVRAvNdFAF5vEjVWdJa9jht8hL3LTpXouY7';

  const price = "10000000000000000000";
  const reward = 0;

  let memori;
  let owner;
  let user;

  beforeEach(async function () {
    [owner, user] = await ethers.getSigners();

    const Memori = await ethers.getContractFactory(getVersion());
    memori = await upgrades.deployProxy(Memori, [price, reward, constants.ZERO_ADDRESS]);
  });

  it("Test owner", async function () {
    expect(await memori.owner()).to.equal(owner.address);
    await expect(memori.connect(user).mint(user.address, user.address, 0, hash, hash))
      .to.be.revertedWith("Ownable: caller is not the owner");
  });

  it("Test transfer ownsership", async function () {
    const tx = await memori.connect(owner).transferOwnership(user.address);
    tx.wait();
    expect(await memori.owner()).to.equal(user.address);
    await memori.connect(user).mint(user.address, user.address, 0, hash, hash);
    expect(await memori.supply()).to.equal(1);
    expect(await memori.ownerOf(0)).to.equal(user.address);
  });
});