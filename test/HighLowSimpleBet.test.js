const HighLow = artifacts.require("HighLow");
const Helper = artifacts.require("Helper");
let accounts, highlow, helper;
let LOW = 0, HIGH = 1;
let NONCE1 = 1234, NONCE2 = 5678;
ROUND_DURATION = 15;

finishRound = async () => {
    await web3.currentProvider.send({
        jsonrpc: '2.0',
        method: 'evm_increaseTime',
        params: [ROUND_DURATION],
        id: new Date().getTime()
    }, () => {});
    return;
}

contract('Single Player Game', () => {
    beforeEach(async () => {
        accounts = await web3.eth.getAccounts();
        highlow = await HighLow.deployed();
        helper = await Helper.deployed();
        // amt = await web3.eth.getBalance(accounts[0]);
        // Load money to HighLow
        await highlow.deposit(web3.utils.toWei("10"), {
            from: accounts[0],
            value: web3.utils.toWei("10")
        });
    });
    it('Honest Player - Commits: Low, Reveals: Low, Nonce: Same', async () => {
        bet_card = await highlow.announced_card.call().then(x => x.toNumber());
        commitment = await helper.generate_commitment.call(LOW, NONCE1);
        initial_amt = await web3.eth.getBalance(accounts[1]);
        await highlow.bet_commit(commitment, {
            from: accounts[1],
            value: web3.utils.toWei("2"),
            gas: 6721975
        });
        await finishRound();
        await highlow.bet_reveal(LOW, NONCE1, {
            from: accounts[1],
            gas: 6721975
        });
        result_card = await highlow.announced_card.call().then(x => x.toNumber());
        final_amt = await web3.eth.getBalance(accounts[1]);
        // console.log(final_amt, initial_amt, result_card, bet_card, result_card > bet_card);
        // console.log("verdict", (final_amt > initial_amt && result_card < bet_card), final_amt - initial_amt <= 0, final_amt - initial_amt, result_card >= bet_card);
        assert((final_amt - initial_amt > 0 && result_card < bet_card) || (final_amt - initial_amt <= 0 && result_card >= bet_card), "Incorrect Verdict");
    });
    it('Honest Player - Commits: High, Reveals: High, Nonce: Same', async () => {
        bet_card = await highlow.announced_card.call().then(x => x.toNumber());
        commitment = await helper.generate_commitment.call(HIGH, NONCE1);
        initial_amt = await web3.eth.getBalance(accounts[1]);
        await highlow.bet_commit(commitment, {
            from: accounts[1],
            value: web3.utils.toWei("2"),
            gas: 6721975
        });
        await finishRound();
        await highlow.bet_reveal(HIGH, NONCE1, {
            from: accounts[1],
            gas: 6721975
        });
        result_card = await highlow.announced_card.call().then(x => x.toNumber());
        final_amt = await web3.eth.getBalance(accounts[1]);
        // console.log(final_amt, initial_amt, result_card, bet_card, result_card > bet_card);
        // console.log("verdict", (final_amt > initial_amt && result_card < bet_card), final_amt - initial_amt <= 0, final_amt - initial_amt, result_card >= bet_card);
        assert((final_amt - initial_amt > 0 && result_card > bet_card) || (final_amt - initial_amt <= 0 && result_card <= bet_card), "Incorrect Verdict");
    });
    it('Dishonest Player - Commits: Low, Reveals: Low, Nonce: Different', async () => {
        bet_card = await highlow.announced_card.call().then(x => x.toNumber());
        commitment = await helper.generate_commitment.call(LOW, NONCE1);
        initial_amt = await web3.eth.getBalance(accounts[1]);
        await highlow.bet_commit(commitment, {
            from: accounts[1],
            value: web3.utils.toWei("2"),
            gas: 6721975
        });
        await finishRound();
        await highlow.bet_reveal(LOW, NONCE2, {
            from: accounts[1],
            gas: 6721975
        });
        result_card = await highlow.announced_card.call().then(x => x.toNumber());
        final_amt = await web3.eth.getBalance(accounts[1]);
        assert(final_amt - initial_amt <= 0, "Incorrect Verdict");
    });
    it('Dishonest Player - Commits: High, Reveals: High, Nonce: Different', async () => {
        bet_card = await highlow.announced_card.call().then(x => x.toNumber());
        commitment = await helper.generate_commitment.call(HIGH, NONCE1);
        initial_amt = await web3.eth.getBalance(accounts[1]);
        await highlow.bet_commit(commitment, {
            from: accounts[1],
            value: web3.utils.toWei("2"),
            gas: 6721975
        });
        await finishRound();
        await highlow.bet_reveal(HIGH, NONCE2, {
            from: accounts[1],
            gas: 6721975
        });
        result_card = await highlow.announced_card.call().then(x => x.toNumber());
        final_amt = await web3.eth.getBalance(accounts[1]);
        assert(final_amt - initial_amt <= 0, "Incorrect Verdict");
    });
    it('Dishonest Player - Commits: Low, Reveals: High, Nonce: Same', async () => {
        bet_card = await highlow.announced_card.call().then(x => x.toNumber());
        commitment = await helper.generate_commitment.call(LOW, NONCE1);
        initial_amt = await web3.eth.getBalance(accounts[1]);
        await highlow.bet_commit(commitment, {
            from: accounts[1],
            value: web3.utils.toWei("2"),
            gas: 6721975
        });
        await finishRound();
        await highlow.bet_reveal(HIGH, NONCE1, {
            from: accounts[1],
            gas: 6721975
        });
        result_card = await highlow.announced_card.call().then(x => x.toNumber());
        final_amt = await web3.eth.getBalance(accounts[1]);
        assert(final_amt - initial_amt <= 0, "Incorrect Verdict");
    });
    it('Dishonest Player - Commits: Low, Reveals: High, Nonce: Different', async () => {
        bet_card = await highlow.announced_card.call().then(x => x.toNumber());
        commitment = await helper.generate_commitment.call(LOW, NONCE1);
        initial_amt = await web3.eth.getBalance(accounts[1]);
        await highlow.bet_commit(commitment, {
            from: accounts[1],
            value: web3.utils.toWei("2"),
            gas: 6721975
        });
        await finishRound();
        await highlow.bet_reveal(HIGH, NONCE2, {
            from: accounts[1],
            gas: 6721975
        });
        result_card = await highlow.announced_card.call().then(x => x.toNumber());
        final_amt = await web3.eth.getBalance(accounts[1]);
        assert(final_amt - initial_amt <= 0, "Incorrect Verdict");
    });
    it('Dishonest Player - Commits: High, Reveals: Low, Nonce: Same', async () => {
        bet_card = await highlow.announced_card.call().then(x => x.toNumber());
        commitment = await helper.generate_commitment.call(HIGH, NONCE1);
        initial_amt = await web3.eth.getBalance(accounts[1]);
        await highlow.bet_commit(commitment, {
            from: accounts[1],
            value: web3.utils.toWei("2"),
            gas: 6721975
        });
        await finishRound();
        await highlow.bet_reveal(LOW, NONCE1, {
            from: accounts[1],
            gas: 6721975
        });
        result_card = await highlow.announced_card.call().then(x => x.toNumber());
        final_amt = await web3.eth.getBalance(accounts[1]);
        assert(final_amt - initial_amt <= 0, "Incorrect Verdict");
    });
    it('Dishonest Player - Commits: High, Reveals: Low, Nonce: Different', async () => {
        bet_card = await highlow.announced_card.call().then(x => x.toNumber());
        commitment = await helper.generate_commitment.call(HIGH, NONCE1);
        initial_amt = await web3.eth.getBalance(accounts[1]);
        await highlow.bet_commit(commitment, {
            from: accounts[1],
            value: web3.utils.toWei("2"),
            gas: 6721975
        });
        await finishRound();
        await highlow.bet_reveal(LOW, NONCE2, {
            from: accounts[1],
            gas: 6721975
        });
        result_card = await highlow.announced_card.call().then(x => x.toNumber());
        final_amt = await web3.eth.getBalance(accounts[1]);
        assert(final_amt - initial_amt <= 0, "Incorrect Verdict");
    });
})