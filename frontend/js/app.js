// app.js - Main application logic for loyalty system

const appState = {
  walletConnected: false,
  userAccount: null,
  tokenBalance: 0,
  sessionTime: 0,
  isTracking: false,
  sessionInterval: null
};

let elements = {};

// Initialize the application
function initApp() {
  mapDOMElements();
  setupEventListeners();
  checkWalletConnection();
  startSessionTracking();
}

// Map DOM elements safely
function mapDOMElements() {
  elements = {
      connectWalletBtn: document.getElementById('connect-wallet'),
      walletStatus: document.getElementById('wallet-status'),
      accountAddress: document.getElementById('account-address'),
      tokenBalance: document.getElementById('token-balance'),
      sessionTime: document.getElementById('session-time'),
      voucherList: document.getElementById('voucher-list'),
      redemptionHistory: document.getElementById('redemption-history')
  };
}

// Set up event listeners safely
function setupEventListeners() {
  if (elements.connectWalletBtn) {
      elements.connectWalletBtn.addEventListener('click', connectWallet);
  }
  
  // Use event delegation for voucher buttons
  document.addEventListener('click', async (e) => {
      if (e.target.classList.contains('redeem-voucher-btn')) {
          const voucherId = e.target.dataset.voucherId;
          try {
              await handleVoucherRedeem(voucherId);
          } catch (error) {
              alert('Redemption failed: ' + error.message);
          }
      }
  });
}

// Connect wallet
async function connectWallet() {
  try {
      if (!window.web3Actions) {
          throw new Error("Web3 actions not loaded");
      }
      
      const { account, networkName } = await window.web3Actions.initWeb3();
      appState.walletConnected = true;
      appState.userAccount = account;
      
      updateUI({
          walletConnected: true,
          account: account,
          networkName: networkName
      });
      
      await updateTokenBalance();
      await loadVouchers();
  } catch (error) {
      console.error("Wallet connection failed:", error);
      updateUI({
          walletConnected: false,
          error: error.message
      });
  }
}

// Check wallet connection
async function checkWalletConnection() {
  if (typeof window.ethereum !== 'undefined' && window.ethereum.selectedAddress) {
      await connectWallet();
  }
}

// Update token balance
async function updateTokenBalance() {
  if (!appState.walletConnected) return;
  try {
      const balance = await window.web3Actions.getTokenBalance();
      appState.tokenBalance = balance;
      if (elements.tokenBalance) {
          elements.tokenBalance.textContent = parseFloat(balance).toFixed(2);
      }
  } catch (error) {
      console.error("Error updating token balance:", error);
  }
}

// Start session tracking
function startSessionTracking() {
  if (appState.isTracking) return;
  
  appState.isTracking = true;
  appState.sessionInterval = setInterval(async () => {
      appState.sessionTime++;
      updateSessionTimeDisplay();
      
      // Every 5 minutes, record activity
      if (appState.sessionTime % 300 === 0) {
          try {
              await window.web3Actions.recordActivity();
              await updateTokenBalance();
              showNotification("You earned 10 points for your time on the platform!");
          } catch (error) {
              console.error("Error recording activity:", error);
          }
      }
  }, 1000);
}

// Update session time display
function updateSessionTimeDisplay() {
  if (!elements.sessionTime) return;
  const minutes = Math.floor(appState.sessionTime / 60);
  const seconds = appState.sessionTime % 60;
  elements.sessionTime.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
}

// Handle voucher redemption
async function handleVoucherRedeem(voucherId) {
  if (!appState.walletConnected) {
      showNotification("Please connect your wallet first", "error");
      throw new Error("Please connect your wallet first");
  }
  
  try {
      // First check if voucher exists and is active
      const voucher = await window.web3Actions.getVoucherDetails(voucherId);
      
      if (!voucher) {
          showNotification("Voucher not found", "error");
          throw new Error("Voucher not found");
      }
      
      if (!voucher.isActive) {
          // Remove the voucher from the UI immediately
          document.querySelector(`.redeem-voucher-btn[data-voucher-id="${voucherId}"]`)
              ?.closest('.voucher-item')
              ?.remove();
          
          // Update localStorage
          const localVouchers = JSON.parse(localStorage.getItem('availableVouchers') || '[]');
          const updatedVouchers = localVouchers.filter(v => v.id !== voucherId);
          localStorage.setItem('availableVouchers', JSON.stringify(updatedVouchers));
          
          showNotification("This voucher is no longer available", "warning");
          throw new Error("This voucher is no longer available");
      }
      
      // Check user's balance
      const balance = await window.web3Actions.getTokenBalance();
      if (parseFloat(balance) < parseFloat(voucher.pointCost)) {
          showNotification("You don't have enough points for this voucher", "error");
          throw new Error("Insufficient points");
      }
      
      const confirmRedeem = confirm(`Redeem "${voucher.title}" for ${voucher.pointCost} points?`);
      if (!confirmRedeem) return;
      
      const txHash = await window.web3Actions.redeemVoucher(voucherId);
      console.log("Transaction hash:", txHash);
      
      showNotification(`Successfully redeemed "${voucher.title}"!`);
      await updateTokenBalance();
      addRedemptionToHistory(voucher);
      
      // Reload vouchers to update the list
      await loadVouchers();
      
  } catch (error) {
      console.error("Error redeeming voucher:", error);
      // Only show alert for unexpected errors
      if (!error.message.includes("no longer available") && 
          !error.message.includes("Insufficient points")) {
          showNotification(`Redemption failed: ${error.message}`, "error");
      }
      throw error;
  }
}

// Add redemption to history
function addRedemptionToHistory(voucher) {
  if (!elements.redemptionHistory) return;
  
  const redemptionElement = document.createElement('div');
  redemptionElement.className = 'redemption-item';
  redemptionElement.innerHTML = `
      <p><strong>${voucher.title}</strong> - ${voucher.pointCost} points</p>
      <p>${new Date().toLocaleString()}</p>
      <hr>
  `;
  elements.redemptionHistory.prepend(redemptionElement);
  
  // Store redemption in local storage for persistence
  const history = JSON.parse(localStorage.getItem('redemptionHistory') || '[]');
  history.unshift({
      title: voucher.title,
      pointCost: voucher.pointCost,
      date: new Date().toISOString()
  });
  localStorage.setItem('redemptionHistory', JSON.stringify(history));
}

// Load available vouchers
async function loadVouchers() {
  if (!elements.voucherList) return;
  
  try {
      elements.voucherList.innerHTML = '<p>Loading vouchers...</p>';
      
      // First try to get vouchers from the blockchain
      let vouchers = await window.web3Actions.getActiveVouchers();
      
      // Filter out inactive vouchers
      vouchers = vouchers.filter(v => v.isActive);
      
      // If no active vouchers found on blockchain, try localStorage as fallback
      if (vouchers.length === 0) {
          const localVouchers = JSON.parse(localStorage.getItem('availableVouchers') || '[]');
          if (localVouchers.length > 0) {
              vouchers = localVouchers;
              console.log("Using locally stored vouchers:", vouchers);
          }
      }
      
      if (vouchers.length === 0) {
          elements.voucherList.innerHTML = '<p>No vouchers available. Check back later!</p>';
          return;
      }
      
      elements.voucherList.innerHTML = '';
      
      vouchers.forEach(voucher => {
          const voucherElement = document.createElement('div');
          voucherElement.className = 'voucher-item card mb-3';
          voucherElement.innerHTML = `
              <div class="card-body">
                  <h4 class="card-title">${voucher.title}</h4>
                  <p class="card-text">${voucher.description}</p>
                  <p><strong>Cost:</strong> ${voucher.pointCost} points</p>
                  <button class="btn btn-primary redeem-voucher-btn" 
                          data-voucher-id="${voucher.id}">
                      Redeem
                  </button>
              </div>
          `;
          elements.voucherList.appendChild(voucherElement);
      });
      
      // Store active vouchers in localStorage for offline access
      localStorage.setItem('availableVouchers', JSON.stringify(vouchers));
  } catch (error) {
      console.error("Error loading vouchers:", error);
      elements.voucherList.innerHTML = '<p class="text-danger">Error loading vouchers. Please try again.</p>';
  }
}

// Load redemption history from localStorage
function loadRedemptionHistory() {
  if (!elements.redemptionHistory) return;
  
  const history = JSON.parse(localStorage.getItem('redemptionHistory') || '[]');
  
  if (history.length === 0) {
      elements.redemptionHistory.innerHTML = '<p>No redemptions yet.</p>';
      return;
  }
  
  elements.redemptionHistory.innerHTML = '';
  
  history.forEach(item => {
      const redemptionElement = document.createElement('div');
      redemptionElement.className = 'redemption-item';
      redemptionElement.innerHTML = `
          <p><strong>${item.title}</strong> - ${item.pointCost} points</p>
          <p>${new Date(item.date).toLocaleString()}</p>
          <hr>
      `;
      elements.redemptionHistory.appendChild(redemptionElement);
  });
}

// Show notification
function showNotification(message) {
  const notification = document.createElement('div');
  notification.className = 'notification alert alert-success position-fixed top-0 start-50 translate-middle-x mt-3';
  notification.style.zIndex = '1050';
  notification.textContent = message;
  document.body.appendChild(notification);
  
  // Remove after 3 seconds
  setTimeout(() => {
      notification.remove();
  }, 3000);
}

// Update UI based on connection status
function updateUI(state) {
  if (!elements.walletStatus) return;
  
  if (state.walletConnected) {
      elements.walletStatus.textContent = 'Connected';
      elements.walletStatus.className = 'alert alert-success';
      if (elements.accountAddress) {
          elements.accountAddress.textContent = state.account;
      }
      if (elements.connectWalletBtn) {
          elements.connectWalletBtn.textContent = 'Connected';
          elements.connectWalletBtn.disabled = true;
      }
  } else {
      elements.walletStatus.textContent = state.error || 'Not connected';
      elements.walletStatus.className = 'alert alert-danger';
      if (elements.connectWalletBtn) {
          elements.connectWalletBtn.textContent = 'Connect Wallet';
          elements.connectWalletBtn.disabled = false;
      }
  }
  
  // Load redemption history when UI updates
  loadRedemptionHistory();
}

// Initialize the app when the DOM is loaded
document.addEventListener('DOMContentLoaded', initApp);

// Make functions available globally
window.connectWallet = connectWallet;
window.updateUI = updateUI;