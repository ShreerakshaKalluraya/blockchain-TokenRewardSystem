// app.js - Main application logic for UI interactions

// DOM Elements
const connectWalletBtn = document.getElementById('connect-wallet');
const walletStatusEl = document.getElementById('wallet-status');
const accountInfoEl = document.getElementById('account-info');
const accountAddressEl = document.getElementById('account-address');
const networkNameEl = document.getElementById('network-name');
const tokenSectionEl = document.getElementById('token-section');
const tokenBalanceEl = document.getElementById('token-balance');
const dashboardBtn = document.getElementById('dashboard-btn');
const earnBtn = document.getElementById('earn-btn');
const transferBtn = document.getElementById('transfer-btn');

// State variables
let walletConnected = false;

// Initialize the application
function initApp() {
    // Check if we're already connected (e.g., page refresh)
    checkConnection();
    
    // Set up event listeners
    connectWalletBtn.addEventListener('click', connectWallet);
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
    
    const balance = await window.web3Actions.getTokenBalance();
    tokenBalanceEl.textContent = parseFloat(balance).toFixed(2);
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
        
        // Show token section
        tokenSectionEl.style.display = 'block';
        
        // Enable navigation buttons
        dashboardBtn.disabled = false;
        earnBtn.disabled = false;
        transferBtn.disabled = false;
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
        
        // Hide token section
        tokenSectionEl.style.display = 'none';
        
        // Disable navigation buttons
        dashboardBtn.disabled = true;
        earnBtn.disabled = true;
        transferBtn.disabled = true;
    }
}

// Initialize the app when the DOM is loaded
document.addEventListener('DOMContentLoaded', initApp);