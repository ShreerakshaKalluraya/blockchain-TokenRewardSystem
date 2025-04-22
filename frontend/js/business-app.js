// business-app.js - Business dashboard functionality

const appState = {
    walletConnected: false,
    userAccount: null,
    isBusiness: false
};

let elements = {};

async function initApp() {
    mapDOMElements();
    setupEventListeners();
    await checkWalletConnection();
}

function mapDOMElements() {
    elements = {
        connectWalletBtn: document.getElementById('connect-wallet'),
        walletStatus: document.getElementById('wallet-status'),
        createVoucherForm: document.getElementById('create-voucher-form'),
        businessVouchers: document.getElementById('business-vouchers'),
        businessStatus: document.getElementById('business-status'),
        voucherCreationSection: document.getElementById('voucher-creation-section'),
        businessRegistrationSection: document.getElementById('business-registration-section')
    };
}

function setupEventListeners() {
    if (elements.connectWalletBtn) {
        elements.connectWalletBtn.addEventListener('click', connectWallet);
    }
    
    if (elements.createVoucherForm) {
        elements.createVoucherForm.addEventListener('submit', handleCreateVoucher);
    }
}

async function checkBusinessStatus() {
    if (!appState.walletConnected) return;
    
    try {
        const isRegistered = await window.web3Actions.isBusinessRegistered(appState.userAccount);
        
        if (!isRegistered) {
            showBusinessRegistration();
            return { status: 'unregistered' };
        }
        
        const isApproved = await window.web3Actions.isBusinessApproved(appState.userAccount);
        
        if (!isApproved) {
            showPendingApproval();
            return { status: 'pending' };
        }
        
        appState.isBusiness = true;
        showVoucherCreation(); // Show voucher creation when business is approved
        return { status: 'approved' };
    } catch (error) {
        console.error("Business check failed:", error);
        throw error;
    }
}

function showVoucherCreation() {
    // Show voucher creation section
    if (elements.voucherCreationSection) {
        elements.voucherCreationSection.style.display = 'block';
    }
    
    // Hide registration section
    if (elements.businessRegistrationSection) {
        elements.businessRegistrationSection.style.display = 'none';
    }
    
    // Hide pending message if it exists
    const pendingDiv = document.getElementById('pending-approval-message');
    if (pendingDiv) pendingDiv.style.display = 'none';
}

function showPendingApproval() {
    // Hide voucher creation section
    if (elements.voucherCreationSection) {
        elements.voucherCreationSection.style.display = 'none';
    }
    
    // Hide registration section
    if (elements.businessRegistrationSection) {
        elements.businessRegistrationSection.style.display = 'none';
    }
    
    // Show pending approval message
    const pendingDiv = document.getElementById('pending-approval-message') || createPendingApprovalElement();
    pendingDiv.style.display = 'block';
}

function createPendingApprovalElement() {
    const div = document.createElement('div');
    div.id = 'pending-approval-message';
    div.className = 'alert alert-warning mt-3';
    div.innerHTML = `
        <h4>Your business registration is pending approval</h4>
        <p>An admin needs to approve your business before you can create vouchers.</p>
        <p>Please check back later.</p>
    `;
    document.querySelector('.container').appendChild(div);
    return div;
}

async function connectWallet() {
    try {
        if (!window.web3Actions) {
            throw new Error("Web3 actions not loaded");
        }
        
        const { account } = await window.web3Actions.initWeb3();
        appState.walletConnected = true;
        appState.userAccount = account;
        
        // Check business status without throwing errors
        const businessStatus = await checkBusinessStatus().catch(error => {
            console.error("Business check failed:", error);
            return { status: 'error', error };
        });
        
        updateUI({
            walletConnected: true,
            account: account,
            isBusiness: businessStatus.status === 'approved'
        });
        
        if (businessStatus.status === 'approved') {
            await loadBusinessVouchers();
        }
    } catch (error) {
        console.error("Wallet connection failed:", error);
        updateUI({
            walletConnected: false,
            error: error.message
        });
    }
}

async function checkWalletConnection() {
    if (typeof window.ethereum !== 'undefined' && window.ethereum.selectedAddress) {
        await connectWallet();
    }
}

async function handleCreateVoucher(e) {
    e.preventDefault();
    
    if (!appState.walletConnected) {
        alert("Please connect your wallet first");
        return;
    }
    
    if (!appState.isBusiness) {
        alert("Only approved businesses can create vouchers");
        return;
    }
    
    const title = document.getElementById('voucher-title').value;
    const description = document.getElementById('voucher-description').value;
    const points = document.getElementById('voucher-points').value;
    
    // Validate inputs
    if (!title || !description || !points) {
        showNotification('Please fill in all fields', 'error');
        return;
    }
    
    // Disable button during processing
    const submitBtn = e.target.querySelector('button[type="submit"]');
    submitBtn.disabled = true;
    submitBtn.textContent = "Creating...";
    
    try {
        const result = await window.web3Actions.createVoucher(title, description, points);
        
        if (result.success) {
            showNotification(`Voucher created successfully! ID: ${result.voucherId}`);
            await loadBusinessVouchers();
            e.target.reset();
        } else {
            throw new Error(result.error || "Failed to create voucher");
        }
    } catch (error) {
        console.error("Error creating voucher:", error);
        showNotification(`Failed to create voucher: ${error.message}`, 'error');
    } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = "Create Voucher";
    }
}

async function loadBusinessVouchers() {
    if (!elements.businessVouchers) return;
    
    try {
        elements.businessVouchers.innerHTML = '<p>Loading vouchers...</p>';
        
        const vouchers = await window.web3Actions.getBusinessVouchers(appState.userAccount);
        
        if (vouchers.length === 0) {
            elements.businessVouchers.innerHTML = '<p>No vouchers created yet.</p>';
            return;
        }
        
        elements.businessVouchers.innerHTML = '';
        
        vouchers.forEach(voucher => {
            const voucherElement = document.createElement('div');
            voucherElement.className = 'card mb-3';
            voucherElement.innerHTML = `
                <div class="card-body">
                    <h5 class="card-title">${voucher.title}</h5>
                    <p class="card-text">${voucher.description}</p>
                    <p><strong>Cost:</strong> ${voucher.pointCost} points</p>
                    <p><strong>Status:</strong> ${voucher.isActive ? 'Active' : 'Inactive'}</p>
                    <button class="btn btn-sm ${voucher.isActive ? 'btn-warning' : 'btn-success'} toggle-voucher" 
                           data-voucher-id="${voucher.id}">
                        ${voucher.isActive ? 'Deactivate' : 'Activate'}
                    </button>
                </div>
            `;
            elements.businessVouchers.appendChild(voucherElement);
        });
        
        // Add event listeners to toggle buttons
        document.querySelectorAll('.toggle-voucher').forEach(button => {
            button.addEventListener('click', handleToggleVoucher);
        });
        
        // Store vouchers in localStorage for customer dashboard access
        localStorage.setItem('availableVouchers', JSON.stringify(vouchers.filter(v => v.isActive)));
    } catch (error) {
        console.error("Error loading vouchers:", error);
        elements.businessVouchers.innerHTML = '<p class="text-danger">Error loading vouchers. Please try again.</p>';
    }
}

async function handleToggleVoucher(e) {
    const voucherId = e.target.dataset.voucherId;
    const button = e.target;
    
    button.disabled = true;
    button.textContent = "Processing...";
    
    try {
        const result = await window.web3Actions.toggleVoucherStatus(voucherId);
        
        if (result.success) {
            showNotification("Voucher status updated successfully");
            await loadBusinessVouchers();
            
            // Broadcast update to customer dashboards (simplified example)
            const vouchers = JSON.parse(localStorage.getItem('availableVouchers') || []);
            const updatedVouchers = vouchers.map(v => {
                if (v.id == voucherId) {
                    return { ...v, isActive: !v.isActive };
                }
                return v;
            });
            localStorage.setItem('availableVouchers', JSON.stringify(updatedVouchers));
        } else {
            throw new Error(result.error || "Failed to update voucher");
        }
    } catch (error) {
        console.error("Error toggling voucher:", error);
        showNotification(`Failed to update voucher: ${error.message}`, 'error');
    } finally {
        button.disabled = false;
        button.textContent = button.textContent.includes("Deactivate") ? "Activate" : "Deactivate";
    }
}
function showNotification(message, type = 'success') {
    const notification = document.createElement('div');
    notification.className = `alert alert-${type} fixed-top mx-auto mt-3`;
    notification.style.width = 'fit-content';
    notification.style.maxWidth = '90%';
    notification.textContent = message;
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.remove();
    }, 5000);
}

function updateUI(state) {
    if (!elements.walletStatus) return;
    
    // Reset all status messages
    document.querySelectorAll('#business-status-container > div').forEach(el => {
        if (el.id !== 'business-status') el.style.display = 'none';
    });
    
    if (state.walletConnected) {
        elements.walletStatus.textContent = 'Connected';
        elements.walletStatus.className = 'alert alert-success';
        
        if (elements.connectWalletBtn) {
            elements.connectWalletBtn.textContent = 'Connected';
            elements.connectWalletBtn.disabled = true;
        }
        
        if (state.isBusiness) {
            // Approved business - show voucher section
            if (elements.voucherCreationSection) {
                elements.voucherCreationSection.style.display = 'block';
            }
            if (elements.businessRegistrationSection) {
                elements.businessRegistrationSection.style.display = 'none';
            }
        } else if (state.error) {
            // Show error message
            const statusEl = elements.businessStatus;
            if (statusEl) {
                statusEl.textContent = state.error;
                statusEl.className = 'alert alert-danger';
            }
        }
    } else {
        // Not connected state
        elements.walletStatus.textContent = state.error || 'Not connected';
        elements.walletStatus.className = 'alert alert-danger';
        
        if (elements.connectWalletBtn) {
            elements.connectWalletBtn.textContent = 'Connect Wallet';
            elements.connectWalletBtn.disabled = false;
        }
    }
}

function showBusinessRegistration() {
    const registrationSection = document.getElementById('business-registration-section');
    if (registrationSection) {
        registrationSection.style.display = 'block';
        
        // Hide voucher creation section
        if (elements.voucherCreationSection) {
            elements.voucherCreationSection.style.display = 'none';
        }
        
        const registerForm = document.getElementById('register-business-form');
        if (registerForm) {
            // Remove previous event listeners to prevent duplicates
            const newForm = registerForm.cloneNode(true);
            registerForm.parentNode.replaceChild(newForm, registerForm);
            
            newForm.addEventListener('submit', async (e) => {
                e.preventDefault();
                const businessName = document.getElementById('business-name').value;
                const submitBtn = e.target.querySelector('button[type="submit"]');
                
                submitBtn.disabled = true;
                submitBtn.textContent = "Registering...";
                
                try {
                    const result = await window.web3Actions.registerBusiness(businessName);
                    if (result.success) {
                        showNotification("Business registration submitted for approval");
                        registrationSection.style.display = 'none';
                        // Check status again after some delay
                        setTimeout(checkBusinessStatus, 3000);
                    } else {
                        throw new Error(result.error || "Registration failed");
                    }
                } catch (error) {
                    showNotification(`Registration failed: ${error.message}`, 'error');
                } finally {
                    submitBtn.disabled = false;
                    submitBtn.textContent = "Register Business";
                }
            });
        }
    }
}

document.addEventListener('DOMContentLoaded', initApp);