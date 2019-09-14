var TestHighLow = artifacts.require("TestHighLow");

module.exports = function (deployer) {
    // deployment steps
    deployer.deploy(TestHighLow);
};