// customer-app.js - Handles customer UI interactions

document.addEventListener('DOMContentLoaded', () => {
    // Elements
    const connectWalletBtn = document.getElementById('connect-wallet');
    const walletStatus = document.getElementById('wallet-status');
    const myVouchersSection = document.getElementById('my-vouchers');
    const refreshVouchersBtn = document.getElementById('refresh-vouchers');
    const voucherDetailsModal = document.getElementById('voucher-details-modal');

    // Connect wallet button
    connectWalletBtn.addEventListener('click', async () => {
        try {
            const result = await window.web3Actions.initWeb3();
            const account = window.web3Actions.getCurrentAccount();
            
            if (!account) {
                throw new Error("No account connected");
            }
            
            walletStatus.textContent = `Connected: ${account.substring(0, 6)}...${account.substring(38)}`;
            loadCustomerVouchers(account);
            
        } catch (err) {
            console.error("Wallet connection failed:", err);
            showNotification("Wallet connection failed: " + err.message, 'danger');
        }
    });

    // Refresh vouchers button
    if (refreshVouchersBtn) {
        refreshVouchersBtn.addEventListener('click', async () => {
            const account = window.web3Actions.getCurrentAccount();
            if (account) {
                loadCustomerVouchers(account);
            }
        });
    }

    // Load customer vouchers
    async function loadCustomerVouchers(customerAddress) {
        try {
            const vouchers = await window.web3Actions.getCustomerVouchers(customerAddress);
            
            myVouchersSection.innerHTML = '';
            
            if (vouchers.length === 0) {
                myVouchersSection.innerHTML = '<p>No vouchers found</p>';
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
            showNotification('Error loading vouchers: ' + error.message, 'danger');
        }
    }

    // Show voucher details
    async function showVoucherDetails(voucherId) {
        try {
            const details = await window.web3Actions.getVoucherDetails(voucherId);
            
            if (!details) {
                throw new Error("Voucher not found");
            }
            
            document.getElementById('voucher-desc').textContent = details.description;
            document.getElementById('voucher-value').textContent = details.value;
            document.getElementById('voucher-status').textContent = details.used ? 'Used' : 'Active';
            
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
            
            if (result.success) {
                showNotification('Voucher redeemed successfully!', 'success');
                
                // Refresh the voucher list after a short delay
                setTimeout(() => {
                    const account = window.web3Actions.getCurrentAccount();
                    if (account) {
                        loadCustomerVouchers(account);
                    }
                }, 2000);
            } else {
                throw new Error(result.error);
            }
        } catch (error) {
            console.error('Error redeeming voucher:', error);
            showNotification('Error redeeming voucher: ' + error.message, 'danger');
        }
    }

    // Helper function to show notifications
    function showNotification(message, type) {
        const notification = document.createElement('div');
        notification.className = `notification alert alert-${type}`;
        notification.textContent = message;
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.remove();
        }, 5000);
    }

    // Check if MetaMask is installed on page load
    if (!window.web3Actions?.isMetaMaskInstalled()) {
        walletStatus.textContent = 'MetaMask is not installed. Please install MetaMask to use this application.';
        if (connectWalletBtn) connectWalletBtn.disabled = true;
    }

    // Check if already connected
    if (window.ethereum && window.ethereum.selectedAddress) {
        connectWalletBtn.click();
    }
});