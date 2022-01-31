require("dotenv").config();

require("@nomiclabs/hardhat-etherscan");
require("@nomiclabs/hardhat-waffle");
require("@nomiclabs/hardhat-web3");
require("hardhat-gas-reporter");
require("solidity-coverage");
require('@openzeppelin/hardhat-upgrades');

const { types } = require("hardhat/config");

task("accounts", "Prints the list of accounts", async (taskArgs, hre) => {
  const accounts = await hre.ethers.getSigners();

  for (const account of accounts) {
    console.log(account.address);
  }
});

task("balance", "Prints an account's balance")
  .addParam("account", "The account's address", "", types.string)
  .setAction(async (args) => {
    const account = web3.utils.toChecksumAddress(args.account);
    const balance = await web3.eth.getBalance(account);

    console.log(web3.utils.fromWei(balance, "ether"), "ETH");
});

module.exports = {
  defaultNetwork: "hardhat",
  solidity: {
    version: "0.8.2",
    settings: {
      optimizer: {
        enabled: true,
        runs: 1000,
      },
    },
  },
  networks: {
    ganache: {
      url: "HTTP://127.0.0.1:7545",
      network_id: "5777"
    },
    polygonMumbai: {
      chainId: 80001,
      url: "https://rpc-mumbai.maticvigil.com",
      from: process.env.ADMIN_PRIVATE_KEY,
      accounts: [process.env.ADMIN_PRIVATE_KEY]
    },
    polygon: {
      chainId: 137,
      url: "https://rpc-mainnet.matic.network",
      from: process.env.ADMIN_PRIVATE_KEY,
      accounts: [process.env.ADMIN_PRIVATE_KEY]
    },
    rinkeby: {
      chainId: 4,
      url: "https://rinkeby.infura.io/v3/9aa3d95b3bc440fa88ea12eaa4456161",
      from: process.env.ADMIN_PRIVATE_KEY,
      accounts: [process.env.ADMIN_PRIVATE_KEY]
    }
  },
  etherscan: {
    apiKey: {
        mainnet: process.env.ETHERSCAN_TOKEN,
        rinkeby: process.env.ETHERSCAN_TOKEN,
        bsc: process.env.BSCSCAN_TOKEN,
        bscTestnet: process.env.BSCSCAN_TOKEN,
        polygon: process.env.POLYGONSCAN_TOKEN,
        polygonMumbai: process.env.POLYGONSCAN_TOKEN
    }
  },
  gasReporter: {
    enabled: process.env.REPORT_GAS !== undefined,
    currency: "USD",
  }
};
