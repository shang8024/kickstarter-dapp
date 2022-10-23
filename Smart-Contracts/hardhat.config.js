// https://hardhat.org/tutorial/deploying-to-a-live-network

require("@nomiclabs/hardhat-etherscan");
require("@nomicfoundation/hardhat-toolbox");

// Go to https://www.alchemyapi.io, sign up, create
// a new App in its dashboard, and replace "KEY" with its key
const ALCHEMY_API_KEY = "0rhRFIRFhGNwL3TRFWi_YxQk8-UhjD7Y";

// Tester 1: feel free to use this account
// note this account creates a new contract but it's not the admin = Tester 2
const GOERLI_PRIVATE_KEY = "4cd10fdae7ac6e4330ca0e55b9052ea7eca620a11ef52503992c71d1f181ba02";

const ETHERSCAN_API_KEY = "E9FYWWZ722J14KFD8QCZB31H1GTKKMRUZ2";

module.exports = {
  solidity: "0.8.9",
  networks: {
    goerli: {
      url: `https://eth-goerli.alchemyapi.io/v2/${ALCHEMY_API_KEY}`,
      accounts: [GOERLI_PRIVATE_KEY]
    }
  },
  etherscan: {
    apiKey:{
      goerli: ETHERSCAN_API_KEY
    }
  }
};

// Command History:

// npx hardhat run scripts/deploy.js --network goerli

//     Deploying contracts with the account: 0x02306583C1Af3B23f501034E242A706C01Eec178
//     Account balance: 200000000000000000
//     Token address: 0x9eE0C2b1F6D281140399eC8eb754D6F0af4fc4fC

//     Deploying contracts with the account: 0x02306583C1Af3B23f501034E242A706C01Eec178
//     Account balance: 199999321861472897
//     Token address: 0x2aCF653795CdaBA21b09096C02e3887dE97A0fB4



// npx hardhat verify --network goerli 0x2aCF653795CdaBA21b09096C02e3887dE97A0fB4 0x67E7E4Bc1962470B70B5B6C9E95AE858B8Ab55E5 100000000000000000

//     Nothing to compile
//     Successfully submitted source code for contract
//     contracts / FundManagement.sol:FundManagement at 0x2aCF653795CdaBA21b09096C02e3887dE97A0fB4
//     for verification on the block explorer.Waiting for verification result...
//     Successfully verified contract FundManagement on Etherscan.
//     https://goerli.etherscan.io/address/0x2aCF653795CdaBA21b09096C02e3887dE97A0fB4#code

// npx hardhat verify --network goerli 0xD6CB769573C137fDB3f147c9776957C8A232d77A 0x2aCF653795CdaBA21b09096C02e3887dE97A0fB4

//     Compiled 1 Solidity file successfully
//     Successfully submitted source code for contract
//     contracts / FMDToken.sol:FMDToken at 0xD6CB769573C137fDB3f147c9776957C8A232d77A
//     for verification on the block explorer.Waiting for verification result...
//     Successfully verified contract FMDToken on Etherscan.
//     https://goerli.etherscan.io/address/0xD6CB769573C137fDB3f147c9776957C8A232d77A#code