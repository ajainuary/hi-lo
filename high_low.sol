pragma solidity ^0.5.11;

contract HighLow {
    address payable[] player_addrs;   // dynamic array with player addresses
    address public house;             // contract owner

    constructor() public {
        house = msg.sender;
    }
    
    enum Choice {Low, High}

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
    function bet_on_high () payable public {
        require(msg.value >= 0.01 ether);

        Player memory new_player= Player({
            choice: Choice.High,
            bet_amount: (uint)(msg.value)
        });
        players[msg.sender] = new_player;
        player_addrs.push(msg.sender);
    }

    // payable function, ether are sent to the contract when calling this functions
    function bet_on_low () payable public {
        require(msg.value >= 0.01 ether);
        
        Player memory new_player= Player({
            choice: Choice.Low,
            bet_amount: (uint)(msg.value)
        });
        players[msg.sender] = new_player;
        player_addrs.push(msg.sender);
    }

    function house_balance() public view only_house returns (uint){
        return address(this).balance; //return contract balance
    }
    
    // returns a very big pseodo-random integer no.
    function random() internal view returns(uint256){
       //since solidity 0.5.0  keccak256() function accepts only a single bytes argument
       //we use the abi.encodePacked() function to get the bytes argument from 3 values
       return uint256(keccak256(abi.encodePacked(block.difficulty, block.timestamp, player_addrs.length)));
    }
    
    function get_player_choice(uint i) public view only_house returns (Choice) {
        if (i >= 0 && i < player_addrs.length)
            return players[player_addrs[i]].choice;
    }
    
    function get_player_bet_amount(uint i) public view only_house returns (uint) {
        if (i >= 0 && i < player_addrs.length)
            return players[player_addrs[i]].bet_amount;
    }
    
    function transfer() public only_house {
        if (player_addrs.length > 0) {
            uint256 index = random() % player_addrs.length;         // select a random player
            player_addrs[index].transfer(address(this).balance);    // pay the entire balance to this user
            
            // reset the players
            for (uint i = 0; i < player_addrs.length; ++i)
                delete players[player_addrs[i]];

            player_addrs = new address payable[](0);
        }
    }
}
