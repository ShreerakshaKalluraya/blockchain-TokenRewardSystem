// LoyaltyToken.sol
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract LoyaltyToken {
    string public name = "LoyaltyToken";
    string public symbol = "LTY";
    uint8 public decimals = 18;
    uint public totalSupply;

    mapping(address => uint) public balanceOf;
    mapping(address => mapping(address => uint)) public allowance;

    address public admin;

    constructor() {
        admin = msg.sender;
    }

    function mint(address to, uint amount) public {
        require(msg.sender == admin, "Only admin can mint");
        balanceOf[to] += amount;
        totalSupply += amount;
    }

    function transfer(address to, uint amount) public returns (bool) {
        require(balanceOf[msg.sender] >= amount, "Not enough tokens");
        balanceOf[msg.sender] -= amount;
        balanceOf[to] += amount;
        return true;
    }
}
