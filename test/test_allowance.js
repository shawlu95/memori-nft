const { expect } = require("chai");
const { ethers, upgrades } = require("hardhat");

describe("Test Allowance", function () {
  const hash = 'QmSQ9zAgT4XpVRAvNdFAF5vEjVWdJa9jht8hL3LTpXouY7';
  const IPFS = 'ipfs://';

  let memento;
  let owner;
  let user;

  beforeEach(async function () {
    [owner, user] = await ethers.getSigners();

    const Memento = await ethers.getContractFactory("Memento");
    memento = await upgrades.deployProxy(Memento, []);
  });

  it("Test owner set allowance", async function () {
    await memento.setAllowance(owner.address, 5);
    expect(await memento.allowanceOf(owner.address)).to.equal(5);

    await memento.setAllowance(user.address, 10);
    expect(await memento.allowanceOf(user.address)).to.equal(10);
  });

  it("Test reject non-owner trying to set allowance", async function () {
    await expect(memento.connect(user).setAllowance(user.address, 5))
        .to.be.revertedWith("Ownable: caller is not the owner");
  });

  it("Test mint with allowance", async function() {
    await memento.setAllowance(user.address, 5);
    expect(await memento.allowanceOf(user.address)).to.equal(5);

    await memento.connect(user).payToMint(user.address, hash, {"value": 0});
    expect(await memento.allowanceOf(user.address)).to.equal(4);
    expect(await memento.supply()).to.equal(1);
    expect(await memento.tokenURI(0)).to.equal(IPFS + hash);
    expect(await memento.authorOf(0)).to.equal(user.address);
    expect(await memento.ownerOf(0)).to.equal(user.address);
  });
});