import json
import os
import secrets
from flask import Flask, request, jsonify, session
from flask_cors import CORS
from web3 import Web3
import jwt
from datetime import datetime, timedelta
from functools import wraps
from werkzeug.security import generate_password_hash, check_password_hash
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

app = Flask(__name__)
CORS(app, supports_credentials=True)

# Generate a random secret key
app.secret_key = secrets.token_hex(16)
JWT_SECRET = app.secret_key
ADMIN_PASSWORD = secrets.token_hex(8)  # Generate admin password

# Connect to blockchain
w3 = Web3(Web3.HTTPProvider(os.getenv('BLOCKCHAIN_PROVIDER', 'http://127.0.0.1:7545')))  # Use env var with fallback

# Load contract ABIs
def load_abi(filename):
    with open(os.path.join('abi', filename)) as f:
        return json.load(f)

# Contract ABIs
loyalty_token_abi = load_abi('LoyaltyToken.json')
business_registry_abi = load_abi('BusinessRegistry.json')
voucher_abi = load_abi('Voucher.json')
factory_abi = load_abi('LoyaltySystemFactory.json')

# Set contract addresses (these would be set after deployment)
factory_address = os.getenv('FACTORY_ADDRESS', '')
loyalty_token_address = os.getenv('TOKEN_ADDRESS', '')
business_registry_address = os.getenv('REGISTRY_ADDRESS', '')
voucher_address = os.getenv('VOUCHER_ADDRESS', '')

print(f"Factory address from env: '{factory_address}'")
print(f"Token address from env: '{loyalty_token_address}'")
print(f"Registry address from env: '{business_registry_address}'")
print(f"Voucher address from env: '{voucher_address}'")

# Convert addresses to checksum format
if factory_address and factory_address.strip():
    try:
        factory_address = w3.toChecksumAddress(factory_address)
        print(f"Checksum factory address: {factory_address}")
    except Exception as e:
        print(f"Error converting factory address: {e}")
        
if loyalty_token_address and loyalty_token_address.strip():
    try:
        loyalty_token_address = w3.toChecksumAddress(loyalty_token_address)
        print(f"Checksum token address: {loyalty_token_address}")
    except Exception as e:
        print(f"Error converting token address: {e}")
        
if business_registry_address and business_registry_address.strip():
    try:
        business_registry_address = w3.toChecksumAddress(business_registry_address)
        print(f"Checksum registry address: {business_registry_address}")
    except Exception as e:
        print(f"Error converting registry address: {e}")
        
if voucher_address and voucher_address.strip():
    try:
        voucher_address = w3.toChecksumAddress(voucher_address)
        print(f"Checksum voucher address: {voucher_address}")
    except Exception as e:
        print(f"Error converting voucher address: {e}")

# Initialize contract objects
if factory_address and factory_address.strip():
    try:
        factory_contract = w3.eth.contract(address=factory_address, abi=factory_abi)
        print(f"Factory contract initialized: {factory_address}")
        
        # Try to get the admin address to verify the contract is working
        try:
            admin = factory_contract.functions.admin().call()
            print(f"Factory admin address: {admin}")
        except Exception as e:
            print(f"Warning: Could not get factory admin: {e}")
        
        if not loyalty_token_address or not business_registry_address or not voucher_address:
            try:
                admin, token, registry, voucher = factory_contract.functions.getSystemAddresses().call()
                loyalty_token_address = w3.toChecksumAddress(token)
                business_registry_address = w3.toChecksumAddress(registry)
                voucher_address = w3.toChecksumAddress(voucher)
                print(f"Got addresses from factory: {token}, {registry}, {voucher}")
            except Exception as e:
                print(f"Error getting addresses from factory: {e}")
    except Exception as e:
        print(f"Error initializing factory contract: {e}")
        factory_contract = None

token_contract = None
if loyalty_token_address and loyalty_token_address.strip():
    try:
        token_contract = w3.eth.contract(address=loyalty_token_address, abi=loyalty_token_abi)
        print(f"Token contract initialized: {loyalty_token_address}")
    except Exception as e:
        print(f"Error initializing token contract: {e}")

registry_contract = None
if business_registry_address and business_registry_address.strip():
    try:
        registry_contract = w3.eth.contract(address=business_registry_address, abi=business_registry_abi)
        print(f"Registry contract initialized: {business_registry_address}")
        
        # Try to get the admin address to verify the contract is working
        try:
            admin = registry_contract.functions.admin().call()
            print(f"Registry admin address: {admin}")
        except Exception as e:
            print(f"Warning: Could not get registry admin: {e}")
    except Exception as e:
        print(f"Error initializing registry contract: {e}")

voucher_contract = None
if voucher_address and voucher_address.strip():
    try:
        voucher_contract = w3.eth.contract(address=voucher_address, abi=voucher_abi)
        print(f"Voucher contract initialized: {voucher_address}")
    except Exception as e:
        print(f"Error initializing voucher contract: {e}")

# In-memory user store (replace with database in production)
users = {
    'customers': {},  # username: {password_hash, address}
    'businesses': {}  # username: {password_hash, address, name}
}

# JWT token required decorator
def token_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        token = None
        auth_header = request.headers.get('Authorization')
        
        if auth_header and auth_header.startswith('Bearer '):
            token = auth_header.split(' ')[1]
            
        if not token:
            return jsonify({'message': 'Token is missing'}), 401
            
        try:
            data = jwt.decode(token, JWT_SECRET, algorithms=["HS256"])
            # Convert address to checksum format
            address = data['address']
            if address:
                address = w3.toChecksumAddress(address)
                
            current_user = {
                'username': data['username'],
                'role': data['role'],
                'address': address
            }
        except:
            return jsonify({'message': 'Token is invalid'}), 401
            
        return f(current_user, *args, **kwargs)
    
    return decorated

# User registration and authentication
@app.route('/api/register/customer', methods=['POST'])
def register_customer():
    data = request.json
    username = data.get('username')
    password = data.get('password')
    address = data.get('address')
    
    if not username or not password or not address:
        return jsonify({'message': 'Missing required fields'}), 400
        
    if username in users['customers']:
        return jsonify({'message': 'Username already exists'}), 409
        
    # Convert address to checksum format
    address = w3.toChecksumAddress(address)
        
    users['customers'][username] = {
        'password_hash': generate_password_hash(password),
        'address': address
    }
    
    return jsonify({'message': 'Customer registered successfully'}), 201

@app.route('/api/register/business', methods=['POST'])
def register_business():
    data = request.json
    username = data.get('username')
    password = data.get('password')
    address = data.get('address')
    name = data.get('name')
    
    if not username or not password or not address or not name:
        return jsonify({'message': 'Missing required fields'}), 400
        
    if username in users['businesses']:
        return jsonify({'message': 'Username already exists'}), 409
        
    # Convert address to checksum format
    address = w3.toChecksumAddress(address)
        
    users['businesses'][username] = {
        'password_hash': generate_password_hash(password),
        'address': address,
        'name': name
    }
    
    return jsonify({'message': 'Business registered successfully'}), 201

@app.route('/api/login', methods=['POST'])
def login():
    data = request.json
    username = data.get('username')
    password = data.get('password')
    role = data.get('role')  # 'customer', 'business', or 'admin'
    
    if role == 'admin':
        if password != ADMIN_PASSWORD:
            return jsonify({'message': 'Invalid credentials'}), 401
        
        admin_address = w3.eth.accounts[0] if w3.eth.accounts else None
        if admin_address:
            admin_address = w3.toChecksumAddress(admin_address)
            
        token = jwt.encode({
            'username': 'admin',
            'role': 'admin',
            'address': admin_address,
            'exp': datetime.utcnow() + timedelta(hours=24)
        }, JWT_SECRET)
        
        return jsonify({'token': token, 'role': 'admin'})
        
    elif role == 'customer':
        user_dict = users['customers']
    elif role == 'business':
        user_dict = users['businesses']
    else:
        return jsonify({'message': 'Invalid role specified'}), 400
        
    if username not in user_dict:
        return jsonify({'message': 'Invalid credentials'}), 401
        
    user = user_dict[username]
    
    if not check_password_hash(user['password_hash'], password):
        return jsonify({'message': 'Invalid credentials'}), 401
        
    # Convert address to checksum format
    address = user['address']
    if address:
        address = w3.toChecksumAddress(address)
        
    token = jwt.encode({
        'username': username,
        'role': role,
        'address': address,
        'exp': datetime.utcnow() + timedelta(hours=24)
    }, JWT_SECRET)
    
    return jsonify({'token': token, 'role': role, 'address': address})

# Admin routes
@app.route('/api/admin/password', methods=['GET'])
def get_admin_password():
    return jsonify({'admin_password': ADMIN_PASSWORD})

@app.route('/api/admin/businesses', methods=['GET'])
@token_required
def get_businesses(current_user):
    if current_user['role'] != 'admin':
        return jsonify({'message': 'Unauthorized'}), 403
        
    businesses = []
    for username, data in users['businesses'].items():
        businesses.append({
            'username': username,
            'address': data['address'],
            'name': data['name']
        })
    
    return jsonify(businesses)

@app.route('/api/admin/approve-business', methods=['POST'])
@token_required
def approve_business(current_user):
    if current_user['role'] != 'admin':
        return jsonify({'message': 'Unauthorized'}), 403
        
    data = request.json
    business_address = data.get('address')
    
    # Call the smart contract to approve the business
    try:
        tx_hash = registry_contract.functions.approveBusiness(business_address).transact({
            'from': current_user['address']
        })
        receipt = w3.eth.wait_for_transaction_receipt(tx_hash)
        return jsonify({'message': 'Business approved successfully', 'tx_hash': tx_hash.hex()})
    except Exception as e:
        return jsonify({'message': f'Error approving business: {str(e)}'}), 500

# Admin route to register a business directly
@app.route('/api/admin/register-business', methods=['POST'])
@token_required
def admin_register_business(current_user):
    if current_user['role'] != 'admin':
        return jsonify({'message': 'Unauthorized'}), 403
        
    data = request.json
    business_address = data.get('address')
    business_name = data.get('name')
    
    if not business_address or not business_name:
        return jsonify({'message': 'Missing required fields (address, name)'}), 400
    
    try:
        print(f"Admin attempting to register business at address: {business_address}")
        print(f"Business name: {business_name}")
        
        # Convert to checksum address
        try:
            business_address = w3.toChecksumAddress(business_address)
        except Exception as e:
            return jsonify({'message': f'Invalid address: {str(e)}'}), 400
        
        # Check if business is already registered
        try:
            is_registered = registry_contract.functions.isBusinessRegistered(business_address).call()
            if is_registered:
                return jsonify({'message': 'Business is already registered'}), 400
        except Exception as e:
            print(f"Error checking if business is registered: {e}")
        
        # Register the business
        tx_hash = registry_contract.functions.registerBusinessByAdmin(business_address, business_name).transact({
            'from': current_user['address'],
            'gas': 1000000
        })
        
        print(f"Transaction sent with hash: {tx_hash.hex()}")
        
        receipt = w3.eth.wait_for_transaction_receipt(tx_hash)
        
        if receipt.status == 1:
            return jsonify({
                'message': 'Business registered successfully',
                'tx_hash': tx_hash.hex()
            })
        else:
            return jsonify({'message': 'Transaction reverted'}), 500
            
    except Exception as e:
        print(f"Error in admin_register_business: {str(e)}")
        import traceback
        traceback.print_exc()
        return jsonify({'message': f'Error registering business: {str(e)}'}), 500

# Business routes
@app.route('/api/business/register-on-chain', methods=['POST'])
@token_required
def register_business_on_chain(current_user):
    if current_user['role'] != 'business':
        return jsonify({'message': 'Unauthorized'}), 403
        
    data = request.json
    name = data.get('name')
    
    try:
        print(f"Attempting to register business with name: {name}")
        print(f"Using address: {current_user['address']}")
        print(f"Registry contract address: {business_registry_address}")
        
        if not registry_contract:
            print("Registry contract is not initialized")
            return jsonify({'message': 'Registry contract not initialized'}), 500
        
        # Check if this is the admin address trying to register as a business
        try:
            admin_address = registry_contract.functions.admin().call()
            print(f"Admin address from contract: {admin_address}")
            
            if current_user['address'].lower() == admin_address.lower():
                return jsonify({'message': 'Admin accounts cannot register as businesses. Please use a different address.'}), 400
        except Exception as e:
            print(f"Error checking admin address: {e}")
        
        # Check if user address is a valid address
        try:
            balance = w3.eth.get_balance(current_user['address'])
            print(f"Address is valid, balance: {balance}")
            
            if balance == 0:
                return jsonify({'message': 'Account has no ETH balance to pay for gas'}), 400
                
        except Exception as e:
            print(f"Error checking address: {e}")
            return jsonify({'message': f'Invalid address: {str(e)}'}), 400
            
        # Check if the user address is configured in MetaMask/Ganache
        if current_user['address'] not in w3.eth.accounts:
            print(f"Warning: Address {current_user['address']} not found in local accounts")
            print(f"Available accounts: {w3.eth.accounts}")
            
        # Check if the business is already registered
        try:
            is_registered = registry_contract.functions.isBusinessRegistered(current_user['address']).call()
            if is_registered:
                print(f"Business is already registered: {current_user['address']}")
                return jsonify({'message': 'Business is already registered'}), 400
        except Exception as e:
            print(f"Error checking if business is registered: {e}")
        
        print(f"Sending transaction to register business from {current_user['address']} with name '{name}'")
        
        # Try with a higher gas limit
        try:
            tx_hash = registry_contract.functions.registerBusiness(name).transact({
                'from': current_user['address'],
                'gas': 1000000  # Set a higher gas limit
            })
            
            print(f"Transaction sent with hash: {tx_hash.hex()}")
            
            receipt = w3.eth.wait_for_transaction_receipt(tx_hash)
            
            print(f"Transaction receipt status: {receipt.status}")
            
            if receipt.status == 0:
                print(f"Transaction failed: The smart contract execution reverted")
                return jsonify({'message': 'Error registering business: Transaction reverted. Please use a different address that is not the admin.'}), 500
                
            print(f"Transaction successful: {receipt}")
            return jsonify({'message': 'Business registered on chain successfully', 'tx_hash': tx_hash.hex()})
            
        except ValueError as e:
            error_str = str(e)
            print(f"Transaction error: {error_str}")
            
            if "execution reverted" in error_str:
                if "OnlyAdmin" in error_str:
                    return jsonify({'message': 'Error: Only admin can perform this action'}), 403
                elif "AlreadyRegistered" in error_str:
                    return jsonify({'message': 'Error: Business is already registered'}), 400
                else:
                    return jsonify({'message': f'Contract error: {error_str}'}), 500
            else:
                return jsonify({'message': f'Error: {error_str}'}), 500
                
    except Exception as e:
        print(f"Detailed error in register_business_on_chain: {str(e)}")
        import traceback
        traceback.print_exc()
        return jsonify({'message': f'Error registering business: {str(e)}'}), 500

@app.route('/api/business/create-voucher', methods=['POST'])
@token_required
def create_voucher(current_user):
    if current_user['role'] != 'business':
        return jsonify({'message': 'Unauthorized'}), 403
        
    data = request.json
    title = data.get('title')
    description = data.get('description')
    point_cost = int(data.get('pointCost'))
    
    # Check if business is approved
    try:
        is_approved = registry_contract.functions.isBusinessApproved(current_user['address']).call()
        
        if not is_approved:
            return jsonify({'message': 'Business not approved yet'}), 403
            
        tx_hash = voucher_contract.functions.createVoucher(title, description, point_cost).transact({
            'from': current_user['address']
        })
        receipt = w3.eth.wait_for_transaction_receipt(tx_hash)
        
        # Get the voucher ID from the event logs
        voucher_id = None
        for log in voucher_contract.events.VoucherCreated().process_receipt(receipt):
            voucher_id = log['args']['id']
        
        return jsonify({
            'message': 'Voucher created successfully', 
            'tx_hash': tx_hash.hex(),
            'voucher_id': voucher_id
        })
    except Exception as e:
        return jsonify({'message': f'Error creating voucher: {str(e)}'}), 500

@app.route('/api/business/vouchers', methods=['GET'])
@token_required
def get_business_vouchers(current_user):
    if current_user['role'] != 'business':
        return jsonify({'message': 'Unauthorized'}), 403
        
    try:
        voucher_ids = voucher_contract.functions.getBusinessVouchers(current_user['address']).call()
        
        vouchers = []
        for voucher_id in voucher_ids:
            details = voucher_contract.functions.getVoucherDetails(voucher_id).call()
            vouchers.append({
                'id': voucher_id,
                'title': details[0],
                'description': details[1],
                'pointCost': details[2],
                'businessAddress': details[3],
                'isActive': details[4]
            })
        
        return jsonify(vouchers)
    except Exception as e:
        return jsonify({'message': f'Error getting vouchers: {str(e)}'}), 500

@app.route('/api/business/toggle-voucher/<int:voucher_id>', methods=['POST'])
@token_required
def toggle_voucher(current_user, voucher_id):
    if current_user['role'] != 'business':
        return jsonify({'message': 'Unauthorized'}), 403
        
    try:
        tx_hash = voucher_contract.functions.toggleVoucherStatus(voucher_id).transact({
            'from': current_user['address']
        })
        receipt = w3.eth.wait_for_transaction_receipt(tx_hash)
        return jsonify({'message': 'Voucher status toggled successfully', 'tx_hash': tx_hash.hex()})
    except Exception as e:
        return jsonify({'message': f'Error toggling voucher status: {str(e)}'}), 500

@app.route('/api/business/mark-redeemed/<int:redemption_id>', methods=['POST'])
@token_required
def mark_as_redeemed(current_user, redemption_id):
    if current_user['role'] != 'business':
        return jsonify({'message': 'Unauthorized'}), 403
        
    try:
        tx_hash = voucher_contract.functions.markAsRedeemed(redemption_id).transact({
            'from': current_user['address']
        })
        receipt = w3.eth.wait_for_transaction_receipt(tx_hash)
        return jsonify({'message': 'Redemption marked as fulfilled', 'tx_hash': tx_hash.hex()})
    except Exception as e:
        return jsonify({'message': f'Error marking redemption: {str(e)}'}), 500

# Customer routes
@app.route('/api/customer/balance', methods=['GET'])
@token_required
def get_balance(current_user):
    if current_user['role'] != 'customer':
        return jsonify({'message': 'Unauthorized'}), 403
        
    try:
        balance = token_contract.functions.balanceOf(current_user['address']).call()
        return jsonify({'balance': balance})
    except Exception as e:
        return jsonify({'message': f'Error getting balance: {str(e)}'}), 500

@app.route('/api/customer/available-vouchers', methods=['GET'])
def get_available_vouchers():
    # We don't need authentication for viewing available vouchers
    try:
        if not voucher_contract:
            print("Voucher contract is not initialized")
            return jsonify({'message': 'Voucher contract not initialized'}), 500
            
        available_vouchers = []
        
        # This is simplified - in a real app we'd query for all businesses and their vouchers
        # For demo purposes, we just check the first few voucher IDs
        for i in range(1, 100):  # Arbitrary limit
            try:
                details = voucher_contract.functions.getVoucherDetails(i).call()
                if details[4]:  # isActive
                    available_vouchers.append({
                        'id': i,
                        'title': details[0],
                        'description': details[1],
                        'pointCost': details[2],
                        'businessAddress': details[3],
                        'isActive': details[4]
                    })
            except ValueError as e:
                error_str = str(e)
                if "Voucher does not exist" in error_str:
                    # This is expected - we've reached the end of vouchers
                    break
                else:
                    print(f"Error getting voucher {i}: {e}")
            except Exception as e:
                # Assume we've reached the end of vouchers
                print(f"Error getting voucher {i}: {e}")
                break
                
        return jsonify(available_vouchers)
    except Exception as e:
        print(f"Error getting vouchers: {e}")
        import traceback
        traceback.print_exc()
        return jsonify({'message': f'Error getting vouchers: {str(e)}'}), 500

@app.route('/api/customer/redeem-voucher/<int:voucher_id>', methods=['POST'])
@token_required
def redeem_voucher(current_user, voucher_id):
    if current_user['role'] != 'customer':
        return jsonify({'message': 'Unauthorized'}), 403
        
    try:
        # Check balance first
        details = voucher_contract.functions.getVoucherDetails(voucher_id).call()
        balance = token_contract.functions.balanceOf(current_user['address']).call()
        
        if balance < details[2]:  # pointCost
            return jsonify({'message': 'Insufficient token balance'}), 400
            
        # Approve token transfer first (not implemented in our simple token)
        # In a real ERC20, you'd need token_contract.functions.approve(voucher_address, details[2]).transact
        
        # Redeem the voucher
        tx_hash = voucher_contract.functions.redeemVoucher(voucher_id).transact({
            'from': current_user['address']
        })
        receipt = w3.eth.wait_for_transaction_receipt(tx_hash)
        
        # Get the redemption ID from the event logs
        redemption_id = None
        for log in voucher_contract.events.VoucherRedeemed().process_receipt(receipt):
            redemption_id = log['args']['redemptionId']
        
        return jsonify({
            'message': 'Voucher redeemed successfully', 
            'tx_hash': tx_hash.hex(),
            'redemption_id': redemption_id
        })
    except Exception as e:
        return jsonify({'message': f'Error redeeming voucher: {str(e)}'}), 500

@app.route('/api/customer/redemptions', methods=['GET'])
@token_required
def get_customer_redemptions(current_user):
    if current_user['role'] != 'customer':
        return jsonify({'message': 'Unauthorized'}), 403
        
    try:
        redemption_ids = voucher_contract.functions.getCustomerRedemptions(current_user['address']).call()
        
        redemptions = []
        for redemption_id in redemption_ids:
            details = voucher_contract.functions.getRedemptionDetails(redemption_id).call()
            voucher_details = voucher_contract.functions.getVoucherDetails(details[0]).call()
            
            redemptions.append({
                'id': redemption_id,
                'voucherId': details[0],
                'voucherTitle': voucher_details[0],
                'voucherDescription': voucher_details[1],
                'pointCost': voucher_details[2],
                'businessAddress': voucher_details[3],
                'redemptionTime': details[2],
                'isRedeemed': details[3]
            })
        
        return jsonify(redemptions)
    except Exception as e:
        return jsonify({'message': f'Error getting redemptions: {str(e)}'}), 500

# Common routes
@app.route('/api/voucher/<int:voucher_id>', methods=['GET'])
def get_voucher_details(voucher_id):
    try:
        print(f"Getting details for voucher ID: {voucher_id}")
        print(f"Voucher contract address: {voucher_address}")
        
        if not voucher_contract:
            print("Voucher contract is not initialized")
            return jsonify({'message': 'Voucher contract not initialized'}), 500
        
        try:
            details = voucher_contract.functions.getVoucherDetails(voucher_id).call()
            print(f"Successfully got voucher details: {details}")
            
            return jsonify({
                'id': voucher_id,
                'title': details[0],
                'description': details[1],
                'pointCost': details[2],
                'businessAddress': details[3],
                'isActive': details[4]
            })
        except ValueError as e:
            error_str = str(e)
            if "Voucher does not exist" in error_str:
                return jsonify({'message': 'Voucher does not exist'}), 404
            else:
                raise
            
    except Exception as e:
        print(f"Detailed error in get_voucher_details: {str(e)}")
        import traceback
        traceback.print_exc()
        return jsonify({'message': f'Error getting voucher details: {str(e)}'}), 500

# API endpoint to check contract status
@app.route('/api/contract-status', methods=['GET'])
def contract_status():
    status = {
        'blockchain_connected': w3.isConnected(),
        'factory_contract': {
            'address': factory_address if factory_address else None,
            'initialized': factory_contract is not None
        },
        'token_contract': {
            'address': loyalty_token_address if loyalty_token_address else None,
            'initialized': token_contract is not None
        },
        'registry_contract': {
            'address': business_registry_address if business_registry_address else None,
            'initialized': registry_contract is not None
        },
        'voucher_contract': {
            'address': voucher_address if voucher_address else None,
            'initialized': voucher_contract is not None
        }
    }
    
    return jsonify(status)

if __name__ == '__main__':
    print(f"Admin password: {ADMIN_PASSWORD}")
    app.run(debug=True, port=5000) 