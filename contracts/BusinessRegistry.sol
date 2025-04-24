// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

/**
 * @title BusinessRegistry
 * @dev Simple contract for registering and managing businesses in the loyalty system
 */
contract BusinessRegistry {
    // Business structure
    struct Business {
        string name;
        address businessAddress;
        bool isApproved;
        uint256 registrationTime;
    }
    
    // State variables
    address public admin;
    mapping(address => Business) public businesses;
    mapping(address => bool) public isRegistered;
    
    // Events
    event BusinessRegistered(address indexed businessAddress, string name, uint256 timestamp);
    event BusinessApproved(address indexed businessAddress, uint256 timestamp);
    
    // Constructor
    constructor() {
        admin = msg.sender;
    }
    
    // Modifiers
    modifier onlyAdmin() {
        require(msg.sender == admin, "Only admin can perform this action");
        _;
    }
    
    modifier notRegistered() {
        require(!isRegistered[msg.sender], "Business already registered");
        _;
    }
    
    // Register business
    function registerBusiness(string memory _name) external notRegistered {
        require(bytes(_name).length > 0, "Business name cannot be empty");
        
        Business memory newBusiness = Business({
            name: _name,
            businessAddress: msg.sender,
            isApproved: false,
            registrationTime: block.timestamp
        });
        
        businesses[msg.sender] = newBusiness;
        isRegistered[msg.sender] = true;
        
        emit BusinessRegistered(msg.sender, _name, block.timestamp);
    }
    
    // Approve business (admin only)
    function approveBusiness(address _businessAddress) external onlyAdmin {
        require(isRegistered[_businessAddress], "Business not registered");
        require(!businesses[_businessAddress].isApproved, "Business already approved");
        
        businesses[_businessAddress].isApproved = true;
        
        emit BusinessApproved(_businessAddress, block.timestamp);
    }
    
    // Check if business is registered
    function isBusinessRegistered(address _businessAddress) external view returns (bool) {
        return isRegistered[_businessAddress];
    }
    
    // Check if business is approved
    function isBusinessApproved(address _businessAddress) external view returns (bool) {
        return isRegistered[_businessAddress] && businesses[_businessAddress].isApproved;
    }
    
    // Get business details
    function getBusinessDetails(address _businessAddress) external view returns (string memory, bool, uint256) {
        require(isRegistered[_businessAddress], "Business not registered");
        Business memory business = businesses[_businessAddress];
        return (business.name, business.isApproved, business.registrationTime);
    }
} 