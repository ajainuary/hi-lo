pragma solidity ^0.5.8;

import "truffle/Assert.sol";
import "../contracts/HighLow.sol";

contract TestHighLow {
    function testHouseDuringCreation() public {
        HighLow high_low = new HighLow();
        Assert.equal(address(high_low.house()), address(this), "An owner is different than a deployer");
    }

    function testNewCard() public {
        HighLow high_low = new HighLow();
        uint index = high_low.curr_card_index();
        uint new_card = high_low.cards(index);
        Assert.isAtLeast(new_card, 0, "New card is lower than zero");
        Assert.isBelow(new_card, high_low.MAX_CARDS(), "New card is higher than max cards");
    }

    function helpCommitment(uint8 choice, uint256 nonce) public returns (bytes32) {
        return keccak256(abi.encodePacked(choice, nonce));
    }
}
