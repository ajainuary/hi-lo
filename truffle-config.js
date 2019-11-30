const path = require("path");
const HDWalletProvider = require("@truffle/hdwallet-provider");
const mnemonic = "spoon curious wall admit dose garage beauty cross garden dirt advice biology"

module.exports = {
  // See <http://truffleframework.com/docs/advanced/configuration>
  // to customize your Truffle configuration!
  contracts_build_directory: path.join(__dirname, "app/src/contracts"),
  networks: {
    // develop: {
    //   port: 8545,
    // }
    rinkeby: {
      provider: function() {
        return new HDWalletProvider(mnemonic, "https://rinkeby.infura.io/v3/3f50240fbcd24a52a90fcd9bd014bfb5")
      },
      network_id: 4
    }
  }
};
