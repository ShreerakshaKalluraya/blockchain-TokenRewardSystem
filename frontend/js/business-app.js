// business-app.js - Handles business dashboard UI interactions

document.addEventListener('DOMContentLoaded', () => {
    // Elements
    const connectWalletBtn = document.getElementById('connect-wallet');
    const walletStatus = document.getElementById('wallet-status');
    const businessStatus = document.getElementById('business-status');
    const businessRegistrationSection = document.getElementById('business-registration-section');
    const voucherCreationSection = document.getElementById('voucher-creation-section');
    const registerBusinessForm = document.getElementById('register-business-form');
    const createVoucherForm = document.getElementById('create-voucher-form');
    const businessVouchers = document.getElementById('business-vouchers');

    // Connect wallet button
    connectWalletBtn.addEventListener('click', async () => {
        try {
            // Ensure web3Actions is available
            if (!window.web3Actions) {
                throw new Error("Web3 functionality not loaded yet");
            }
            
            const result = await window.web3Actions.initWeb3();
            
            const account = window.web3Actions.getCurrentAccount();
            if (!account) {
                console.error("No account connected.");
                return;
            }
    
            console.log("Web3 state initialized. Connected to:", account);
            const isRegistered = await window.web3Actions.isBusinessRegistered(account);
            console.log("Business registered?", isRegistered);
            
            // Update UI based on registration status
            checkBusinessStatus(account);
    
        } catch (err) {
            console.error("Wallet connection failed:", err);
            showNotification("Wallet connection failed: " + err.message, 'danger');
        }
    });

    // Check if the connected wallet is a registered business
    async function checkBusinessStatus(accountAddress) {
        try {
            if (!accountAddress) {
                businessStatus.textContent = 'Connect wallet to verify business status';
                return;
            }

            console.log("Checking status for account:", accountAddress);
            
            const result = await window.web3Actions.checkBusinessRegistration(accountAddress);
            
            if (result.isRegistered) {
                businessStatus.classList.remove('alert-warning');
                businessStatus.classList.add('alert-success');
                businessStatus.textContent = `Registered Business: ${result.businessName}`;
                
                businessRegistrationSection.style.display = 'none';
                voucherCreationSection.style.display = 'block';
                
                loadBusinessVouchers();
            } else {
                businessStatus.classList.remove('alert-success');
                businessStatus.classList.add('alert-warning');
                businessStatus.textContent = 'Not a registered business. Please register below.';
                
                businessRegistrationSection.style.display = 'block';
                voucherCreationSection.style.display = 'none';
            }
        } catch (error) {
            console.error('Error checking business status:', error);
            showNotification('Error checking business status: ' + error.message, 'danger');
        }
    }

    // Register business form submission
    if (registerBusinessForm) {
        registerBusinessForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const businessName = document.getElementById('business-name').value;
            
            try {
                const result = await web3Actions.registerBusiness(businessName);
                
                if (result.success) {
                    showNotification('Business registered successfully!', 'success');
                    
                    // Wait for transaction confirmation
                    setTimeout(() => {
                        checkBusinessStatus();
                    }, 2000);
                } else {
                    showNotification('Failed to register business: ' + result.error, 'danger');
                }
            } catch (error) {
                console.error('Error registering business:', error);
                showNotification('Error registering business: ' + error.message, 'danger');
            }
        });
    }

    // Create voucher form submission
    if (createVoucherForm) {
        createVoucherForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            // Get form values with proper null checks
            const description = document.getElementById('voucher-description')?.value;
            const points = document.getElementById('voucher-points')?.value;
            const supply = document.getElementById('voucher-supply')?.value;
            
            // Validate inputs
            if (!description || !points || !supply) {
                showNotification('Please fill all fields', 'danger');
                return;
            }
            
            try {
                const result = await web3Actions.createPublicVoucher(
                    description, 
                    parseInt(points), 
                    parseInt(supply)
                );
                
                if (result.success) {
                    showNotification(`Public voucher created! Supply: ${supply}`, 'success');
                    createVoucherForm.reset();
                    loadBusinessVouchers();
                } else {
                    showNotification('Failed to create voucher: ' + result.error, 'danger');
                }
            } catch (error) {
                console.error('Error creating voucher:', error);
                showNotification('Error creating voucher: ' + error.message, 'danger');
            }
        });
    }

    // Load business vouchers
    async function loadBusinessVouchers() {
        try {
            const account = web3Actions.getCurrentAccount();
            if (!account) return;
            
            // Show loading state
            businessVouchers.innerHTML = `
                <div class="text-center">
                    <div class="spinner-border" role="status">
                        <span class="visually-hidden">Loading...</span>
                    </div>
                    <p>Loading your issued vouchers...</p>
                </div>
            `;
            
            // Load both individual and public vouchers
            const [issuedVouchers, publicVouchers] = await Promise.all([
                web3Actions.getCustomerVouchers(account),
                web3Actions.getActivePublicVouchers()
            ]);
            
            // Filter public vouchers created by this business
            const businessPublicVouchers = publicVouchers.filter(
                v => v.business.toLowerCase() === account.toLowerCase()
            );
            
            // Display all vouchers
            businessVouchers.innerHTML = '';
            
            if (issuedVouchers.length === 0 && businessPublicVouchers.length === 0) {
                businessVouchers.innerHTML = '<p>No vouchers found</p>';
                return;
            }
            
            // Display issued vouchers
            if (issuedVouchers.length > 0) {
                const issuedHeader = document.createElement('h5');
                issuedHeader.textContent = 'Directly Issued Vouchers';
                businessVouchers.appendChild(issuedHeader);
                
                issuedVouchers.forEach(voucher => {
                    const voucherElement = document.createElement('div');
                    voucherElement.className = 'card mb-3';
                    voucherElement.innerHTML = `
                        <div class="card-body">
                            <h5 class="card-title">Voucher #${voucher.id}</h5>
                            <p class="card-text">${voucher.description}</p>
                            <p class="card-text">Value: ${voucher.value} points</p>
                            <p class="card-text">Status: ${voucher.used ? 'Used' : 'Active'}</p>
                        </div>
                    `;
                    businessVouchers.appendChild(voucherElement);
                });
            }
            
            // Display public vouchers
            if (businessPublicVouchers.length > 0) {
                const publicHeader = document.createElement('h5');
                publicHeader.className = 'mt-4';
                publicHeader.textContent = 'Public Vouchers';
                businessVouchers.appendChild(publicHeader);
                
                businessPublicVouchers.forEach(voucher => {
                    const voucherElement = document.createElement('div');
                    voucherElement.className = 'card mb-3';
                    voucherElement.innerHTML = `
                        <div class="card-body">
                            <h5 class="card-title">Public Voucher #${voucher.id}</h5>
                            <p class="card-text">${voucher.description}</p>
                            <p class="card-text">Value: ${voucher.value} points</p>
                            <p class="card-text">Claimed: ${voucher.claimedCount}/${voucher.totalSupply}</p>
                            <p class="card-text">Status: ${voucher.isActive ? 'Active' : 'Inactive'}</p>
                        </div>
                    `;
                    businessVouchers.appendChild(voucherElement);
                });
            }
            
        } catch (error) {
            console.error('Error loading vouchers:', error);
            businessVouchers.innerHTML = `
                <div class="alert alert-danger">
                    Error loading vouchers: ${error.message}
                </div>
            `;
        }
    }

    // Helper function to show notifications
    function showNotification(message, type) {
        const notification = document.createElement('div');
        notification.className = `notification alert alert-${type}`;
        notification.textContent = message;
        document.body.appendChild(notification);
        
        // Remove notification after 5 seconds
        setTimeout(() => {
            notification.remove();
        }, 5000);
    }

    // Check if MetaMask is installed on page load
    if (!window.web3Actions?.isMetaMaskInstalled()) {
        walletStatus.textContent = 'MetaMask is not installed. Please install MetaMask to use this application.';
        connectWalletBtn.disabled = true;
    }

    // Check if already connected
    if (window.ethereum && window.ethereum.selectedAddress) {
        connectWalletBtn.click();
    }
});