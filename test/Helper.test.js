const assert = require('assert');
const ganache = require('ganache-cli');
const Web3 = require('web3');
const web3 = new Web3(ganache.provider());
const json_helper = require('./../build/contracts/Helper.json');

const interface_helper = json_helper['abi'];
const bytecode_helper = json_helper['bytecode'];

beforeEach(async () => {
    // get the accounts
    accounts = await web3.eth.getAccounts();
    house = accounts[0];

    // deploy Helper contract
    helper = await new web3.eth.Contract(interface_helper)
            .deploy({data: bytecode_helper})
            .send({from: house, gas: '3000000'});
});

describe ('Helper', () => {
    it('checks the helper deployment', async() => {
        commitment = await helper.methods.generate_commitment(0, 1234).call();
        assert(commitment == "0x9518dce19d5200cd2e738fe79e0ac8a37ec05fbca94fb1b2452def0c80ec33e9", "Some error");
    });
});