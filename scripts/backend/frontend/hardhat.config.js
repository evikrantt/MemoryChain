require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();

const { RPC_URL, PRIVATE_KEY } = process.env;

module.exports = {
  solidity: { version: "0.8.24", settings: { optimizer: { enabled: true, runs: 200 } } },
  networks: {
    hardhat: {},
    localhost: { url: "http://127.0.0.1:8545" },
    custom: RPC_URL ? { url: RPC_URL, accounts: PRIVATE_KEY ? [PRIVATE_KEY] : undefined } : undefined
  }
};
