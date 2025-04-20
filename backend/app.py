from flask import Flask, jsonify, request
from flask_cors import CORS
from web3 import Web3
import json
import os

app = Flask(__name__)
CORS(app)

# Connect to LOCAL Ganache testnet (change to your port if different)
web3 = Web3(Web3.HTTPProvider('http://localhost:8545')) 

# Load contract ABI
with open('./abi/LoyaltyTokenABI.json') as f:
    abi = json.load(f)

# Contract address (must be checksummed for local testnet)
contract_address = Web3.to_checksum_address('0x203a9760709b8781a380f60035bbf3b57d3a36a7')
contract = web3.eth.contract(address=contract_address, abi=abi)

# Set default account (use one of your Ganache accounts)
web3.eth.defaultAccount = web3.eth.accounts[0] 

@app.route('/mint', methods=['POST'])
def mint_tokens():
    try:
        data = request.json
        recipient = Web3.to_checksum_address(data['address'])
        amount = int(data['amount'])
        
        # Build and send transaction
        tx_hash = contract.functions.mint(recipient, amount).transact({
            'from': web3.eth.defaultAccount,
            'gas': 200000  # Set appropriate gas limit
        })
        
        # Get transaction receipt
        tx_receipt = web3.eth.wait_for_transaction_receipt(tx_hash)
        
        return jsonify({
            "status": "success",
            "tx_hash": tx_hash.hex(),
            "block_number": tx_receipt['blockNumber']
        })
    
    except Exception as e:
        return jsonify({"error": str(e)}), 400

@app.route('/balance/<address>', methods=['GET'])
def get_balance(address):
    try:
        address = Web3.to_checksum_address(address)
        balance = contract.functions.balanceOf(address).call()
        return jsonify({"balance": str(balance)})
    except Exception as e:
        return jsonify({"error": str(e)}), 400

@app.route('/total_supply', methods=['GET'])
def total_supply():
    try:
        supply = contract.functions.totalSupply().call()
        return jsonify({"total_supply": str(supply)})
    except Exception as e:
        return jsonify({"error": str(e)}), 400

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)