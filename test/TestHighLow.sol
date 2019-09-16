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
        Assert.isAtLeast(high_low.announced_card(), 1, "Announced card is too low");
        Assert.isBelow(high_low.announced_card(), 11, "Announced card is too high");
    }
}
