const assert = require('assert');
const ganache = require('ganache-cli');
const Web3 = require('web3');
const web3 = new Web3(ganache.provider());
const json = require('./../build/contracts/HighLow.json');

let accounts;
let highlow;
let house;

const interface = json['abi'];
const bytecode = json['bytecode']

beforeEach(async () => {
    accounts = await web3.eth.getAccounts();
    house = accounts[0];
    highlow = await new web3.eth.Contract(interface)
              .deploy({data: bytecode})
              .send({from: house, gas: '3000000'});
});

describe ('HighLow', () => {
    it('deploys a contract', async () => {
        const highlowHouse = await highlow.methods.house().call();
        assert.equal(house, highlowHouse, "The house is the one who launches the smart contract.");
    });
});
