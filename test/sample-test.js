const { expect } = require("chai");
const { ethers, waffle } = require("hardhat");
const { BigNumber } = require('ethers');

describe("Greeter", function () {
  const hash = 'QmSQ9zAgT4XpVRAvNdFAF5vEjVWdJa9jht8hL3LTpXouY7';
  const hash2 = 'QmUyjqWUf6SzWBTZjCbZh1QbQBb7CyyKGAhxRfADCtVhDg';
  const IPFS = 'ipfs://';

  async function getMemento() {
    const Memento = await ethers.getContractFactory("Memento");
    const memento = await Memento.deploy();
    await memento.deployed();
    return memento;
  }

  it("Should return the new greeting once it's changed", async function () {
    const Greeter = await ethers.getContractFactory("Greeter");
    const greeter = await Greeter.deploy("Hello, world!");
    await greeter.deployed();

    expect(await greeter.greet()).to.equal("Hello, world!");

    const setGreetingTx = await greeter.setGreeting("Hola, mundo!");

    // wait until the transaction is mined
    await setGreetingTx.wait();

    expect(await greeter.greet()).to.equal("Hola, mundo!");
  });

  it("Test mint by owner", async function () {
    const memento = await getMemento();
    const [owner] = await ethers.getSigners();
    expect(await memento.supply()).to.equal(0);

    await memento.mint(owner.address, owner.address, hash);
    expect(await memento.supply()).to.equal(1);
    expect(await memento.tokenURI(0)).to.equal(IPFS + hash)
    expect(await memento.authorOf(0)).to.equal(owner.address)
    expect(await memento.ownerOf(0)).to.equal(owner.address)   
    
    await memento.mint(owner.address, owner.address, hash2);
    expect(await memento.supply()).to.equal(2);
    expect(await memento.tokenURI(1)).to.equal(IPFS + hash2)
    expect(await memento.authorOf(1)).to.equal(owner.address)
    expect(await memento.ownerOf(1)).to.equal(owner.address)   
  });

  it("Test reject duplicate hash", async function () {
    const memento = await getMemento();
    const [owner] = await ethers.getSigners();
    await memento.mint(owner.address, owner.address, hash);

    expect(await memento.supply()).to.equal(1);
    expect(await memento.tokenURI(0)).to.equal(IPFS + hash)
    expect(await memento.authorOf(0)).to.equal(owner.address)
    expect(await memento.ownerOf(0)).to.equal(owner.address)

    await expect(memento.mint(owner.address, owner.address, hash))
      .to.be.revertedWith('Already minted!');
    expect(await memento.supply()).to.equal(1);
  });

  it("Test pay to mint", async function() {
    const provider = waffle.provider;

    const memento = await getMemento();
    const [owner, user] = await ethers.getSigners();

    const price = await memento.price();
    const balance = await provider.getBalance(user.address);
    expect(await memento.provider.getBalance(memento.address)).to.equal(0);

    await memento.payToMint(user.address, hash, {value: price});
    expect(await memento.supply()).to.equal(1);
    expect(await provider.getBalance(memento.address)).to.equal(price);
  });

  it("Test mint fail non-owner", async function() {
    const memento = await getMemento();
    const [owner, user] = await ethers.getSigners();
    await expect(memento.connect(user).mint(user.address, user.address, hash))
      .to.be.revertedWith("Ownable: caller is not the owner");
  });

  it("Test mint fail insufficient fund", async function() {
    const memento = await getMemento();
    const [owner, user] = await ethers.getSigners();
    const price = await memento.price();
    await expect(memento.connect(user).payToMint(user.address, hash, {value: 100}))
      .to.be.revertedWith("Insufficient fund!");
  });

});