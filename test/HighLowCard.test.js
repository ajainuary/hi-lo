const HighLow = artifacts.require("HighLow");
const Helper = artifacts.require("Helper");
const truffleAssert = require('truffle-assertions');

let accounts, highlow;
let LOW = 0, HIGH = 1;
let NONCE1 = 1234, NONCE2 = 5678;
ROUND_DURATION = 15;

isAnnouncedCardBurnt = async () => {
    curr_card_index = await highlow.curr_card_index.call();
    announced_card = await highlow.cards.call(curr_card_index);
    already_burnt = false;
    for (i = 1; i < curr_card_index;) {
        burnt_card = await highlow.cards.call(i);
        if (announced_card == burnt_card) {
            already_burnt = true;
            break;
        }
        i = (i + 1) % shuffle_limit;
    }
    return already_burnt;
}

finishRound = async () => {
    await web3.currentProvider.send({
        jsonrpc: '2.0',
        method: 'evm_increaseTime',
        params: [ROUND_DURATION],
        id: new Date().getTime()
    }, () => {});
    return;
}

contract('HighLow Announces Card', () => {
    beforeEach(async () => {
        // get the accounts
        accounts = await web3.eth.getAccounts();
        highlow = await HighLow.deployed();
        helper = await Helper.deployed();
        shuffle_limit = await highlow.SHUFFLE_LIMIT.call();
    });

    it('announced_card is within range', async() => {
        announced_card = await highlow.announced_card.call();
        assert(announced_card > 1, "Announced card is too low");
        assert(announced_card < 11, "Announced card is too high");
    });

    // TODO: check new_card() using inheritance
    it('Bet is forfeited after shuffle limit.', async() => {
        player1 = accounts[1];
        player2 = accounts[2];
        patron = accounts[3];
        await highlow.deposit(web3.utils.toWei("90"), {
            from: patron,
            value: web3.utils.toWei("90")
        });
        commitment1 = await helper.generate_commitment.call(LOW, NONCE1);
        await highlow.bet_commit(commitment1, {
            from: player1,
            value: web3.utils.toWei("1"),
            gas: 6721975
        });
        for (i = 0; i < 17; ++i) {
            commitment2 = await helper.generate_commitment.call(i % 2, NONCE1);
            await highlow.bet_commit(commitment2, {
                from: player2,
                value: web3.utils.toWei("1"),
                gas: 6721975
            });
            await finishRound();
            console.log(i);
            await highlow.bet_reveal(i % 2, NONCE1, {
                from: player2,
                gas: 6721975
            });
        }
        truffleAssert.reverts(highlow.bet_reveal(LOW, NONCE1, {
            from: player1,
            gas: 6721975
        }), "Too late, bet forfeited");
        // assert((await isAnnouncedCardBurnt()) == false, "Announced card exists in burnt deck");
    });
});