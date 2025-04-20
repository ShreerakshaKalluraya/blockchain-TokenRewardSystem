// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract LoyaltyToken {
    string public name = "LoyaltyToken";
    string public symbol = "LTY";
    uint8 public decimals = 18;
    uint public totalSupply;

    mapping(address => uint) public balanceOf;
    mapping(address => bool) public minters; // New: authorized minters

    address public admin;

    constructor() {
        admin = msg.sender;
        minters[msg.sender] = true; // Admin is a minter by default
    }

    // Add this modifier
    modifier onlyMinter() {
        require(minters[msg.sender], "Only minters can call this");
        _;
    }

    // Add this function
    function earnPoints(address recipient, uint amount) public onlyMinter {
        balanceOf[recipient] += amount;
        totalSupply += amount;
    }

    // Add this function to manage minters
    function setMinter(address account, bool isMinter) public {
        require(msg.sender == admin, "Only admin");
        minters[account] = isMinter;
    }

    // Keep existing functions...
    function mint(address to, uint amount) public onlyMinter {
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