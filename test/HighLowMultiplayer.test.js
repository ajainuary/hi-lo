const HighLow = artifacts.require("HighLow");
const Helper = artifacts.require("Helper")
let accounts, highlow, helper;
let LOW = 0, HIGH = 1;
let NONCE1 = 1234, NONCE2 = 5678;
const WAIT_TIME = 15;

finishRound = async () => {
    await web3.currentProvider.send({
        jsonrpc: '2.0',
        method: 'evm_increaseTime',
        params: [WAIT_TIME],
        id: new Date().getTime()
    }, () => {});
    return;
}

contract('Multi Player Game', () => {
    beforeEach(async () => {
        accounts = await web3.eth.getAccounts();
        highlow = await HighLow.deployed();
        helper = await Helper.deployed();
        // amt = await web3.eth.getBalance(accounts[0]);
        // Load money to HighLow
        await highlow.deposit(web3.utils.toWei("40"), {
            from: accounts[0],
            value: web3.utils.toWei("40")
        });
    });
    it('Honest Players', async () => {
        bet_card = await highlow.announced_card.call().then(x => x.toNumber());
        commitmentHigh = await helper.generate_commitment.call(HIGH, NONCE1);
        commitmentLow = await helper.generate_commitment.call(LOW, NONCE1);
        initial_amt1 = await web3.eth.getBalance(accounts[1]);
        initial_amt2 = await web3.eth.getBalance(accounts[2]);
        initial_amt3 = await web3.eth.getBalance(accounts[3]);
        initial_amt4 = await web3.eth.getBalance(accounts[4]);
        await highlow.bet_commit(commitmentHigh, {
            from: accounts[1],
            value: web3.utils.toWei("9"),
            gas: 6721975
        });
        await highlow.bet_commit(commitmentHigh, {
            from: accounts[2],
            value: web3.utils.toWei("1"),
            gas: 6721975
        });
        await highlow.bet_commit(commitmentLow, {
            from: accounts[3],
            value: web3.utils.toWei("9"),
            gas: 6721975
        });
        await highlow.bet_commit(commitmentLow, {
            from: accounts[4],
            value: web3.utils.toWei("1"),
            gas: 6721975
        });
        await finishRound();
        await highlow.bet_reveal(HIGH, NONCE1, {
            from: accounts[1],
            gas: 6721975
        });
        await highlow.bet_reveal(HIGH, NONCE1, {
            from: accounts[2],
            gas: 6721975
        });
        await highlow.bet_reveal(LOW, NONCE1, {
            from: accounts[3],
            gas: 6721975
        });
        await highlow.bet_reveal(LOW, NONCE1, {
            from: accounts[4],
            gas: 6721975
        });
        result_card = await highlow.announced_card.call().then(x => x.toNumber());
        final_amt1 = await web3.eth.getBalance(accounts[1]);
        final_amt2 = await web3.eth.getBalance(accounts[2]);
        final_amt3 = await web3.eth.getBalance(accounts[3]);
        final_amt4 = await web3.eth.getBalance(accounts[4]);
        assert((final_amt1 - initial_amt1 > 0 && result_card > bet_card) || (final_amt1 - initial_amt1 <= 0 && result_card <= bet_card), "Incorrect Verdict");
        assert((final_amt2 - initial_amt2 > 0 && result_card > bet_card) || (final_amt2 - initial_amt2 <= 0 && result_card <= bet_card), "Incorrect Verdict");
        assert((final_amt3 - initial_amt3 > 0 && result_card < bet_card) || (final_amt3 - initial_amt3 <= 0 && result_card >= bet_card), "Incorrect Verdict");
        assert((final_amt4 - initial_amt4 > 0 && result_card < bet_card) || (final_amt4 - initial_amt4 <= 0 && result_card >= bet_card), "Incorrect Verdict");
    });
    it('Dishonest Players', async () => {
        bet_card = await highlow.announced_card.call().then(x => x.toNumber());
        commitmentHigh = await helper.generate_commitment.call(HIGH, NONCE1);
        commitmentLow = await helper.generate_commitment.call(LOW, NONCE1);
        initial_amt1 = await web3.eth.getBalance(accounts[1]);
        initial_amt2 = await web3.eth.getBalance(accounts[2]);
        initial_amt3 = await web3.eth.getBalance(accounts[3]);
        initial_amt4 = await web3.eth.getBalance(accounts[4]);
        await highlow.bet_commit(commitmentHigh, {
            from: accounts[1],
            value: web3.utils.toWei("9"),
            gas: 6721975
        });
        await highlow.bet_commit(commitmentHigh, {
            from: accounts[2],
            value: web3.utils.toWei("1"),
            gas: 6721975
        });
        await highlow.bet_commit(commitmentLow, {
            from: accounts[3],
            value: web3.utils.toWei("9"),
            gas: 6721975
        });
        await highlow.bet_commit(commitmentLow, {
            from: accounts[4],
            value: web3.utils.toWei("1"),
            gas: 6721975
        });
        await finishRound();
        await highlow.bet_reveal(LOW, NONCE1, {
            from: accounts[1],
            gas: 6721975
        });
        await highlow.bet_reveal(LOW, NONCE1, {
            from: accounts[2],
            gas: 6721975
        });
        await highlow.bet_reveal(LOW, NONCE1, {
            from: accounts[3],
            gas: 6721975
        });
        await highlow.bet_reveal(LOW, NONCE1, {
            from: accounts[4],
            gas: 6721975
        });
        result_card = await highlow.announced_card.call().then(x => x.toNumber());
        final_amt1 = await web3.eth.getBalance(accounts[1]);
        final_amt2 = await web3.eth.getBalance(accounts[2]);
        final_amt3 = await web3.eth.getBalance(accounts[3]);
        final_amt4 = await web3.eth.getBalance(accounts[4]);
        assert(final_amt1 - initial_amt1 <= 0, "Incorrect Verdict");
        assert(final_amt2 - initial_amt2 <= 0, "Incorrect Verdict");
        assert((final_amt3 - initial_amt3 > 0 && result_card < bet_card) || (final_amt3 - initial_amt3 <= 0 && result_card >= bet_card), "Incorrect Verdict");
        assert((final_amt4 - initial_amt4 > 0 && result_card < bet_card) || (final_amt4 - initial_amt4 <= 0 && result_card >= bet_card), "Incorrect Verdict");
    });
})