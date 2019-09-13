pragma solidity ^0.5.11;

contract HighLow {
    address payable[] player_addrs;   // dynamic array with player addresses
    address payable public house;             // contract owner
    uint[52] cards;
    uint curr_card_index;
    uint SHUFFLE_LIMIT = 40;

    struct Card {
        uint num;
        string name;
        string suit;
    }

    Card public announced_card;

    constructor() public {
        house = msg.sender;
        for (uint i = 0; i < cards.length; ++i)
            cards[i] = i;
        curr_card_index = SHUFFLE_LIMIT;
        announce_new_card();
    }

    enum Choice {Low, High}

    function announce_new_card() internal {
        ++curr_card_index;
        if (curr_card_index >= SHUFFLE_LIMIT) {
            shuffle_cards();
            curr_card_index = 0;
        }
        announced_card.num = get_card_num(cards[curr_card_index]);
        announced_card.name = get_card_name(cards[curr_card_index]);
        announced_card.suit = get_card_suit(cards[curr_card_index]);
    }

    function get_card_num(uint _index) internal pure returns (uint) {
        return _index % 13;
    }

    function get_card_suit(uint _index) internal pure returns (string memory) {
        uint  suit_num = _index / 13;
        if (suit_num == 0) return "diamonds";
        if (suit_num == 1) return "clubs";
        if (suit_num == 2) return "hearts";
        if (suit_num == 3) return "spades";
    }

    function get_card_name(uint _index) internal pure returns (string memory) {
        uint  num = _index % 13;
        if (num == 0) return "ace";
        if (num == 1) return "one";
        if (num == 2) return "two";
        if (num == 3) return "three";
        if (num == 4) return "four";
        if (num == 5) return "five";
        if (num == 6) return "six";
        if (num == 7) return "seven";
        if (num == 8) return "eight";
        if (num == 9) return "nine";
        if (num == 10) return "jack";
        if (num == 11) return "queen";
        if (num == 12) return "king";
    }

    struct Player {
        Choice choice;
        uint bet_amount;
    }

    // mapping, keys are of type addresses and values of type Player
    mapping (address => Player) players;

    modifier only_house() {
        require (msg.sender == house);
        _;
    }
    // payable function, ether are sent to the contract when calling this functions
    function bet_on_high () payable public{
        require(msg.value >= 0.01 ether);

        if (players[msg.sender].bet_amount == 0) {
            // this is a new player
            Player memory new_player= Player({
                choice: Choice.High,
                bet_amount: (uint)(msg.value)
            });
            players[msg.sender] = new_player;
            player_addrs.push(msg.sender);
        } else {
            players[msg.sender].choice = Choice.High;
            players[msg.sender].bet_amount = (uint)(msg.value);
        }
    }

    // payable function, ether are sent to the contract when calling this functions
    function bet_on_low () payable public {
        require(msg.value >= 0.01 ether);

        if (players[msg.sender].bet_amount == 0) {
            // this is a new player
            Player memory new_player= Player({
                choice: Choice.Low,
                bet_amount: (uint)(msg.value)
            });
            players[msg.sender] = new_player;
            player_addrs.push(msg.sender);
        } else {
            players[msg.sender].choice = Choice.Low;
            players[msg.sender].bet_amount = (uint)(msg.value);
        }
    }

    // function house_balance() public view only_house returns (uint){
    function house_balance() public view returns (uint){
        return address(this).balance; //return contract balance
    }
    
    // returns a very big pseodo-random integer no.
    function random() internal view returns(uint256){
        //since solidity 0.5.0  keccak256() function accepts only a single bytes argument
        //we use the abi.encodePacked() function to get the bytes argument from 3 values
        //return uint256(keccak256(abi.encodePacked(block.difficulty, block.timestamp, player_addrs.length)));
        return uint256(keccak256(abi.encodePacked(now)));
    }
    // function get_player_choice(uint i) public view only_house returns (Choice) {
    function get_player_choice(uint i) public view returns (Choice) {
        require (i >= 0 && i < player_addrs.length);
        return players[player_addrs[i]].choice;
    }
    // function get_player_bet_amount(uint i) public view only_house returns (uint) {
    function get_player_bet_amount(uint i) public view returns (uint) {
        require (i >= 0 && i < player_addrs.length);
        return players[player_addrs[i]].bet_amount;
    }

    function shuffle_cards() internal {
        for (uint i = 0; i < cards.length; i++) {
            uint n = i + random() % (cards.length - i);
            uint temp = cards[n];
            cards[n] = cards[i];
            cards[i] = temp;
        }
    }

    function high_low_reset() public {
        require (player_addrs.length > 0);
        for (uint i = 0; i < player_addrs.length; ++i) {
            Player memory p = players[player_addrs[i]];
            player_addrs[i].transfer(p.bet_amount);
        }
        announce_new_card();

        // reset the players
        for (uint i = 0; i < player_addrs.length; ++i)
            delete players[player_addrs[i]];

        player_addrs = new address payable[](0);
    }

    // function result() public only_house {
    function result() public {
        require (player_addrs.length > 0);
        // reward the winners
        uint next_card_num = cards[curr_card_index+1];
        for (uint i = 0; i < player_addrs.length; ++i) {
            Player memory p = players[player_addrs[i]];
            if (next_card_num < announced_card.num && p.choice == Choice.Low)
                player_addrs[i].transfer(2*p.bet_amount);   // pay the twice the player's bet amount
            if (next_card_num > announced_card.num && p.choice == Choice.High)
                player_addrs[i].transfer(2*p.bet_amount);
        }
        house.transfer(house_balance());
        announce_new_card();

        // reset the players
        for (uint i = 0; i < player_addrs.length; ++i)
            delete players[player_addrs[i]];

        player_addrs = new address payable[](0);
    }
}
