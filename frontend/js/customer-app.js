// customer-app.js - Handles customer UI interactions

// Make loadPublicVouchers globally accessible
window.loadPublicVouchers = async function() {
    try {
        const container = document.getElementById('public-vouchers-container');
        if (!container) {
            console.error("Element with ID 'public-vouchers-container' not found");
            return;
        }
        
        // Show loading state
        container.innerHTML = `
            <div class="col-12 text-center">
                <div class="spinner-border text-primary" role="status">
                    <span class="visually-hidden">Loading...</span>
                </div>
                <p class="mt-2">Loading public vouchers...</p>
            </div>
        `;
        
        const account = window.web3Actions.getCurrentAccount();
        if (!account) {
            container.innerHTML = `
                <div class="col-12 text-center py-4">
                    <p>Please connect your wallet to view available vouchers</p>
                </div>
            `;
            return;
        }
        
        const vouchers = await window.web3Actions.getActivePublicVouchers();
        
        container.innerHTML = '';
        
        if (!vouchers || vouchers.length === 0) {
            container.innerHTML = `
                <div class="col-12 text-center py-4">
                    <i class="fas fa-gift fa-3x text-muted mb-3"></i>
                    <p>No public vouchers available</p>
                    <p class="small text-muted">Check back later for new offers</p>
                </div>
            `;
            return;
        }
        async function loadCustomerVouchers(customerAddress) {
            try {
                if (!myVouchersSection) {
                    console.error("Element with ID 'my-vouchers' not found");
                    return;
                }
                
                // Show loading state
                myVouchersSection.innerHTML = `
                    <div class="text-center p-3">
                        <div class="spinner-border text-primary" role="status">
                            <span class="visually-hidden">Loading vouchers...</span>
                        </div>
                        <p class="mt-2">Loading your vouchers...</p>
                    </div>
                `;
                
                const vouchers = await window.web3Actions.getCustomerVouchers(customerAddress);
                
                myVouchersSection.innerHTML = '';
                
                if (!vouchers || vouchers.length === 0) {
                    myVouchersSection.innerHTML = `
                        <div class="text-center p-4">
                            <p>No vouchers found</p>
                            <small class="text-muted">Claim public vouchers below to get started</small>
                        </div>
                    `;
                    return;
                }
                
                vouchers.forEach(voucher => {
                    const voucherElement = document.createElement('div');
                    voucherElement.className = 'voucher-card';
                    voucherElement.innerHTML = `
                        <h4>Voucher #${voucher.id}</h4>
                        <p>${voucher.description}</p>
                        <p>Value: ${voucher.value} points</p>
                        <p>Status: ${voucher.used ? 'Used' : 'Active'}</p>
                        <button class="view-details" data-id="${voucher.id}">View Details</button>
                        ${!voucher.used ? `<button class="redeem" data-id="${voucher.id}">Redeem</button>` : ''}
                    `;
                    myVouchersSection.appendChild(voucherElement);
                });
                
                // Add event listeners to the buttons
                document.querySelectorAll('.view-details').forEach(button => {
                    button.addEventListener('click', async (e) => {
                        const voucherId = e.target.getAttribute('data-id');
                        showVoucherDetails(voucherId);
                    });
                });
                
                document.querySelectorAll('.redeem').forEach(button => {
                    button.addEventListener('click', async (e) => {
                        const voucherId = e.target.getAttribute('data-id');
                        redeemCustomerVoucher(voucherId);
                    });
                });
                
            } catch (error) {
                console.error('Error loading vouchers:', error);
                if (myVouchersSection) {
                    myVouchersSection.innerHTML = `
                        <div class="text-center p-3">
                            <p class="text-danger">Error loading vouchers</p>
                            <button class="btn btn-sm btn-outline-primary" id="retry-load-vouchers">
                                <i class="fas fa-sync-alt me-1"></i>Try Again
                            </button>
                        </div>
                    `;
                    
                    document.getElementById('retry-load-vouchers')?.addEventListener('click', () => {
                        loadCustomerVouchers(customerAddress);
                    });
                }
                showNotification('Error loading vouchers: ' + error.message, 'danger');
            }
        }
    
        // Filter out vouchers already claimed by this user
        const claimableVouchers = [];
        for (const voucher of vouchers) {
            // Check if contract and methods exist
            if (window.web3Actions && window.web3Actions.contract && 
                window.web3Actions.contract.methods) {
                const hasClaimed = await window.web3Actions.contract.methods
                    .hasClaimedVoucher(voucher.id, account)
                    .call();
                if (!hasClaimed) {
                    claimableVouchers.push(voucher);
                }
            } else {
                // Fallback if contract methods aren't available
                claimableVouchers.push(voucher);
            }
        }
        
        if (claimableVouchers.length === 0) {
            container.innerHTML = `
                <div class="col-12 text-center py-4">
                    <i class="fas fa-check-circle fa-3x text-success mb-3"></i>
                    <p>You've claimed all available public vouchers!</p>
                </div>
            `;
            return;
        }
        
        // Display claimable vouchers
        claimableVouchers.forEach(voucher => {
            const voucherElement = document.createElement('div');
            voucherElement.className = 'col-md-4 mb-3';
            voucherElement.innerHTML = `
                <div class="card h-100">
                    <div class="card-body d-flex flex-column">
                        <h5 class="card-title">${voucher.description}</h5>
                        <div class="mb-2">
                            <span class="badge bg-primary">
                                <i class="fas fa-coins me-1"></i>
                                ${voucher.value} points
                            </span>
                        </div>
                        <p class="small text-muted mt-auto">
                            From: ${voucher.business ? `${voucher.business.substring(0, 6)}...${voucher.business.substring(38)}` : 'Unknown'}
                        </p>
                        <p class="small text-muted">
                            Remaining: ${voucher.totalSupply - voucher.claimedCount}/${voucher.totalSupply}
                        </p>
                        <button class="btn btn-primary claim-btn mt-2" 
                            data-id="${voucher.id}"
                            data-business="${voucher.business || ''}">
                            <i class="fas fa-download me-1"></i>Claim Voucher
                        </button>
                    </div>
                </div>
            `;
            
            container.appendChild(voucherElement);
            
            // Add claim button handler
            voucherElement.querySelector('.claim-btn').addEventListener('click', async (e) => {
                const btn = e.target.closest('button'); // Ensure we get the button even if icon is clicked
                const voucherId = btn.getAttribute('data-id');
                
                // Disable button during processing
                btn.disabled = true;
                btn.innerHTML = '<span class="spinner-border spinner-border-sm" role="status"></span> Claiming...';
                
                try {
                    const result = await window.web3Actions.claimPublicVoucher(voucherId);
                    
                    if (result && result.success) {
                        showNotification('Voucher claimed successfully!', 'success');
                        
                        // Refresh both lists
                        window.loadPublicVouchers();
                        const currentAccount = window.web3Actions.getCurrentAccount();
                        if (currentAccount) {
                            loadCustomerVouchers(currentAccount);
                        }
                    } else {
                        const errorMsg = result?.error || "Claim failed";
                        showNotification(`Error: ${errorMsg}`, 'danger');
                    }
                } catch (error) {
                    console.error('Error claiming voucher:', error);
                    showNotification(`Error claiming voucher: ${error.message}`, 'danger');
                } finally {
                    btn.disabled = false;
                    btn.innerHTML = '<i class="fas fa-download me-1"></i>Claim Voucher';
                }
            });
        });
        
    } catch (error) {
        console.error('Error loading public vouchers:', error);
        const container = document.getElementById('public-vouchers-container');
        if (container) {
            container.innerHTML = `
                <div class="col-12 text-center py-4">
                    <i class="fas fa-exclamation-triangle fa-3x text-danger mb-3"></i>
                    <p>Error loading public vouchers</p>
                    <button class="btn btn-sm btn-outline-primary" onclick="window.loadPublicVouchers()">
                        <i class="fas fa-sync-alt me-1"></i>Try Again
                    </button>
                </div>
            `;
        }
        showNotification('Error loading public vouchers: ' + error.message, 'danger');
    }
};

// Helper function to show notifications - made globally accessible
window.showNotification = function(message, type) {
    const notification = document.createElement('div');
    notification.className = `notification alert alert-${type}`;
    notification.textContent = message;
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.remove();
    }, 5000);
};

document.addEventListener('DOMContentLoaded', () => {
    // Elements
    const connectWalletBtn = document.getElementById('connect-wallet');
    const walletStatus = document.getElementById('wallet-status');
    const myVouchersSection = document.getElementById('my-vouchers');
    const refreshVouchersBtn = document.getElementById('refresh-vouchers');
    const voucherDetailsModal = document.getElementById('voucher-details-modal');
    const refreshPublicVouchersBtn = document.getElementById('refresh-public-vouchers');

    // Connect wallet button
    if (connectWalletBtn) {
        connectWalletBtn.addEventListener('click', async () => {
            try {
                const result = await window.web3Actions.initWeb3();
                const account = window.web3Actions.getCurrentAccount();
                
                if (!account) {
                    throw new Error("No account connected");
                }
                
                if (walletStatus) {
                    walletStatus.textContent = `Connected: ${account.substring(0, 6)}...${account.substring(38)}`;
                }
                
                loadCustomerVouchers(account);
                window.loadPublicVouchers();
                
            } catch (err) {
                console.error("Wallet connection failed:", err);
                showNotification("Wallet connection failed: " + err.message, 'danger');
            }
        });
    }

    // Refresh vouchers button
    if (refreshVouchersBtn) {
        refreshVouchersBtn.addEventListener('click', async () => {
            const account = window.web3Actions?.getCurrentAccount();
            if (account) {
                loadCustomerVouchers(account);
            } else {
                showNotification("Please connect your wallet first", "warning");
            }
        });
    }

    // Refresh public vouchers button
    if (refreshPublicVouchersBtn) {
        refreshPublicVouchersBtn.addEventListener('click', async () => {
            window.loadPublicVouchers();
        });
    }

    // Load customer vouchers
   
    // Show voucher details
    async function showVoucherDetails(voucherId) {
        try {
            if (!voucherDetailsModal) {
                console.error("Voucher details modal element not found");
                return;
            }
            
            const details = await window.web3Actions.getVoucherDetails(voucherId);
            
            if (!details) {
                throw new Error("Voucher not found");
            }
            
            const voucherDesc = document.getElementById('voucher-desc');
            const voucherValue = document.getElementById('voucher-value');
            const voucherStatus = document.getElementById('voucher-status');
            
            if (voucherDesc) voucherDesc.textContent = details.description;
            if (voucherValue) voucherValue.textContent = details.value;
            if (voucherStatus) voucherStatus.textContent = details.used ? 'Used' : 'Active';
            
            // Show the modal
            voucherDetailsModal.style.display = 'block';
            
        } catch (error) {
            console.error('Error showing voucher details:', error);
            showNotification('Error showing voucher details: ' + error.message, 'danger');
        }
    }

    // Redeem voucher
    async function redeemCustomerVoucher(voucherId) {
        try {
            const result = await window.web3Actions.redeemVoucher(voucherId);
            
            if (result && result.success) {
                showNotification('Voucher redeemed successfully!', 'success');
                
                // Refresh the voucher list after a short delay
                setTimeout(() => {
                    const account = window.web3Actions.getCurrentAccount();
                    if (account) {
                        loadCustomerVouchers(account);
                    }
                }, 2000);
            } else {
                throw new Error((result && result.error) || "Redemption failed");
            }
        } catch (error) {
            console.error('Error redeeming voucher:', error);
            showNotification('Error redeeming voucher: ' + error.message, 'danger');
        }
    }

    // Check if MetaMask is installed on page load
    if (!window.web3Actions || !window.web3Actions.isMetaMaskInstalled()) {
        if (walletStatus) {
            walletStatus.textContent = 'MetaMask is not installed. Please install MetaMask to use this application.';
        }
        if (connectWalletBtn) connectWalletBtn.disabled = true;
    }

    // Check if already connected
    if (window.ethereum && window.ethereum.selectedAddress && connectWalletBtn) {
        connectWalletBtn.click();
    }
});