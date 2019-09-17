const HighLow = artifacts.require("HighLow");
const Helper = artifacts.require("Helper");
const truffleAssert = require('truffle-assertions');
let accounts, highlow, helper;
contract('Buggy Players', () => {
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
    it('Honest Player reveals twice', async () => {
        commitment = await helper.generate_commitment.call(0, 1234);
        await highlow.bet_commit(commitment, {
            from: accounts[1],
            value: web3.utils.toWei("2"),
            gas: 6721975
        });
        await highlow.bet_reveal(0, 1234, {
            from: accounts[1],
            gas: 6721975
        });
        initial_amt = await web3.eth.getBalance(accounts[1]);
        truffleAssert.reverts(highlow.bet_reveal(0, 1234, {
            from: accounts[1],
            gas: 6721975
        }), "No pending commitments, game over");
    });
    it('Player bets too low', async () => {
        commitment = await helper.generate_commitment.call(0, 1234);
        initial_amt = await web3.eth.getBalance(accounts[1]);
        await truffleAssert.reverts(highlow.bet_commit(commitment, {
            from: accounts[1],
            value: web3.utils.toWei("0.001"),
            gas: 6721975
        }), "Amount too low, Min Bet 0.01 Ether");
    });
    it('Player bets too high', async () => {
        commitment = await helper.generate_commitment.call(0, 1234);
        initial_amt = await web3.eth.getBalance(accounts[1]);
        await truffleAssert.reverts(highlow.bet_commit(commitment, {
            from: accounts[1],
            value: web3.utils.toWei("50"),
            gas: 6721975
        }), "Amount too high, Max Bet 10 Ether");
    });
})