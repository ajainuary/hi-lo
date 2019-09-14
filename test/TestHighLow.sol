pragma solidity ^0.5.8;

import "truffle/Assert.sol";
import "../contracts/HighLow.sol";

contract TestHighLow {
    function testSettingHouseDuringCreation() public {
        HighLow high_low = new HighLow();
        Assert.equal(address(high_low.house()), address(this), "An owner is different than a deployer");
    }
    function helpCommitment(uint8 choice, uint256 nonce) public returns (bytes32) {
        return keccak256(abi.encodePacked(choice, nonce));
    }
}