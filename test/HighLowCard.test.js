const HighLow = artifacts.require("HighLow");

let accounts, highlow;

contract('HighLow Announces Card', () => {
    beforeEach(async () => {
        // get the accounts
        accounts = await web3.eth.getAccounts();
        highlow = await HighLow.deployed();
        shuffle_limit = await highlow.SHUFFLE_LIMIT.call();
    });
    
    it('announced_card is within range', async() => {
        announced_card = await highlow.announced_card.call();
        assert(announced_card > 1, "Announced card is too low");
        assert(announced_card < 11, "Announced card is too high");
    });
    // TODO: check new_card() using inheritance
    it('announced card is not present in the burnt deck', async() => {
        curr_card_index = await highlow.curr_card_index.call();
        announced_card = await highlow.cards.call(curr_card_index);
        already_burnt = false;
        for (i = 1; i < curr_card_index;) {
            burnt_card = await highlow.cards.call(i);
            if (burnt_card == announced_card) {
                already_burnt = true;
                break;
            }
            i = (i + 1) % shuffle_limit;
        }
        assert(already_burnt == false, "Announced card exists in burnt deck");
    });
});