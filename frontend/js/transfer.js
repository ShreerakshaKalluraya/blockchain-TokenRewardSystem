// transfer.js - Handles token transfer functionality

// DOM Elements
const connectWalletBtn = document.getElementById('connect-wallet');
const walletStatusEl = document.getElementById('wallet-status');
const accountInfoEl = document.getElementById('account-info');
const accountAddressEl = document.getElementById('account-address');
const networkNameEl = document.getElementById('network-name');
const tokenBalanceEl = document.getElementById('token-balance');
const availableBalanceEl = document.getElementById('available-balance');
const transferFormSection = document.getElementById('transfer-form-section');
const transferForm = document.getElementById('transfer-form');
const recipientAddressInput = document.getElementById('recipient-address');
const tokenAmountInput = document.getElementById('token-amount');
const transactionStatusEl = document.getElementById('transaction-status');

// State variables
let walletConnected = false;
let userBalance = 0;

// Initialize the application
function initApp() {
    // Check if we're already connected (e.g., page refresh)
    checkConnection();
    
    // Set up event listeners
    connectWalletBtn.addEventListener('click', connectWallet);
    transferForm.addEventListener('submit', handleTransfer);
}

// Check if we're already connected to MetaMask
async function checkConnection() {
    if (window.ethereum && window.ethereum.selectedAddress) {
        connectWallet();
    }
}

// Connect to MetaMask wallet
async function connectWallet() {
    if (!window.web3Actions.isMetaMaskInstalled()) {
        updateUI({
            walletConnected: false,
            error: "MetaMask is not installed. Please install MetaMask to use this application."
        });
        return;
    }
    
    const result = await window.web3Actions.initWeb3();
    
    if (result.success) {
        walletConnected = true;
        updateUI({
            walletConnected: true,
            account: result.account,
            networkName: result.networkName
        });
        
        // Update token balance
        updateTokenBalance();
    } else {
        updateUI({
            walletConnected: false,
            error: result.error
        });
    }
}

// Update token balance display
async function updateTokenBalance() {
    if (!walletConnected) return;
    
    userBalance = await window.web3Actions.getTokenBalance();
    tokenBalanceEl.textContent = parseFloat(userBalance).toFixed(2);
    availableBalanceEl.textContent = parseFloat(userBalance).toFixed(2);
}

// Handle token transfer
async function handleTransfer(event) {
    event.preventDefault();
    
    if (!walletConnected) {
        showTransactionStatus('error', 'Please connect your wallet first');
        return;
    }
    
    const recipientAddress = recipientAddressInput.value.trim();
    const amount = parseFloat(tokenAmountInput.value);
    
    // Basic validation
    if (!recipientAddress || !amount) {
        showTransactionStatus('error', 'Please fill in all fields');
        return;
    }
    
    if (amount <= 0) {
        showTransactionStatus('error', 'Amount must be greater than 0');
        return;
    }
    
    if (amount > userBalance) {
        showTransactionStatus('error', 'Insufficient balance');
        return;
    }
    
    // Show pending status
    showTransactionStatus('pending', 'Transaction is being processed...');
    
    try {
        const result = await window.web3Actions.transferTokens(recipientAddress, amount);
        
        if (result.success) {
            showTransactionStatus('success', `Transaction successful! TX Hash: ${result.transactionHash}`);
            // Clear form
            recipientAddressInput.value = '';
            tokenAmountInput.value = '';
            // Update balance
            setTimeout(updateTokenBalance, 2000); // Wait a bit for the blockchain to update
        } else {
            showTransactionStatus('error', `Transaction failed: ${result.error}`);
        }
    } catch (error) {
        showTransactionStatus('error', `Error: ${error.message}`);
    }
}

// Show transaction status message
function showTransactionStatus(type, message) {
    transactionStatusEl.style.display = 'block';
    
    if (type === 'pending') {
        transactionStatusEl.className = 'alert alert-warning mt-3';
    } else if (type === 'success') {
        transactionStatusEl.className = 'alert alert-success mt-3';
    } else if (type === 'error') {
        transactionStatusEl.className = 'alert alert-danger mt-3';
    }
    
    transactionStatusEl.textContent = message;
}

// Update UI based on connection status
function updateUI(state) {
    if (state.walletConnected) {
        // Update wallet status
        walletStatusEl.className = 'alert alert-success';
        walletStatusEl.textContent = 'Connected to MetaMask';
        
        // Show account info
        accountInfoEl.style.display = 'block';
        accountAddressEl.textContent = state.account;
        networkNameEl.textContent = state.networkName;
        
        // Update connect button
        connectWalletBtn.textContent = 'Connected';
        connectWalletBtn.disabled = true;
        
        // Show transfer form
        transferFormSection.style.display = 'block';
    } else {
        // Show error if there is one
        if (state.error) {
            walletStatusEl.className = 'alert alert-danger';
            walletStatusEl.textContent = state.error;
        } else {
            walletStatusEl.className = 'alert alert-warning';
            walletStatusEl.textContent = 'Not connected to MetaMask';
        }
        
        // Hide account info
        accountInfoEl.style.display = 'none';
        
        // Update connect button
        connectWalletBtn.textContent = 'Connect MetaMask';
        connectWalletBtn.disabled = false;
        
        // Hide transfer form
        transferFormSection.style.display = 'none';
    }
}

// Initialize the app when the DOM is loaded
document.addEventListener('DOMContentLoaded', initApp); 