var HighLow = artifacts.require("HighLow");

module.exports = function (deployer) {
    // deployment steps
    deployer.deploy(HighLow, {gas: 6000000});
};