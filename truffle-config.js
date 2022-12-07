var HDWalletProvider = require("truffle-hdwallet-provider");
var mnemonic =
  "e77754f9b72f4c83941eea1dc7960d231894ce77b80362193c75d1802354bf20";

module.exports = {
  // See <http://truffleframework.com/docs/advanced/configuration>
  // to customize your Truffle configuration!
  networks: {
    ganache: {
      host: "127.0.0.1",
      port: 7545,
      network_id: "*", // Match any network id
    },
    chainskills: {
      host: "127.0.0.1",
      port: 8545,
      network_id: "4224",
    },
    goerli: {
      provider: () =>
        new HDWalletProvider(
          mnemonic,
          "https://goerli.infura.io/v3/9034adf5633f4afa9d2e5088d73bbe4e"
        ),
      network_id: 5,
    },
  },
  // Configure your compilers
  compilers: {
    solc: {
      version: "0.8.17",
      settings: {
        // See the solidity docs for advice about optimization and evmVersion
        optimizer: {
          enabled: true,
          runs: 200,
        },
      },
    },
  },
};
