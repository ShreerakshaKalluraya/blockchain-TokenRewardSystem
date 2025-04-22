// web3.actions.js - Handles all Web3 and smart contract interactions

// Replace with your actual contract ABI
const LOYALTY_TOKEN_ABI = [
	{
		"inputs": [],
		"stateMutability": "nonpayable",
		"type": "constructor"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "spender",
				"type": "address"
			},
			{
				"internalType": "uint256",
				"name": "allowance",
				"type": "uint256"
			},
			{
				"internalType": "uint256",
				"name": "needed",
				"type": "uint256"
			}
		],
		"name": "ERC20InsufficientAllowance",
		"type": "error"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "sender",
				"type": "address"
			},
			{
				"internalType": "uint256",
				"name": "balance",
				"type": "uint256"
			},
			{
				"internalType": "uint256",
				"name": "needed",
				"type": "uint256"
			}
		],
		"name": "ERC20InsufficientBalance",
		"type": "error"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "approver",
				"type": "address"
			}
		],
		"name": "ERC20InvalidApprover",
		"type": "error"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "receiver",
				"type": "address"
			}
		],
		"name": "ERC20InvalidReceiver",
		"type": "error"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "sender",
				"type": "address"
			}
		],
		"name": "ERC20InvalidSender",
		"type": "error"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "spender",
				"type": "address"
			}
		],
		"name": "ERC20InvalidSpender",
		"type": "error"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "owner",
				"type": "address"
			}
		],
		"name": "OwnableInvalidOwner",
		"type": "error"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "account",
				"type": "address"
			}
		],
		"name": "OwnableUnauthorizedAccount",
		"type": "error"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": true,
				"internalType": "address",
				"name": "owner",
				"type": "address"
			},
			{
				"indexed": true,
				"internalType": "address",
				"name": "spender",
				"type": "address"
			},
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "value",
				"type": "uint256"
			}
		],
		"name": "Approval",
		"type": "event"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": false,
				"internalType": "address",
				"name": "businessAddress",
				"type": "address"
			},
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "timestamp",
				"type": "uint256"
			}
		],
		"name": "BusinessApproved",
		"type": "event"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": false,
				"internalType": "address",
				"name": "businessAddress",
				"type": "address"
			},
			{
				"indexed": false,
				"internalType": "string",
				"name": "name",
				"type": "string"
			},
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "timestamp",
				"type": "uint256"
			}
		],
		"name": "BusinessRegistered",
		"type": "event"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": true,
				"internalType": "address",
				"name": "previousOwner",
				"type": "address"
			},
			{
				"indexed": true,
				"internalType": "address",
				"name": "newOwner",
				"type": "address"
			}
		],
		"name": "OwnershipTransferred",
		"type": "event"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": false,
				"internalType": "address",
				"name": "customerAddress",
				"type": "address"
			},
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "points",
				"type": "uint256"
			},
			{
				"indexed": false,
				"internalType": "string",
				"name": "reason",
				"type": "string"
			},
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "timestamp",
				"type": "uint256"
			}
		],
		"name": "PointsEarned",
		"type": "event"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": true,
				"internalType": "address",
				"name": "from",
				"type": "address"
			},
			{
				"indexed": true,
				"internalType": "address",
				"name": "to",
				"type": "address"
			},
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "value",
				"type": "uint256"
			}
		],
		"name": "Transfer",
		"type": "event"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "voucherId",
				"type": "uint256"
			},
			{
				"indexed": false,
				"internalType": "address",
				"name": "businessAddress",
				"type": "address"
			},
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "pointCost",
				"type": "uint256"
			},
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "timestamp",
				"type": "uint256"
			}
		],
		"name": "VoucherCreated",
		"type": "event"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "voucherId",
				"type": "uint256"
			},
			{
				"indexed": false,
				"internalType": "address",
				"name": "customerAddress",
				"type": "address"
			},
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "pointsSpent",
				"type": "uint256"
			},
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "timestamp",
				"type": "uint256"
			}
		],
		"name": "VoucherRedeemed",
		"type": "event"
	},
	{
		"inputs": [],
		"name": "POINTS_DECIMAL_FACTOR",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "TIME_REWARD_MINUTES",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "TIME_REWARD_POINTS",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "owner",
				"type": "address"
			},
			{
				"internalType": "address",
				"name": "spender",
				"type": "address"
			}
		],
		"name": "allowance",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "spender",
				"type": "address"
			},
			{
				"internalType": "uint256",
				"name": "value",
				"type": "uint256"
			}
		],
		"name": "approve",
		"outputs": [
			{
				"internalType": "bool",
				"name": "",
				"type": "bool"
			}
		],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "_businessAddress",
				"type": "address"
			}
		],
		"name": "approveBusiness",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "account",
				"type": "address"
			}
		],
		"name": "balanceOf",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "",
				"type": "address"
			}
		],
		"name": "businesses",
		"outputs": [
			{
				"internalType": "string",
				"name": "name",
				"type": "string"
			},
			{
				"internalType": "bool",
				"name": "isRegistered",
				"type": "bool"
			},
			{
				"internalType": "bool",
				"name": "isApproved",
				"type": "bool"
			},
			{
				"internalType": "uint256",
				"name": "registrationDate",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "string",
				"name": "_title",
				"type": "string"
			},
			{
				"internalType": "string",
				"name": "_description",
				"type": "string"
			},
			{
				"internalType": "uint256",
				"name": "_pointCost",
				"type": "uint256"
			}
		],
		"name": "createVoucher",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "decimals",
		"outputs": [
			{
				"internalType": "uint8",
				"name": "",
				"type": "uint8"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "_customer",
				"type": "address"
			},
			{
				"internalType": "uint256",
				"name": "_points",
				"type": "uint256"
			},
			{
				"internalType": "string",
				"name": "_reason",
				"type": "string"
			}
		],
		"name": "issuePoints",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "_customer",
				"type": "address"
			},
			{
				"internalType": "uint256",
				"name": "_purchaseAmount",
				"type": "uint256"
			}
		],
		"name": "issuePurchasePoints",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "",
				"type": "address"
			}
		],
		"name": "lastActivityTime",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "_amount",
				"type": "uint256"
			}
		],
		"name": "mintAdditionalTokens",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "name",
		"outputs": [
			{
				"internalType": "string",
				"name": "",
				"type": "string"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "owner",
		"outputs": [
			{
				"internalType": "address",
				"name": "",
				"type": "address"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "_customer",
				"type": "address"
			}
		],
		"name": "recordActivity",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "_voucherId",
				"type": "uint256"
			}
		],
		"name": "redeemVoucher",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "string",
				"name": "_name",
				"type": "string"
			}
		],
		"name": "registerBusiness",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "renounceOwnership",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "symbol",
		"outputs": [
			{
				"internalType": "string",
				"name": "",
				"type": "string"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "_voucherId",
				"type": "uint256"
			}
		],
		"name": "toggleVoucherStatus",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "totalSupply",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "to",
				"type": "address"
			},
			{
				"internalType": "uint256",
				"name": "value",
				"type": "uint256"
			}
		],
		"name": "transfer",
		"outputs": [
			{
				"internalType": "bool",
				"name": "",
				"type": "bool"
			}
		],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "from",
				"type": "address"
			},
			{
				"internalType": "address",
				"name": "to",
				"type": "address"
			},
			{
				"internalType": "uint256",
				"name": "value",
				"type": "uint256"
			}
		],
		"name": "transferFrom",
		"outputs": [
			{
				"internalType": "bool",
				"name": "",
				"type": "bool"
			}
		],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "newOwner",
				"type": "address"
			}
		],
		"name": "transferOwnership",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "voucherCounter",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"name": "vouchers",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "id",
				"type": "uint256"
			},
			{
				"internalType": "address",
				"name": "businessAddress",
				"type": "address"
			},
			{
				"internalType": "string",
				"name": "title",
				"type": "string"
			},
			{
				"internalType": "string",
				"name": "description",
				"type": "string"
			},
			{
				"internalType": "uint256",
				"name": "pointCost",
				"type": "uint256"
			},
			{
				"internalType": "bool",
				"name": "isActive",
				"type": "bool"
			}
		],
		"stateMutability": "view",
		"type": "function"
	}
] ;;

// Replace with your deployed contract address
const LOYALTY_TOKEN_ADDRESS = "0x8117260c3fa8e2e9cc78a50275de9111fab78c63"; 

// Network names mapping
const NETWORK_NAMES = {
    
    1337: 'Local Ganache',
    31337: 'Hardhat Network'
};

// Web3 state
let web3State = {
    web3Instance: null,
    userAccount: null,
    networkId: null,
    contract: null,
    isInitialized: false
};

// Check if MetaMask is installed
function isMetaMaskInstalled() {
    return typeof window.ethereum !== 'undefined';
}

// Initialize Web3 and contract
async function initWeb3() {
    if (!isMetaMaskInstalled()) {
        throw new Error("MetaMask is not installed");
    }

    try {
        // Request account access
        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
        web3State.userAccount = accounts[0];
        
        // Create Web3 instance
        web3State.web3Instance = new Web3(window.ethereum);
        
        // Get network ID
        web3State.networkId = await web3State.web3Instance.eth.net.getId();
        
        // Initialize contract
        web3State.contract = new web3State.web3Instance.eth.Contract(
            LOYALTY_TOKEN_ABI,
            LOYALTY_TOKEN_ADDRESS
        );
        
        // Set up event listeners
        window.ethereum.on('accountsChanged', (accounts) => {
            web3State.userAccount = accounts[0] || null;
            if (window.updateUI) window.updateUI();
        });
        
        window.ethereum.on('chainChanged', () => window.location.reload());
        
        web3State.isInitialized = true;
        
        return {
            account: web3State.userAccount,
            networkName: NETWORK_NAMES[web3State.networkId] || `Chain ID: ${web3State.networkId}`
        };
    } catch (error) {
        console.error("Web3 initialization failed:", error);
        throw error;
    }
}

// Get token balance
async function getTokenBalance() {
    if (!web3State.isInitialized) await initWeb3();
    const balance = await web3State.contract.methods.balanceOf(web3State.userAccount).call();
    return web3State.web3Instance.utils.fromWei(balance, 'ether');
}

// Redeem a voucher
async function redeemVoucher(voucherId) {
    if (!web3State.isInitialized) await initWeb3();
    const tx = await web3State.contract.methods
        .redeemVoucher(voucherId)
        .send({ from: web3State.userAccount });
    return tx.transactionHash;
}

// Record activity for time-based rewards
async function recordActivity() {
    if (!web3State.isInitialized) await initWeb3();
    const tx = await web3State.contract.methods
        .recordActivity(web3State.userAccount)
        .send({ from: web3State.userAccount });
    return tx.transactionHash;
}

// Get voucher details
async function getVoucherDetails(voucherId) {
    if (!web3State.isInitialized) await initWeb3();
    const voucher = await web3State.contract.methods.vouchers(voucherId).call();
    return {
        id: voucher.id,
        title: voucher.title,
        description: voucher.description,
        pointCost: web3State.web3Instance.utils.fromWei(voucher.pointCost),
        isActive: voucher.isActive
    };
}

// Get active vouchers
async function getActiveVouchers() {
    if (!web3State.isInitialized) await initWeb3();
    const voucherCount = await web3State.contract.methods.voucherCounter().call();
    const vouchers = [];
    
    for (let i = 1; i <= voucherCount; i++) {
        const voucher = await getVoucherDetails(i);
        if (voucher.isActive) {
            vouchers.push(voucher);
        }
    }
    
    return vouchers;
}

// Get current account
function getCurrentAccount() {
    return web3State.userAccount;
}
async function createVoucher(title, description, pointCost) {
    if (!web3State.isInitialized) await initWeb3();
    
    // Convert points to wei
    const pointCostWei = web3State.web3Instance.utils.toWei(pointCost, 'ether');
    
    const tx = await web3State.contract.methods
        .createVoucher(title, description, pointCostWei)
        .send({ from: web3State.userAccount });
    
    // Get the voucher ID from the event logs
    const voucherId = tx.events.VoucherCreated.returnValues.voucherId;
    
    return {
        success: true,
        voucherId: voucherId
    };
}

async function getBusinessVouchers(businessAddress) {
    if (!web3State.isInitialized) await initWeb3();
    
    const voucherCount = await web3State.contract.methods.voucherCounter().call();
    const vouchers = [];
    
    for (let i = 1; i <= voucherCount; i++) {
        const voucher = await web3State.contract.methods.vouchers(i).call();
        if (voucher.businessAddress === businessAddress) {
            vouchers.push({
                id: voucher.id,
                title: voucher.title,
                description: voucher.description,
                pointCost: web3State.web3Instance.utils.fromWei(voucher.pointCost),
                isActive: voucher.isActive
            });
        }
    }
    
    return vouchers;
}

async function toggleVoucherStatus(voucherId) {
    if (!web3State.isInitialized) await initWeb3();
    
    const tx = await web3State.contract.methods
        .toggleVoucherStatus(voucherId)
        .send({ from: web3State.userAccount });
    
    return tx.transactionHash;
}
// Business functions
async function isBusinessRegistered(address) {
    if (!web3State.isInitialized) await initWeb3();
    try {
        const business = await web3State.contract.methods.businesses(address).call();
        return business.isRegistered;
    } catch (error) {
        console.error("Error checking business registration:", error);
        return false;
    }
}

async function isBusinessApproved(address) {
    if (!web3State.isInitialized) await initWeb3();
    try {
        const business = await web3State.contract.methods.businesses(address).call();
        return business.isApproved;
    } catch (error) {
        console.error("Error checking business approval:", error);
        return false;
    }
}

async function registerBusiness(businessName) {
    if (!web3State.isInitialized) await initWeb3();
    try {
        const tx = await web3State.contract.methods
            .registerBusiness(businessName)
            .send({ from: web3State.userAccount });
        return {
            success: true,
            transactionHash: tx.transactionHash
        };
    } catch (error) {
        console.error("Error registering business:", error);
        return {
            success: false,
            error: error.message
        };
    }
}

async function createVoucher(title, description, pointCost) {
    if (!web3State.isInitialized) await initWeb3();
    try {
        // Convert points to wei (assuming 18 decimals)
        const pointCostWei = web3State.web3Instance.utils.toWei(pointCost.toString(), 'ether');
        
        const tx = await web3State.contract.methods
            .createVoucher(title, description, pointCostWei)
            .send({ from: web3State.userAccount });
        
        // Get voucher ID from event logs
        const voucherId = tx.events.VoucherCreated.returnValues.voucherId;
        
        return {
            success: true,
            voucherId: voucherId,
            transactionHash: tx.transactionHash
        };
    } catch (error) {
        console.error("Error creating voucher:", error);
        return {
            success: false,
            error: error.message
        };
    }
}

async function getBusinessVouchers(businessAddress) {
    if (!web3State.isInitialized) await initWeb3();
    try {
        const voucherCount = await web3State.contract.methods.voucherCounter().call();
        const vouchers = [];
        
        for (let i = 1; i <= voucherCount; i++) {
            const voucher = await web3State.contract.methods.vouchers(i).call();
            if (voucher.businessAddress === businessAddress) {
                vouchers.push({
                    id: voucher.id,
                    title: voucher.title,
                    description: voucher.description,
                    pointCost: web3State.web3Instance.utils.fromWei(voucher.pointCost),
                    isActive: voucher.isActive
                });
            }
        }
        
        return vouchers;
    } catch (error) {
        console.error("Error getting business vouchers:", error);
        throw error;
    }
}

async function toggleVoucherStatus(voucherId) {
    if (!web3State.isInitialized) await initWeb3();
    try {
        const tx = await web3State.contract.methods
            .toggleVoucherStatus(voucherId)
            .send({ from: web3State.userAccount });
        return {
            success: true,
            transactionHash: tx.transactionHash
        };
    } catch (error) {
        console.error("Error toggling voucher status:", error);
        return {
            success: false,
            error: error.message
        };
    }
}
// Make functions available globally
window.web3Actions = {
    isMetaMaskInstalled,
    initWeb3,
    getTokenBalance,
    redeemVoucher,
    recordActivity,
    getVoucherDetails,
    getActiveVouchers,
    getCurrentAccount,
    createVoucher,
    getBusinessVouchers,
    toggleVoucherStatus,
    isBusinessRegistered,
    isBusinessApproved,
    registerBusiness,
    createVoucher,
    getBusinessVouchers,
    toggleVoucherStatus
};