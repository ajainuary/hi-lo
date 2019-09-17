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
    /// @dev Determines the duration of the round (Duration = wait_blocks * average block time)
    uint public constant wait_blocks = 1;
    uint public start_block;
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
    /// @param amount Value of ether being deposited (in wei)
    function deposit(uint amount) public payable {
        require(msg.value == amount, "Incorrect Amount, specified amount does not match transaction value");
        // This condition rejects any typos in transaction
    }

    // function already_announced(uint rand) internal view returns(bool) {
    //     for(uint i = 0; i < SHUFFLE_LIMIT; ++i) {
    //         if(rand == cards[i]) {
    //             return true;
    //         }
    //     }
    //     return false;
    // }

    function new_card() internal {
        start_block = block.number;
        uint rand = uint256(keccak256(abi.encodePacked(now))) % MAX_CARDS;
        announced_card = rand % SUITE_SIZE;
        uint i = 0;
        while(burn[rand] || announced_card < 2 || announced_card > 10) {
        // while(burn[rand]) {
        // while(i < 100) {
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
        if(block.number >= start_block + wait_blocks) {
            new_card();
        }
    }

    /// @notice Reveal the bet to claim rewards
    /// @param _choice Choice (0 for High, 1 for Low) commited earlier
    /// @param _nonce Same nonce used for commitment earlier
    function bet_reveal(uint8 _choice, uint256 _nonce) public {
        require(players[msg.sender].bet_amount > 0, "No pending commitments, game over");
        require(curr_card_index - players[msg.sender].idx > 0, "Too early, wait for the next announced card");
        require(curr_card_index - players[msg.sender].idx < SHUFFLE_LIMIT, "Too late, bet forfeited");
        if(block.number >= start_block + wait_blocks) {
            new_card();
        }
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