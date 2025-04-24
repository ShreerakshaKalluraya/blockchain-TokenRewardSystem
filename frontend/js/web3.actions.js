// web3.actions.js - Handles all Web3 and smart contract interactions

// Replace with your actual contract ABI
const LOYALTY_TOKEN_ABI = [
	{
		"inputs": [],
		"stateMutability": "nonpayable",
		"type": "constructor"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": true,
				"internalType": "address",
				"name": "businessAddress",
				"type": "address"
			},
			{
				"indexed": false,
				"internalType": "string",
				"name": "name",
				"type": "string"
			}
		],
		"name": "BusinessRegistered",
		"type": "event"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "_voucherId",
				"type": "uint256"
			}
		],
		"name": "claimPublicVoucher",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "string",
				"name": "_description",
				"type": "string"
			},
			{
				"internalType": "uint256",
				"name": "_value",
				"type": "uint256"
			},
			{
				"internalType": "uint256",
				"name": "_supply",
				"type": "uint256"
			}
		],
		"name": "createPublicVoucher",
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
				"internalType": "string",
				"name": "_description",
				"type": "string"
			},
			{
				"internalType": "uint256",
				"name": "_value",
				"type": "uint256"
			}
		],
		"name": "issueVoucher",
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
		"anonymous": false,
		"inputs": [
			{
				"indexed": true,
				"internalType": "uint256",
				"name": "voucherId",
				"type": "uint256"
			},
			{
				"indexed": true,
				"internalType": "address",
				"name": "business",
				"type": "address"
			},
			{
				"indexed": false,
				"internalType": "string",
				"name": "description",
				"type": "string"
			},
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "value",
				"type": "uint256"
			}
		],
		"name": "PublicVoucherCreated",
		"type": "event"
	},
	{
		"inputs": [
			{
				"internalType": "string",
				"name": "_businessName",
				"type": "string"
			}
		],
		"name": "registerBusiness",
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
		"name": "useVoucher",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": true,
				"internalType": "address",
				"name": "customer",
				"type": "address"
			},
			{
				"indexed": true,
				"internalType": "uint256",
				"name": "voucherId",
				"type": "uint256"
			}
		],
		"name": "VoucherClaimed",
		"type": "event"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": true,
				"internalType": "address",
				"name": "business",
				"type": "address"
			},
			{
				"indexed": true,
				"internalType": "address",
				"name": "customer",
				"type": "address"
			},
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "voucherId",
				"type": "uint256"
			},
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "value",
				"type": "uint256"
			}
		],
		"name": "VoucherIssued",
		"type": "event"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": true,
				"internalType": "address",
				"name": "customer",
				"type": "address"
			},
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "voucherId",
				"type": "uint256"
			}
		],
		"name": "VoucherUsed",
		"type": "event"
	},
	{
		"inputs": [],
		"name": "admin",
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
				"name": "",
				"type": "address"
			}
		],
		"name": "businessNames",
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
				"internalType": "address",
				"name": "_businessAddress",
				"type": "address"
			}
		],
		"name": "checkBusinessRegistration",
		"outputs": [
			{
				"internalType": "bool",
				"name": "",
				"type": "bool"
			},
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
				"internalType": "address",
				"name": "",
				"type": "address"
			}
		],
		"name": "customerVoucherCount",
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
			},
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"name": "customerVouchers",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "id",
				"type": "uint256"
			},
			{
				"internalType": "string",
				"name": "description",
				"type": "string"
			},
			{
				"internalType": "uint256",
				"name": "value",
				"type": "uint256"
			},
			{
				"internalType": "bool",
				"name": "used",
				"type": "bool"
			},
			{
				"internalType": "address",
				"name": "business",
				"type": "address"
			},
			{
				"internalType": "uint256",
				"name": "issueDate",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "getActivePublicVouchers",
		"outputs": [
			{
				"components": [
					{
						"internalType": "uint256",
						"name": "id",
						"type": "uint256"
					},
					{
						"internalType": "string",
						"name": "description",
						"type": "string"
					},
					{
						"internalType": "uint256",
						"name": "value",
						"type": "uint256"
					},
					{
						"internalType": "address",
						"name": "business",
						"type": "address"
					},
					{
						"internalType": "uint256",
						"name": "totalSupply",
						"type": "uint256"
					},
					{
						"internalType": "uint256",
						"name": "claimedCount",
						"type": "uint256"
					},
					{
						"internalType": "bool",
						"name": "isActive",
						"type": "bool"
					}
				],
				"internalType": "struct BusinessVoucher.PublicVoucher[]",
				"name": "",
				"type": "tuple[]"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "getBusinessCount",
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
				"name": "_customer",
				"type": "address"
			},
			{
				"internalType": "uint256",
				"name": "_voucherId",
				"type": "uint256"
			}
		],
		"name": "getVoucherDetails",
		"outputs": [
			{
				"internalType": "string",
				"name": "description",
				"type": "string"
			},
			{
				"internalType": "uint256",
				"name": "value",
				"type": "uint256"
			},
			{
				"internalType": "bool",
				"name": "used",
				"type": "bool"
			},
			{
				"internalType": "address",
				"name": "business",
				"type": "address"
			},
			{
				"internalType": "uint256",
				"name": "issueDate",
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
			},
			{
				"internalType": "address",
				"name": "",
				"type": "address"
			}
		],
		"name": "hasClaimedVoucher",
		"outputs": [
			{
				"internalType": "bool",
				"name": "",
				"type": "bool"
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
		"name": "isRegisteredBusiness",
		"outputs": [
			{
				"internalType": "bool",
				"name": "",
				"type": "bool"
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
		"name": "publicVouchers",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "id",
				"type": "uint256"
			},
			{
				"internalType": "string",
				"name": "description",
				"type": "string"
			},
			{
				"internalType": "uint256",
				"name": "value",
				"type": "uint256"
			},
			{
				"internalType": "address",
				"name": "business",
				"type": "address"
			},
			{
				"internalType": "uint256",
				"name": "totalSupply",
				"type": "uint256"
			},
			{
				"internalType": "uint256",
				"name": "claimedCount",
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
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"name": "registeredBusinesses",
		"outputs": [
			{
				"internalType": "address",
				"name": "",
				"type": "address"
			}
		],
		"stateMutability": "view",
		"type": "function"
	}
];


// Replace with your deployed contract address
const LOYALTY_TOKEN_ADDRESS = "0xf4a43f129404eadf2e12b95084ad1c690c0e18f8"; 

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
		if(web3State.web3Instance === null){
			throw new Error("Failed to create Web3 instance");
		}
		else{
			console.log("Web3 instance created successfully");
		}
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
/*
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
	*/
// Business functions
// Business functions
async function isBusinessRegistered(address) {
    if (!web3State.isInitialized) await initWeb3();
    try {
        if (!address || typeof address !== 'string' || !web3State.web3Instance.utils.isAddress(address)) {
            console.error("Invalid address provided:", address);
            return false;
        }
        
        const result = await web3State.contract.methods.checkBusinessRegistration(address).call();
        return result; // This should return a boolean directly
    } catch (error) {
        console.error("Error checking business registration:", error);
        return false;
    }
}

async function getBusinessName(address) {
    if (!web3State.isInitialized) await initWeb3();
    try {
        if (!address || typeof address !== 'string' || !web3State.web3Instance.utils.isAddress(address)) {
            console.error("Invalid address provided:", address);
            return "";
        }
        
        const businessName = await web3State.contract.methods.businessNames(address).call();
        return businessName;
    } catch (error) {
        console.error("Error getting business name:", error);
        return "";
    }
}

async function checkBusinessRegistration(address) {
    if (!web3State.isInitialized) await initWeb3();
    try {
        const result = await web3State.contract.methods.checkBusinessRegistration(address).call();
        // This returns [bool, string] according to your contract
        return {
            isRegistered: result[0],
            businessName: result[1]
        };
    } catch (error) {
        console.error("Error checking business registration:", error);
        return {
            isRegistered: false,
            businessName: ""
        };
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

async function issueVoucher(customerAddress, description, value) {
    if (!web3State.isInitialized) await initWeb3();
    try {
        const tx = await web3State.contract.methods
            .issueVoucher(customerAddress, description, value)
            .send({ from: web3State.userAccount });
        
        // Extract voucherId from the event if available
        let voucherId = null;
        if (tx.events && tx.events.VoucherIssued) {
            voucherId = tx.events.VoucherIssued.returnValues.voucherId;
        }
        
        return {
            success: true,
            voucherId: voucherId,
            transactionHash: tx.transactionHash
        };
    } catch (error) {
        console.error("Error issuing voucher:", error);
        return {
            success: false,
            error: error.message
        };
    }
}
function getCurrentAccount() {
    return web3State.userAccount;
}
async function getCustomerVouchers(customerAddress) {
    if (!web3State.isInitialized) await initWeb3();
    try {
        const voucherCount = await web3State.contract.methods
            .customerVoucherCount(customerAddress)
            .call();
        
        const vouchers = [];
        
        for (let i = 0; i < voucherCount; i++) {
            const voucher = await web3State.contract.methods
                .customerVouchers(customerAddress, i)
                .call();
            
            vouchers.push({
                id: voucher.id,
                description: voucher.description,
                value: voucher.value,
                used: voucher.used
            });
        }
        
        return vouchers;
    } catch (error) {
        console.error("Error fetching customer vouchers:", error);
        return [];
    }
}

// Get details of a specific voucher
async function getVoucherDetails(voucherId) {
    if (!web3State.isInitialized) await initWeb3();
    try {
        const voucher = await web3State.contract.methods
            .getVoucherDetails(web3State.userAccount, voucherId)
            .call();
        
        return {
            description: voucher.description,
            value: voucher.value,
            used: voucher.used
        };
    } catch (error) {
        console.error("Error fetching voucher details:", error);
        return null;
    }
}

// Redeem a voucher
async function redeemVoucher(voucherId) {
    if (!web3State.isInitialized) await initWeb3();
    try {
        const tx = await web3State.contract.methods
            .useVoucher(voucherId)
            .send({ from: web3State.userAccount });
        
        return {
            success: true,
            transactionHash: tx.transactionHash
        };
    } catch (error) {
        console.error("Error redeeming voucher:", error);
        return {
            success: false,
            error: error.message
        };
    }
}
// Add to web3.actions.js
// Add this function to handle public voucher creation
async function createPublicVoucher(description, value, supply) {
    if (!web3State.isInitialized) await initWeb3();
    try {
        const tx = await web3State.contract.methods
            .createPublicVoucher(description, value, supply)
            .send({ from: web3State.userAccount });
        
        return {
            success: true,
            transactionHash: tx.transactionHash,
            voucherId: tx.events.PublicVoucherCreated.returnValues.voucherId
        };
    } catch (error) {
        console.error("Error creating public voucher:", error);
        return {
            success: false,
            error: error.message
        };
    }
}

// Update getActivePublicVouchers to parse the response properly
async function getActivePublicVouchers() {
    if (!web3State.isInitialized) await initWeb3();
    try {
        const vouchers = await web3State.contract.methods.getActivePublicVouchers().call();
        return vouchers.map(v => ({
            id: v.id,
            description: v.description,
            value: v.value,
            business: v.business,
            totalSupply: v.totalSupply,
            claimedCount: v.claimedCount,
            isActive: v.isActive
        }));
    } catch (error) {
        console.error("Error fetching public vouchers:", error);
        return [];
    }
}

// Update claimPublicVoucher to handle the response
async function claimPublicVoucher(voucherId) {
    try {
        if (!web3State.isInitialized) {
            await initWeb3();
        }

        if (!web3State.userAccount) {
            return { success: false, error: "Wallet not connected" };
        }

        if (!web3State.contract?.methods?.claimPublicVoucher) {
            return { success: false, error: "Contract method not available" };
        }

        // Add debug logs
        console.log("Account:", web3State.userAccount);
        console.log("Contract:", web3State.contract);
        console.log("Voucher ID:", voucherId);

        const tx = await web3State.contract.methods
            .claimPublicVoucher(voucherId)
            .send({ 
                from: web3State.userAccount,
                gas: 500000,  // Increased gas limit
                gasPrice: await web3State.web3Instance.eth.getGasPrice() // Explicit gas price
            });

        return { 
            success: true, 
            transactionHash: tx.transactionHash 
        };
    } catch (error) {
        console.error("Full error in claimPublicVoucher:", error);
        
        let errorMessage = "Transaction failed. Please check your wallet and try again.";
        
        // Handle specific error cases
        if (error.code === 4001) {
            errorMessage = "Transaction rejected by user";
        } else if (error.message.includes("insufficient funds")) {
            errorMessage = "Insufficient funds for gas";
        } else if (error.message.includes("revert")) {
            // Try to extract revert reason
            const revertMatch = error.message.match(/reverted with reason string '(.+?)'/);
            errorMessage = revertMatch ? revertMatch[1] : "Transaction reverted";
        } else if (error.code === -32603) {
            errorMessage = "Blockchain node error. Please try again later.";
        }

        return { 
            success: false, 
            error: errorMessage,
            details: error.message
        };
    }
}
// Make functions available globally
window.web3Actions = {
    isMetaMaskInstalled,
    initWeb3,
    isBusinessRegistered,
    issueVoucher,
	getBusinessName,
    getCurrentAccount,
    registerBusiness,
    checkBusinessRegistration	,
	getCustomerVouchers,  // Add this
    getVoucherDetails,    // Add this
    redeemVoucher ,
	getActivePublicVouchers,
	claimPublicVoucher,
	createPublicVoucher
};