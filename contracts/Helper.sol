pragma solidity ^0.5.8;

contract Helper {
    function helpCommitment(uint8 choice, uint256 nonce) public pure returns (bytes32) {
        return keccak256(abi.encodePacked(choice, nonce));
    }
}
