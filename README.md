# Memori NFT

Celebrate your life with Memori NFT. Write a letter to your future self and loved ones. Unwind the clock and watch how you write letter by letter, word by word.

## Getting Started

```
npm install

hh test
hh size-contracts
hh coverage
```

## Deploy

```shell
hardhat run --network goerli scripts/deploy.js
```

## Verify Contract

Then, copy the deployment address and paste it in to replace `DEPLOYED_CONTRACT_ADDRESS` in this command:

```shell
npx hardhat verify \
  --contract contracts/Memori.sol:Memori \
  --network mainnet 0x8d6001ef522517fcd71ee746d649e4553b281cec
```

### Links

- ETH Mainnet [Memori.sol](https://etherscan.io/address/0x8d6001ef522517fcd71ee746d649e4553b281cec)
- [OpenSea](https://opensea.io/collection/memori-nft)
