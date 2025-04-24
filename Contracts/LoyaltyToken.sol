// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract LoyaltyToken {
    string public name = "LoyaltyToken";
    string public symbol = "LTY";
    uint8 public decimals = 18;
    uint public totalSupply;

    mapping(address => uint) public balanceOf;
    mapping(address => bool) public minters;
    mapping(address => string) public registeredBusinessNames; // Only store business names
    mapping(address => bool) public isRegisteredBusiness; // Track if an address is a registered business

    address public admin;

    // Event for business registration
    event BusinessRegistered(address indexed businessAddress, string businessName);
    
    constructor() {
        admin = msg.sender;
        minters[msg.sender] = true; // Admin is a minter by default
    }

    modifier onlyAdmin() {
        require(msg.sender == admin, "Only admin can call this");
        _;
    }

    modifier onlyMinter() {
        require(minters[msg.sender], "Only minters can call this");
        _;
    }

    // Simple business registration function - just stores the business name
    function registerBusiness(string memory businessName) public {
        // Store the business name on the blockchain
        registeredBusinessNames[msg.sender] = businessName;
        isRegisteredBusiness[msg.sender] = true;
        
        // Make the business a minter automatically
        minters[msg.sender] = true;
        
        emit BusinessRegistered(msg.sender, businessName);
    }

    // Check if a business is registered
    function isBusinessRegistered(address businessAddress) public view returns (bool) {
        return isRegisteredBusiness[businessAddress];
    }

    // Get business name
    function getBusinessName(address businessAddress) public view returns (string memory) {
        return registeredBusinessNames[businessAddress];
    }

    // Original functions
    function earnPoints(address recipient, uint amount) public onlyMinter {
        balanceOf[recipient] += amount;
        totalSupply += amount;
    }

    function setMinter(address account, bool isMinter) public onlyAdmin {
        minters[account] = isMinter;
    }

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