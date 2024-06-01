// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract Lottery {
    // Declare state variables
    address payable public manager;
    address payable[] public players;

    // Define the constructor function
    constructor() {
        manager = payable(msg.sender);
    }

    function enter() public payable {
        require(msg.value > .01 ether);
        players.push(payable(msg.sender));
    }

    function random() private view returns (uint) {
        return uint(keccak256(abi.encodePacked(block.prevrandao, block.timestamp, players)));
    }

    function pickWinner() public restricted {
        require(players.length > 0, "There are no players to pick a winner from.");
        uint index = random() % players.length;
        address payable winner = players[index];
        uint balance = address(this).balance;
        (bool success, ) = winner.call{value: balance}("");
        require(success, "Transfer to winner failed.");
        // Reset the contract state
        players = new address payable[](0);
    }

    modifier restricted() {
        require(msg.sender == manager, "Only manager can call this function");
        _;
    }

    function getPlayers() public view returns (address payable[] memory) {
        return players;
    }
}