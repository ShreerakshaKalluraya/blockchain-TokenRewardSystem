# Blockchain Loyalty Token System - Smart Contracts

This directory contains the smart contracts for the Blockchain Loyalty Token Reward System.

## Overview

The system consists of the following contracts:

1. **LoyaltyToken.sol**: The main token contract for loyalty points.
2. **BusinessRegistry.sol**: Contract for registering and approving businesses.
3. **Voucher.sol**: Contract for creating and redeeming vouchers using loyalty tokens.
4. **LoyaltySystemFactory.sol**: Factory contract that deploys and connects all components.

## Contract Details

### LoyaltyToken.sol

This is an ERC20-like token implementation for the loyalty points system. It includes:
- Token minting with role-based access control
- Basic token transfers
- Admin functions to manage minters

### BusinessRegistry.sol

Handles business registration and approval:
- Businesses can register with their name
- Admin can approve businesses
- Functions to check business status

### Voucher.sol

Manages vouchers and redemption:
- Approved businesses can create vouchers with titles, descriptions, and point costs
- Customers can redeem vouchers using their loyalty tokens
- Businesses can toggle voucher active status
- Businesses can mark redemptions as fulfilled

### LoyaltySystemFactory.sol

Deploys and connects all the contracts:
- Creates all contracts in a single transaction
- Sets up permissions between contracts
- Stores addresses for easy reference

## How to Deploy

1. Deploy the factory contract:
   ```
   LoyaltySystemFactory factory = new LoyaltySystemFactory();
   ```

2. Get the addresses of the deployed contracts:
   ```
   (address admin, address token, address registry, address voucher) = factory.getSystemAddresses();
   ```

3. Use these addresses to interact with the individual contracts.

## Usage Flow

1. **Admin**:
   - System is deployed with the deployer as admin
   - Admin approves business registrations

2. **Business**:
   - Registers in the system
   - Once approved, creates vouchers with point costs
   - Marks redemptions as fulfilled

3. **Customer**:
   - Earns loyalty tokens
   - Redeems tokens for vouchers
   - Uses vouchers at businesses

## Integration with Backend

The contracts are designed to work with the Flask backend in the `backend` directory.
See `backend/loyalty_extension.py` for API endpoints that interact with these contracts. 