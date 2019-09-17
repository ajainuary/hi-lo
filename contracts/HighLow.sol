pragma solidity ^0.5.8;

contract HighLow {
    address payable public house;
    /// @dev Maximum cards in the Burn Deck before mixing into deck
    uint public constant SHUFFLE_LIMIT = 30;
    /// @dev Size of our deck from which cards are drawn
    uint public constant MAX_CARDS = 52;
    /// @dev Length of maximum chain in cards
    uint public constant SUITE_SIZE = 13;
    uint[SHUFFLE_LIMIT] public cards;
    bool[MAX_CARDS] public burn;
    uint public curr_card_index;
    /// @dev Determines the duration of a single round
    uint public constant WAIT_TIME = 10;
    uint public START_TIME;
    uint public announced_card;

    struct Player {
        uint bet_amount;
        uint idx;
        bytes32 commitment;
    }

    constructor() public {
        house = msg.sender;
        new_card();
    }

    /// @notice Deposit ether into the contract
    /// @param _amount Value of ether being deposited (in wei)
    function deposit(uint _amount) public payable {
        require(msg.value == _amount, "Incorrect Amount, specified amount does not match transaction value");
        // This condition rejects any typos in transaction
    }

    function new_card() internal {
        uint i = 0;
        if(curr_card_index % SHUFFLE_LIMIT == 0) {
            for(i = 0; i < MAX_CARDS; ++i) {
                burn[i] = false;
            }
        }
        START_TIME = now;
        uint rand = uint256(keccak256(abi.encodePacked(now))) % MAX_CARDS;
        announced_card = rand % SUITE_SIZE;
        while(burn[rand] || announced_card < 2 || announced_card > 10) {
            rand = uint256(keccak256(abi.encodePacked(rand*i))) % MAX_CARDS;
            announced_card = rand % SUITE_SIZE;
            i = i + 1;
        }
        burn[rand] = true;
        curr_card_index = curr_card_index + 1;
        cards[curr_card_index % SHUFFLE_LIMIT] = rand;
    }

    mapping (address => Player) public players;

    /// @notice Commit a choice (0 for High, 1 for Low) along with bet money for the announced_card
    /// @param _commit SHA-3 256 Hash of the Choice and random nonce
    function bet_commit(bytes32 _commit) public payable {
        require(msg.value >= 0.01 ether, "Amount too low, Min Bet 0.01 Ether");
        require(msg.value < 10 ether, "Amount too high, Max Bet 10 Ether");
        players[msg.sender].bet_amount = (uint)(msg.value);
        players[msg.sender].idx = curr_card_index;
        players[msg.sender].commitment = _commit;
        if(now >= START_TIME + WAIT_TIME) {
            new_card();
        }
    }

    /// @notice Reveal the bet to claim rewards
    /// @dev NOTE: new_card() called before require to break deadlocks
    /// @param _choice Choice (0 for High, 1 for Low) commited earlier
    /// @param _nonce Same nonce used for commitment earlier
    function bet_reveal(uint8 _choice, uint256 _nonce) public {
        if(now >= START_TIME + WAIT_TIME) {
            new_card();
        }
        require(players[msg.sender].bet_amount > 0, "No pending commitments, game over");
        require(curr_card_index - players[msg.sender].idx > 0, "Too early, wait for the next announced card");
        require(curr_card_index - players[msg.sender].idx < SHUFFLE_LIMIT, "Too late, bet forfeited");
        bytes32 test_hash = keccak256(abi.encodePacked(_choice, _nonce));
        uint bet_card = cards[players[msg.sender].idx] % SUITE_SIZE;
        uint result_card = cards[addmod(players[msg.sender].idx, 1, SHUFFLE_LIMIT)] % SUITE_SIZE;
        if(test_hash == players[msg.sender].commitment) {
            if (result_card == bet_card)
                house.transfer(players[msg.sender].bet_amount);
            else if (result_card < bet_card && _choice == 0)
                msg.sender.transfer(2*players[msg.sender].bet_amount);
            else if (result_card > bet_card && _choice == 1)
                msg.sender.transfer(2*players[msg.sender].bet_amount);
            players[msg.sender].bet_amount = 0;
        }
    }
}