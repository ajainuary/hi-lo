pragma solidity ^0.5.8;

contract HighLow {
    address payable public house;             // contract owner
    uint public constant SHUFFLE_LIMIT = 30;
    uint public constant MAX_CARDS = 52; //could be any lucky number
    uint public constant SUITE_SIZE = 13; //Small Lucky number (should divide MAX_CARDS)
    uint[SHUFFLE_LIMIT] public cards;
    uint public curr_card_index;
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

    function already_announced(uint rand) internal view returns(bool) {
        for(uint i = 0; i < SHUFFLE_LIMIT; ++i) {
            if(rand == cards[i]) {
                return true;
            }
        }
        return false;
    }

    function new_card() internal {
        start_block = block.number;
        uint rand = uint256(keccak256(abi.encodePacked(now))) % MAX_CARDS;
        while(already_announced(rand) || announced_card < 2 || announced_card > 10) {
            rand = uint256(keccak256(abi.encodePacked(now))) % MAX_CARDS;
            announced_card = rand % SUITE_SIZE;
        }
        curr_card_index = curr_card_index + 1;
        cards[curr_card_index % SHUFFLE_LIMIT] = rand;
    }

    mapping (address => Player) public players;

    function bet_commit(bytes32 _commit) payable public {
        require(msg.value >= 0.01 ether);
        players[msg.sender].bet_amount = (uint)(msg.value);
        players[msg.sender].idx = curr_card_index;
        players[msg.sender].commitment = _commit;
        if(block.number >= start_block + wait_blocks) {
            new_card();
        }
    }

    function bet_reveal(uint8 choice, uint256 nonce) public {
        require(curr_card_index - players[msg.sender].idx > 0 && curr_card_index - players[msg.sender].idx < SHUFFLE_LIMIT);
        if(block.number >= start_block + wait_blocks) {
            new_card();
        }
        bytes32 test_hash = keccak256(abi.encodePacked(choice, nonce));
        uint bet_card = cards[players[msg.sender].idx] % SUITE_SIZE;
        uint result_card = cards[addmod(players[msg.sender].idx, 1, SHUFFLE_LIMIT)] % SUITE_SIZE;
        if(test_hash == players[msg.sender].commitment) {
            if (result_card == bet_card)
                house.transfer(players[msg.sender].bet_amount);
            else if (result_card < bet_card && choice == 0)
                msg.sender.transfer(2*players[msg.sender].bet_amount);
            else if (result_card > bet_card && choice == 1)
                msg.sender.transfer(2*players[msg.sender].bet_amount);
        }
    }
}
