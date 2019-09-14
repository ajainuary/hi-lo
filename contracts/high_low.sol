pragma solidity ^0.5.8;

contract HighLow {
    address payable public house;             // contract owner
    uint constant SHUFFLE_LIMIT = 4;
    uint constant MAX_CARDS = 1000000007; //could be any lucky number
    uint[SHUFFLE_LIMIT] public cards;
    uint curr_card_index;
    uint constant wait_blocks = 1;
    uint public start_block;

    struct Player {
        uint bet_amount;
        uint idx;
        bytes32 commitment;
    }

    constructor() public {
        house = msg.sender;
        start_block = block.number;
        for (uint i = 0; i < cards.length; ++i)
            cards[i] = i;
        new_card();
    }

    function new_card() internal {
        if(block.number > start_block + wait_blocks) {
        curr_card_index = curr_card_index+1;
        cards[curr_card_index] = uint256(keccak256(abi.encodePacked(now))) % MAX_CARDS;
        }
    }

    mapping (address => Player) players;
    
    function bet_commit(bytes32 _commit) payable public {
        require(msg.value >= 0.01 ether);
        if(block.number > start_block + wait_blocks) {
            new_card();
        }
        players[msg.sender].bet_amount = (uint)(msg.value);
        players[msg.sender].idx = curr_card_index;
        players[msg.sender].commitment = _commit;
    }

    function bet_reveal(uint8 choice, uint256 nonce) public {
        require(curr_card_index - players[msg.sender].idx > 0 && curr_card_index - players[msg.sender].idx < SHUFFLE_LIMIT);
        if(block.number > start_block + wait_blocks) {
            new_card();
        }
        bytes32 test_hash = keccak256(abi.encodePacked(choice, nonce));
        uint bet_card = cards[players[msg.sender].idx];
        uint result_card = cards[addmod(players[msg.sender].idx, 1, SHUFFLE_LIMIT)];
        if(test_hash == players[msg.sender].commitment) {
            if (result_card == bet_card)
                house.transfer(players[msg.sender].bet_amount);
            else if (result_card < bet_card && choice == 0)
                msg.sender.transfer(2*players[msg.sender].bet_amount);   // pay the twice the player's bet amount
            else if (result_card > bet_card && choice == 1)
                msg.sender.transfer(2*players[msg.sender].bet_amount);
        }
    }
}
