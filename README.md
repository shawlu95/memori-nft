# Memori NFT

Celebrate your life with Memori NFT. Write a letter to your future self and loved ones. Unwind the clock and watch how you write letter by letter, word by word.

## Getting Started

Use 'hh' as short hand for 'npx hardhat' (see [details](https://hardhat.org/hardhat-runner/docs/guides/command-line-completion)).

```
npm install

hh test
hh size-contracts
hh coverage
```

## Deploy

```shell
hh run --network goerli scripts/deploy.js
```

## Verify Contract

Then, copy the deployment address and paste it in to replace `DEPLOYED_CONTRACT_ADDRESS` in this command:

```shell
hh verify \
  --contract contracts/Memori.sol:Memori \
  --network goerli 0x6078DE5E15019a77d16AAcc7df55e64Cdbf985Ae
```

### Links

- ETH Mainnet [Memori.sol](https://etherscan.io/address/0x8d6001ef522517fcd71ee746d649e4553b281cec)
- Goerli Mainnet [Memori.sol](hhttps://goerli.etherscan.io/address/0x6078DE5E15019a77d16AAcc7df55e64Cdbf985Ae)
- [OpenSea](https://opensea.io/collection/memori-nft)
