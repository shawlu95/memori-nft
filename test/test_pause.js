const { expect } = require('chai');
const { ethers, waffle } = require('hardhat');
const { keccak256, getVersion } = require('../scripts/util');

describe.skip('Test Pause', function () {
  const hash = 'QmSQ9zAgT4XpVRAvNdFAF5vEjVWdJa9jht8hL3LTpXouY7';

  let memori;
  let owner;
  let pauser;
  let user;

  beforeEach(async function () {
    [owner, pauser, user] = await ethers.getSigners();

    const Memori = await ethers.getContractFactory(getVersion());
    memori = await Memori.deploy();
    await memori.setAllowance(owner.address, 10);
  });

  it('Test pause by non-admin', async function () {
    await expect(memori.connect(user).pause()).to.be.reverted;
  });

  it('Test pause & unpause by admin', async function () {
    expect(await memori.paused()).to.equal(false);
    const tx = await memori.connect(owner).pause();
    tx.wait();
    expect(await memori.paused()).to.equal(true);

    const tx2 = await memori.connect(owner).unpause();
    tx2.wait();
    expect(await memori.paused()).to.equal(false);
  });

  it('Test pause & unpause by pauser', async function () {
    const pauserRole = await keccak256('PAUSER_ROLE');

    expect(await memori.hasRole(pauserRole, pauser.address)).to.equal(false);
    const tx1 = await memori
      .connect(owner)
      .grantRole(pauserRole, pauser.address);
    tx1.wait();
    expect(await memori.hasRole(pauserRole, pauser.address)).to.equal(true);

    expect(await memori.paused()).to.equal(false);
    const tx2 = await memori.connect(pauser).pause();
    tx2.wait();
    expect(await memori.paused()).to.equal(true);

    const tx3 = await memori.connect(pauser).unpause();
    tx3.wait();
    expect(await memori.paused()).to.equal(false);
  });

  it('Test pause mint, transfer, burn', async function () {
    const price = await memori.price();

    const pause = await memori.connect(owner).pause();
    pause.wait();
    expect(await memori.paused()).to.equal(true);

    await expect(memori.connect(owner).mint(owner.address, hash)).to.be
      .reverted;
    await expect(
      memori.connect(user).transferFrom(user.address, owner.address, 0)
    ).to.be.reverted;
    await expect(memori.burn(0)).to.be.reverted;
  });

  it('Test unpause mint, transfer, burn', async function () {
    const price = await memori.price();

    const pause = await memori.connect(owner).pause();
    pause.wait();
    expect(await memori.paused()).to.equal(true);

    const unpause = await memori.connect(owner).unpause();
    unpause.wait();
    expect(await memori.paused()).to.equal(false);

    const mint = await memori.connect(owner).mint(owner.address, hash);
    mint.wait();
    expect(await memori.ownerOf(0)).to.equal(owner.address);

    const transfer = await memori
      .connect(owner)
      .transferFrom(owner.address, user.address, 0);
    transfer.wait();
    expect(await memori.ownerOf(0)).to.equal(user.address);
    expect(await memori.balanceOf(user.address)).to.equal(2);
    expect(await memori.supply()).to.equal(2);

    const burn = await memori.connect(user).burn(1);
    burn.wait();
    expect(await memori.balanceOf(user.address)).to.equal(1);
    expect(await memori.supply()).to.equal(1);
  });

  after(async function () {
    const balance = await waffle.provider.getBalance(memori.address);
    const tx = await memori.withdrawEther(balance);
    tx.wait();
  });
});
