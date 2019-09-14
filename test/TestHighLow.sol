pragma solidity ^0.5.8;

import "truffle/Assert.sol";
import "../contracts/HighLow.sol";

contract TestHighLow {
    function testSettingAnOwnerDuringCreation() public {
        HighLow high_low = new HighLow();
        Assert.equal(address(high_low.house()), address(this), "An owner is different than a deployer");
    }
}