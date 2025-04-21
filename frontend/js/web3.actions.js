// web3.actions.js - Handles all Web3 and smart contract interactions

// Contract ABI - You'll need to replace this with your actual contract ABI
// This is just an example structure based on standard ERC20 token functions
const loyaltyTokenABI = [
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "recipient",
				"type": "address"
			},
			{
				"internalType": "uint256",
				"name": "amount",
				"type": "uint256"
			}
		],
		"name": "earnPoints",
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
			},
			{
				"internalType": "bool",
				"name": "isMinter",
				"type": "bool"
			}
		],
		"name": "setMinter",
		"outputs": [],
		"stateMutability": "nonpayable",
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
				"name": "amount",
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
		"inputs": [],
		"stateMutability": "nonpayable",
		"type": "constructor"
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
				"name": "",
				"type": "address"
			}
		],
		"name": "minters",
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
	}
];

// Web3 and Contract variables
let web3;
let loyaltyTokenContract;
let userAccount;
let networkId;
let networkName;

// Loyalty Token Contract Address - Replace with your deployed contract address
const LOYALTY_TOKEN_ADDRESS = '0x5f30567bfaf0d9035079463d0d63c7ab350d4513'; // Replace with your actual contract address

// Network names mapping
const NETWORK_NAMES = {
    1: 'Ethereum Mainnet',
    3: 'Ropsten Testnet',
    4: 'Rinkeby Testnet',
    5: 'Goerli Testnet',
    42: 'Kovan Testnet',
    1337: 'Local Ganache',
    5777: 'Ganache',
    80001: 'Polygon Mumbai',
    137: 'Polygon Mainnet'
};

// Check if MetaMask is installed
function isMetaMaskInstalled() {
    return typeof window.ethereum !== 'undefined';
}

// Initialize Web3
async function initWeb3() {
    if (isMetaMaskInstalled()) {
        try {
            // Request account access
            const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
            userAccount = accounts[0];
            
            // Create Web3 instance
            web3 = new Web3(window.ethereum);
            
            // Get network ID
            networkId = await web3.eth.net.getId();
            networkName = NETWORK_NAMES[networkId] || `Chain ID: ${networkId}`;
            
            // Initialize the contract
            loyaltyTokenContract = new web3.eth.Contract(
                loyaltyTokenABI,
                LOYALTY_TOKEN_ADDRESS
            );
            
            // Setup event listeners for account and network changes
            setupEventListeners();
            
            return {
                success: true,
                account: userAccount,
                networkName: networkName
            };
        } catch (error) {
            console.error("Error initializing Web3:", error);
            return {
                success: false,
                error: error.message
            };
        }
    } else {
        console.error("MetaMask is not installed");
        return {
            success: false,
            error: "MetaMask is not installed. Please install MetaMask to use this application."
        };
    }
}

// Setup MetaMask event listeners
function setupEventListeners() {
    // Handle account changes
    window.ethereum.on('accountsChanged', (accounts) => {
        if (accounts.length === 0) {
            // User has disconnected their account
            userAccount = null;
            updateUI({ walletConnected: false });
        } else {
            userAccount = accounts[0];
            updateTokenBalance();
            updateUI({ 
                walletConnected: true,
                account: userAccount
            });
        }
    });

    // Handle network changes
    window.ethereum.on('chainChanged', (chainId) => {
        // Reload the page on network change as recommended by MetaMask
        window.location.reload();
    });
}

// Get token balance for current user
async function getTokenBalance(address = null) {
    if (!web3 || !loyaltyTokenContract) return 0;
    
    const targetAddress = address || userAccount;
    try {
        const balance = await loyaltyTokenContract.methods.balanceOf(targetAddress).call();
        return web3.utils.fromWei(balance, 'ether');
    } catch (error) {
        console.error("Error getting token balance:", error);
        return 0;
    }
}

// Transfer tokens to another address
async function transferTokens(toAddress, amount) {
    if (!web3 || !loyaltyTokenContract || !userAccount) {
        throw new Error("Web3 or contract not initialized");
    }
    
    try {
        const amountWei = web3.utils.toWei(amount.toString(), 'ether');
        const gasEstimate = await loyaltyTokenContract.methods.transfer(toAddress, amountWei).estimateGas({ from: userAccount });
        
        const result = await loyaltyTokenContract.methods.transfer(toAddress, amountWei).send({
            from: userAccount,
            gas: Math.round(gasEstimate * 1.1) // Add 10% buffer to gas estimate
        });
        
        return {
            success: true,
            transactionHash: result.transactionHash
        };
    } catch (error) {
        console.error("Error transferring tokens:", error);
        return {
            success: false,
            error: error.message
        };
    }
}

// Earn tokens (this would typically be called by a business account)
// Note: This is a placeholder. The actual implementation depends on your contract design
async function earnTokens(customerAddress, amount) {
    if (!web3 || !loyaltyTokenContract || !userAccount) {
        throw new Error("Web3 or contract not initialized");
    }
    
    try {
        // This depends on your contract's implementation - might be mint, issueRewards, etc.
        // Assuming there's a method called 'issueRewards' in your contract
        const amountWei = web3.utils.toWei(amount.toString(), 'ether');
        const gasEstimate = await loyaltyTokenContract.methods.issueRewards(customerAddress, amountWei).estimateGas({ from: userAccount });
        
        const result = await loyaltyTokenContract.methods.issueRewards(customerAddress, amountWei).send({
            from: userAccount,
            gas: Math.round(gasEstimate * 1.1)
        });
        
        return {
            success: true,
            transactionHash: result.transactionHash
        };
    } catch (error) {
        console.error("Error issuing rewards:", error);
        return {
            success: false,
            error: error.message
        };
    }
}

// Export functions to be used in other files
window.web3Actions = {
    isMetaMaskInstalled,
    initWeb3,
    getTokenBalance,
    transferTokens,
    earnTokens
};