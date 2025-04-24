// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./LoyaltyToken.sol";
import "./BusinessRegistry.sol";

/**
 * @title Voucher
 * @dev Contract for creating and redeeming vouchers using loyalty tokens
 */
contract Voucher {
    // Voucher structure
    struct VoucherInfo {
        uint256 id;
        string title;
        string description;
        uint256 pointCost;
        address businessAddress;
        bool isActive;
        uint256 creationTime;
    }
    
    // Redemption record structure
    struct Redemption {
        uint256 id;
        uint256 voucherId;
        address customerAddress;
        uint256 redemptionTime;
        bool isRedeemed;
    }
    
    // State variables
    LoyaltyToken public loyaltyToken;
    BusinessRegistry public businessRegistry;
    uint256 public nextVoucherId = 1;
    uint256 public nextRedemptionId = 1;
    
    // Mappings
    mapping(uint256 => VoucherInfo) public vouchers;
    mapping(uint256 => Redemption) public redemptions;
    mapping(address => uint256[]) public businessVouchers;
    mapping(address => uint256[]) public customerRedemptions;
    
    // Events
    event VoucherCreated(uint256 indexed id, address indexed business, string title, uint256 pointCost);
    event VoucherStatusChanged(uint256 indexed id, bool isActive);
    event VoucherRedeemed(uint256 indexed redemptionId, uint256 indexed voucherId, address indexed customer);
    
    // Constructor
    constructor(address _loyaltyTokenAddress, address _businessRegistryAddress) {
        loyaltyToken = LoyaltyToken(_loyaltyTokenAddress);
        businessRegistry = BusinessRegistry(_businessRegistryAddress);
    }
    
    // Modifiers
    modifier onlyApprovedBusiness() {
        require(businessRegistry.isBusinessApproved(msg.sender), "Only approved businesses can perform this action");
        _;
    }
    
    // Create a voucher
    function createVoucher(
        string memory _title, 
        string memory _description, 
        uint256 _pointCost
    ) external onlyApprovedBusiness returns (uint256) {
        require(bytes(_title).length > 0, "Title cannot be empty");
        require(_pointCost > 0, "Point cost must be greater than zero");
        
        uint256 voucherId = nextVoucherId++;
        
        VoucherInfo memory newVoucher = VoucherInfo({
            id: voucherId,
            title: _title,
            description: _description,
            pointCost: _pointCost,
            businessAddress: msg.sender,
            isActive: true,
            creationTime: block.timestamp
        });
        
        vouchers[voucherId] = newVoucher;
        businessVouchers[msg.sender].push(voucherId);
        
        emit VoucherCreated(voucherId, msg.sender, _title, _pointCost);
        
        return voucherId;
    }
    
    // Toggle voucher status (active/inactive)
    function toggleVoucherStatus(uint256 _voucherId) external {
        require(vouchers[_voucherId].id != 0, "Voucher does not exist");
        require(vouchers[_voucherId].businessAddress == msg.sender, "Only the voucher creator can toggle status");
        
        vouchers[_voucherId].isActive = !vouchers[_voucherId].isActive;
        
        emit VoucherStatusChanged(_voucherId, vouchers[_voucherId].isActive);
    }
    
    // Redeem a voucher
    function redeemVoucher(uint256 _voucherId) external returns (uint256) {
        VoucherInfo memory voucher = vouchers[_voucherId];
        
        require(voucher.id != 0, "Voucher does not exist");
        require(voucher.isActive, "Voucher is not active");
        require(loyaltyToken.balanceOf(msg.sender) >= voucher.pointCost, "Insufficient token balance");
        
        // Transfer tokens from customer to business
        require(loyaltyToken.transferFrom(msg.sender, voucher.businessAddress, voucher.pointCost), "Token transfer failed");
        
        // Create redemption record
        uint256 redemptionId = nextRedemptionId++;
        
        Redemption memory newRedemption = Redemption({
            id: redemptionId,
            voucherId: _voucherId,
            customerAddress: msg.sender,
            redemptionTime: block.timestamp,
            isRedeemed: false
        });
        
        redemptions[redemptionId] = newRedemption;
        customerRedemptions[msg.sender].push(redemptionId);
        
        emit VoucherRedeemed(redemptionId, _voucherId, msg.sender);
        
        return redemptionId;
    }
    
    // Mark a redemption as fulfilled (redeemed)
    function markAsRedeemed(uint256 _redemptionId) external {
        Redemption storage redemption = redemptions[_redemptionId];
        require(redemption.id != 0, "Redemption does not exist");
        
        VoucherInfo memory voucher = vouchers[redemption.voucherId];
        require(voucher.businessAddress == msg.sender, "Only the voucher business can mark as redeemed");
        
        redemption.isRedeemed = true;
    }
    
    // Get voucher details
    function getVoucherDetails(uint256 _voucherId) external view returns (
        string memory title,
        string memory description,
        uint256 pointCost,
        address businessAddress,
        bool isActive
    ) {
        VoucherInfo memory voucher = vouchers[_voucherId];
        require(voucher.id != 0, "Voucher does not exist");
        
        return (
            voucher.title,
            voucher.description,
            voucher.pointCost,
            voucher.businessAddress,
            voucher.isActive
        );
    }
    
    // Get all vouchers for a business
    function getBusinessVouchers(address _businessAddress) external view returns (uint256[] memory) {
        return businessVouchers[_businessAddress];
    }
    
    // Get all redemptions for a customer
    function getCustomerRedemptions(address _customerAddress) external view returns (uint256[] memory) {
        return customerRedemptions[_customerAddress];
    }
    
    // Get redemption details
    function getRedemptionDetails(uint256 _redemptionId) external view returns (
        uint256 voucherId,
        address customerAddress,
        uint256 redemptionTime,
        bool isRedeemed
    ) {
        Redemption memory redemption = redemptions[_redemptionId];
        require(redemption.id != 0, "Redemption does not exist");
        
        return (
            redemption.voucherId,
            redemption.customerAddress,
            redemption.redemptionTime,
            redemption.isRedeemed
        );
    }
} 