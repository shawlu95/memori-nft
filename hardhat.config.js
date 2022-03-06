require("dotenv").config();
require("@nomiclabs/hardhat-etherscan");
require("@nomiclabs/hardhat-waffle");
require("@nomiclabs/hardhat-web3");
require("hardhat-gas-reporter");
require("solidity-coverage");
require('@openzeppelin/hardhat-upgrades');
require('hardhat-contract-sizer');
require("hardhat-erc1820");

const { types, task } = require("hardhat/config");

task("accounts", "Prints the list of accounts", async (taskArgs, hre) => {
  const accounts = await hre.ethers.getSigners();

  for (const account of accounts) {
    console.log(account.address);
  }
});

task("accounts2", "Prints accounts", async (_, { web3 }) => {
  console.log(await web3.eth.getAccounts());
});

task("balance", "Prints an account's balance")
  .addParam("account", "The account's address", "", types.string)
  .setAction(async (args) => {
    const account = web3.utils.toChecksumAddress(args.account);
    const balance = await web3.eth.getBalance(account);
    console.log(web3.utils.fromWei(balance, "ether"), "ETH");
  });

// example: hh list --network rinkeby --address 0x84725B0E283E873105f93B0762257e44c0b16295
task("list", "List all nfts of a proxy address")
  .addParam("address", "Contract proxy address")
  .setAction(async (args, hre) => {
    const [owner] = await hre.ethers.getSigners();
    console.log("Current account:", owner.address);
    console.log("NFT address:", args.address);

    const Memento = await ethers.getContractFactory("Memento");
    const memento = await Memento.attach(args.address);
    const supply = await memento.supply();
    for (let i = 0; i < supply; i++) {
      let owner = await memento.ownerOf(i);
      let author = await memento.authorOf(i);
      let uri = await memento.tokenURI(i);
      console.log(`ID ${i}. Author ${author}. Owner ${owner}. URI ${uri}`);
    }
  });

module.exports = {
  defaultNetwork: "hardhat",
  solidity: {
    version: "0.8.2",
    settings: {
      optimizer: {
        enabled: true,
        runs: 1,
      },
    },
  },
  networks: {
    ganache: {
      chainId: 1337,
      url: "HTTP://127.0.0.1:8545"
    },
    polygonMumbai: {
      chainId: 80001,
      url: "https://rpc-mumbai.maticvigil.com",
      from: process.env.ADMIN_PRIVATE_KEY,
      accounts: [process.env.ADMIN_PRIVATE_KEY]
    },
    polygon: {
      chainId: 137,
      url: "https://polygon-rpc.com/",
      from: process.env.ADMIN_PRIVATE_KEY_PROD,
      accounts: [process.env.ADMIN_PRIVATE_KEY_PROD]
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
    gasPriceApi: process.env.gasPriceApi,
    currency: "USD",
  },
  contractSizer: {
    except: ['contracts/Memento.sol', 'contracts/Memo.sol']
  }
};
