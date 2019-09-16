const assert = require('assert');
const ganache = require('ganache-cli');
const Web3 = require('web3');
const web3 = new Web3(ganache.provider());
const json_highlow = require('./../build/contracts/HighLow.json');
const json_helper = require('./../build/contracts/Helper.json');

let accounts, highlow, house;
let player1, player2, player3;

const interface_highlow = json_highlow['abi'];
const bytecode_highlow = json_highlow['bytecode'];

const interface_helper = json_helper['abi'];
const bytecode_helper = json_helper['bytecode'];

beforeEach(async () => {
    // get the accounts
    accounts = await web3.eth.getAccounts();
    house = accounts[0];
    player1 = accounts[1];
    player2 = accounts[2];
    player3 = accounts[3];

    // deploy Highlow contract
    highlow = await new web3.eth.Contract(interface_highlow)
              .deploy({data: bytecode_highlow})
              .send({from: house, gas: '3000000'});
    shuffle_limit = await highlow.methods.SHUFFLE_LIMIT().call();

    // deploy Helper contract
    helper = await new web3.eth.Contract(interface_helper)
            .deploy({data: bytecode_helper})
            .send({from: house, gas: '3000000'});
});

describe ('HighLow', () => {
    it('checks that the house has deployed HighLow contract', async () => {
        const highlowHouse = await highlow.methods.house().call();
        assert(house == highlowHouse, "The house is the one who launches the smart contract.");
    });
    it('checks whether announced_card is within range', async() => {
        announced_card = await highlow.methods.announced_card().call();
        assert(announced_card > 1, "Announced card is too low");
        assert(announced_card < 11, "Announced card is too high");
    });
    // TODO: check new_card() using inheritance
    it('checks that the announced card is not present in the burnt deck', async() => {
        curr_card_index = await highlow.methods.curr_card_index().call();
        announced_card = await highlow.methods.cards(curr_card_index).call();
        already_burnt = false;
        for (i = 1; i < curr_card_index;) {
            burnt_card = await highlow.methods.cards(i).call();
            if (burnt_card == announced_card) {
                already_burnt = true;
                break;
            }
            i = (i + 1) % shuffle_limit;
        }
        assert(already_burnt == false, "Announced card exists in burnt deck!!");
    });
});
