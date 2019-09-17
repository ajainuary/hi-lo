const HighLow = artifacts.require("HighLow");

let accounts, highlow, house;

contract('HighLow Deployment', () => {
    beforeEach(async () => {
        // get the accounts
        accounts = await web3.eth.getAccounts();
        house = accounts[0];
    
        highlow = await HighLow.deployed();
        shuffle_limit = await highlow.SHUFFLE_LIMIT.call();
    });
    it('Contract is deployed', async () => {
        const highlowHouse = await highlow.house.call();
        assert(house == highlowHouse, "The House is not the deployer of the contract");
    });
});