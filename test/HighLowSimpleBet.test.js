const HighLow = artifacts.require("HighLow");
const Helper = artifacts.require("Helper")
let accounts, highlow, helper;

contract('Single Player Game', () => {
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
    it('Honest Player bets Low', async () => {
        // bet_card = await highlow.announced_card.call();
        commitment = await helper.generate_commitment.call(0, 1234);
        // initial_amt = await web3.eth.getBalance(accounts[1]);
        await highlow.bet_commit(commitment, {
            from: accounts[1],
            value: web3.utils.toWei("2"),
            gas: 6721975
        });
        await highlow.bet_reveal(0, 1234, {
            from: accounts[1],
            gas: 6721975
        });
        // final_amt = await web3.eth.getBalance(accounts[1]);
        // result_card = await highlow.announced_card.call();
        // console.log(final_amt, initial_amt, result_card, bet_card);
        // assert(final_amt > initial_amt && result_card > bet_card, "Incorrect Verdict");
        // assert(final_amt <= initial_amt && result_card < bet_card, "Incorrect Verdict");
    });
})