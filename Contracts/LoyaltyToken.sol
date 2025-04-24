// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract BusinessVoucher {
    // State variables
    address public admin;
    
    // Business registration tracking
    mapping(address => bool) public isRegisteredBusiness;
    mapping(address => string) public businessNames;
    address[] public registeredBusinesses;
    
    // Voucher tracking
    struct Voucher {
        uint id;
        string description;
        uint value;
        bool used;
        address business;
        uint issueDate;
    }
    
    // Customer vouchers mapping: customer address => voucher ID => Voucher
    mapping(address => mapping(uint => Voucher)) public customerVouchers;
    mapping(address => uint) public customerVoucherCount;
    
    // Public voucher tracking
    struct PublicVoucher {
        uint id;
        string description;
        uint value;
        address business;
        uint totalSupply;
        uint claimedCount;
        bool isActive;
    }
    
    PublicVoucher[] public publicVouchers;
    mapping(uint => mapping(address => bool)) public hasClaimedVoucher;

    // Events
    event BusinessRegistered(address indexed businessAddress, string name);
    event VoucherIssued(address indexed business, address indexed customer, uint voucherId, uint value);
    event VoucherUsed(address indexed customer, uint voucherId);
    event PublicVoucherCreated(uint indexed voucherId, address indexed business, string description, uint value);
    event VoucherClaimed(address indexed customer, uint indexed voucherId);
    
    constructor() {
        admin = msg.sender;
    }
    
    // Business registration function
    function registerBusiness(string memory _businessName) public {
        require(!isRegisteredBusiness[msg.sender], "Business already registered");
        require(bytes(_businessName).length > 0, "Business name cannot be empty");
        
        isRegisteredBusiness[msg.sender] = true;
        businessNames[msg.sender] = _businessName;
        registeredBusinesses.push(msg.sender);
        
        emit BusinessRegistered(msg.sender, _businessName);
    }
    
    // Check if a business is registered
    function checkBusinessRegistration(address _businessAddress) public view returns (bool, string memory) {
        return (isRegisteredBusiness[_businessAddress], businessNames[_businessAddress]);
    }
    
    // Issue voucher function - only registered businesses can issue vouchers
    function issueVoucher(address _customer, string memory _description, uint _value) public returns (uint) {
        require(isRegisteredBusiness[msg.sender], "Only registered businesses can issue vouchers");
        require(_customer != address(0), "Invalid customer address");
        require(_value > 0, "Value must be positive");
        require(bytes(_description).length > 0, "Description cannot be empty");

        uint voucherId = customerVoucherCount[_customer];
        customerVouchers[_customer][voucherId] = Voucher({
            id: voucherId,
            description: _description,
            value: _value,
            used: false,
            business: msg.sender,
            issueDate: block.timestamp
        });
        
        customerVoucherCount[_customer]++;
        emit VoucherIssued(msg.sender, _customer, voucherId, _value);
        return voucherId;
    }
    
    // Use voucher function
    function useVoucher(uint _voucherId) public {
        require(_voucherId < customerVoucherCount[msg.sender], "Voucher doesn't exist");
        require(!customerVouchers[msg.sender][_voucherId].used, "Voucher already used");
        
        customerVouchers[msg.sender][_voucherId].used = true;
        emit VoucherUsed(msg.sender, _voucherId);
    }
    
    // Get voucher details
    function getVoucherDetails(address _customer, uint _voucherId) public view 
        returns (string memory description, uint value, bool used, address business, uint issueDate) {
        require(_voucherId < customerVoucherCount[_customer], "Voucher doesn't exist");
        
        Voucher memory voucher = customerVouchers[_customer][_voucherId];
        return (voucher.description, voucher.value, voucher.used, voucher.business, voucher.issueDate);
    }

    // Create a public voucher (only businesses)
    function createPublicVoucher(string memory _description, uint _value, uint _supply) public {
        require(isRegisteredBusiness[msg.sender], "Only registered businesses");
        require(_value > 0, "Value must be positive");
        require(_supply > 0, "Supply must be positive");
        require(bytes(_description).length > 0, "Description cannot be empty");

        uint voucherId = publicVouchers.length;
        publicVouchers.push(PublicVoucher({
            id: voucherId,
            description: _description,
            value: _value,
            business: msg.sender,
            totalSupply: _supply,
            claimedCount: 0,
            isActive: true
        }));

        emit PublicVoucherCreated(voucherId, msg.sender, _description, _value);
    }

    // Claim a public voucher
    function claimPublicVoucher(uint _voucherId) public {
        require(_voucherId < publicVouchers.length, "Invalid voucher");
        PublicVoucher storage voucher = publicVouchers[_voucherId];
        
        require(voucher.isActive, "Voucher not active");
        require(!hasClaimedVoucher[_voucherId][msg.sender], "Already claimed");
        require(voucher.claimedCount < voucher.totalSupply, "Voucher supply exhausted");

        hasClaimedVoucher[_voucherId][msg.sender] = true;
        voucher.claimedCount++;

        uint customerVoucherId = customerVoucherCount[msg.sender];
        customerVouchers[msg.sender][customerVoucherId] = Voucher({
            id: customerVoucherId,
            description: voucher.description,
            value: voucher.value,
            used: false,
            business: voucher.business,
            issueDate: block.timestamp
        });
        customerVoucherCount[msg.sender]++;

        emit VoucherClaimed(msg.sender, _voucherId);
        emit VoucherIssued(voucher.business, msg.sender, customerVoucherId, voucher.value);
    }

    // Get all active public vouchers
    function getActivePublicVouchers() public view returns (PublicVoucher[] memory) {
        uint activeCount = 0;
        for (uint i = 0; i < publicVouchers.length; i++) {
            if (publicVouchers[i].isActive && publicVouchers[i].claimedCount < publicVouchers[i].totalSupply) {
                activeCount++;
            }
        }

        PublicVoucher[] memory activeVouchers = new PublicVoucher[](activeCount);
        uint index = 0;
        for (uint i = 0; i < publicVouchers.length; i++) {
            if (publicVouchers[i].isActive && publicVouchers[i].claimedCount < publicVouchers[i].totalSupply) {
                activeVouchers[index] = publicVouchers[i];
                index++;
            }
        }
        return activeVouchers;
    }

    // Get total number of registered businesses
    function getBusinessCount() public view returns (uint) {
        return registeredBusinesses.length;
    }
}