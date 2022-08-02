require('dotenv').config();
require('@nomiclabs/hardhat-etherscan');
require('@nomiclabs/hardhat-waffle');
require('@nomiclabs/hardhat-web3');
require('hardhat-gas-reporter');
require('solidity-coverage');
require('hardhat-contract-sizer');
require('hardhat-erc1820');

const { types, task } = require('hardhat/config');

task('accounts', 'Prints the list of accounts', async (taskArgs, hre) => {
  const accounts = await hre.ethers.getSigners();

  for (const account of accounts) {
    console.log(account.address);
  }
});

task('accounts2', 'Prints accounts', async (_, { web3 }) => {
  console.log(await web3.eth.getAccounts());
});

task('balance', "Prints an account's balance")
  .addParam('account', "The account's address", '', types.string)
  .setAction(async (args) => {
    const account = web3.utils.toChecksumAddress(args.account);
    const balance = await web3.eth.getBalance(account);
    console.log(web3.utils.fromWei(balance, 'ether'), 'ETH');
  });

// example: hh list --network polygon --address 0xfa68807f58bb32bae311da29733b61281d564ff5
task('list', 'List all nfts of a proxy address')
  .addParam('address', 'Contract proxy address')
  .setAction(async (args, hre) => {
    const [owner] = await hre.ethers.getSigners();
    console.log('Current account:', owner.address);
    console.log('NFT address:', args.address);

    const Memori = await ethers.getContractFactory('Memori');
    const memori = await Memori.attach(args.address);
    const supply = await memori.supply();
    const now = parseInt(Date.now() / 1000);
    for (let i = 0; i < supply; i++) {
      let owner = await memori.ownerOf(i);
      let author = await memori.authorOf(i);
      let uri = await memori.tokenURI(i);
      let revealAt = await memori.revealAt(i);
      console.log(
        `ID ${i}. Author ${author}. Owner ${owner}. URI ${uri}, revealAt ${revealAt}. Revealed: ${
          revealAt < now
        }`
      );
    }
  });

module.exports = {
  defaultNetwork: 'hardhat',
  solidity: {
    version: '0.8.14',
    settings: {
      optimizer: {
        enabled: true,
        runs: 1,
      },
    },
  },
  networks: {
    mainnet: {
      chainId: 1,
      url: `https://eth-mainnet.g.alchemy.com/v2/${process.env.MAINNET_API_KEY}`,
      from: process.env.ADMIN_MAINNET_OWNER_KEY,
      // gasPrice: 7000000000, // 5 gwei
      accounts: [
        process.env.ADMIN_MAINNET_OWNER_KEY,
        process.env.ADMIN_MAINNET_MINTER_KEY,
      ],
    },
    goerli: {
      chainId: 5,
      url: `https://eth-goerli.alchemyapi.io/v2/${process.env.GOERLI_API_KEY}`,
      from: process.env.ADMIN_MAINNET_OWNER_KEY,
      gasPrice: 5000000000, // 5 gwei
      accounts: [
        process.env.ADMIN_MAINNET_OWNER_KEY,
        process.env.ADMIN_MAINNET_MINTER_KEY,
      ],
    },
    ganache: {
      chainId: 1337,
      url: 'HTTP://127.0.0.1:8545',
    },
    polygonMumbai: {
      chainId: 80001,
      url: 'https://rpc-mumbai.maticvigil.com',
      from: process.env.ADMIN_PRIVATE_KEY,
      accounts: [process.env.ADMIN_PRIVATE_KEY],
    },
    polygon: {
      chainId: 137,
      url: 'https://polygon-rpc.com/',
      from: process.env.ADMIN_PRIVATE_KEY_PROD,
      accounts: [process.env.ADMIN_PRIVATE_KEY_PROD],
    },
    rinkeby: {
      chainId: 4,
      url: 'https://rinkeby.infura.io/v3/9aa3d95b3bc440fa88ea12eaa4456161',
      from: process.env.ADMIN_MAINNET_OWNER_KEY,
      gasPrice: 900000000, // 0.9 gwei
      accounts: [
        process.env.ADMIN_MAINNET_OWNER_KEY,
        process.env.ADMIN_MAINNET_MINTER_KEY,
      ],
    },
  },
  etherscan: {
    apiKey: {
      mainnet: process.env.ETHERSCAN_TOKEN,
      goerli: process.env.ETHERSCAN_TOKEN,
      rinkeby: process.env.ETHERSCAN_TOKEN,
      bsc: process.env.BSCSCAN_TOKEN,
      bscTestnet: process.env.BSCSCAN_TOKEN,
      polygon: process.env.POLYGONSCAN_TOKEN,
      polygonMumbai: process.env.POLYGONSCAN_TOKEN,
    },
  },
  gasReporter: {
    enabled: true,
    coinmarketcap: process.env.COIN_MARKET_CAP_API_KEY,
    currency: 'USD',
  },
  contractSizer: {
    except: ['contracts/Memento.sol', 'contracts/Memo.sol'],
  },
};
