// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./LoyaltyToken.sol";
import "./BusinessRegistry.sol";
import "./Voucher.sol";

/**
 * @title LoyaltySystemFactory
 * @dev Factory contract to deploy and connect all loyalty system components
 */
contract LoyaltySystemFactory {
    // Deployed contract addresses
    address public loyaltyTokenAddress;
    address public businessRegistryAddress;
    address public voucherAddress;
    
    // Admin address
    address public admin;
    
    // Event
    event SystemDeployed(
        address indexed admin,
        address indexed loyaltyToken,
        address indexed businessRegistry,
        address voucher
    );
    
    constructor() {
        admin = msg.sender;
        
        // Deploy contracts
        LoyaltyToken loyaltyToken = new LoyaltyToken();
        BusinessRegistry businessRegistry = new BusinessRegistry();
        Voucher voucher = new Voucher(address(loyaltyToken), address(businessRegistry));
        
        // Store addresses
        loyaltyTokenAddress = address(loyaltyToken);
        businessRegistryAddress = address(businessRegistry);
        voucherAddress = address(voucher);
        
        // Make the voucher contract a minter
        loyaltyToken.setMinter(voucherAddress, true);
        
        // Emit event
        emit SystemDeployed(admin, loyaltyTokenAddress, businessRegistryAddress, voucherAddress);
    }
    
    // Get all system addresses
    function getSystemAddresses() external view returns (address, address, address, address) {
        return (admin, loyaltyTokenAddress, businessRegistryAddress, voucherAddress);
    }
} 