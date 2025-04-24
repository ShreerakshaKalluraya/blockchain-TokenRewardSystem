# Blockchain Loyalty Token and Reward System

A blockchain-based loyalty token and reward system that allows businesses to create and manage vouchers that customers can redeem with loyalty tokens.

## Project Structure

```
.
├── backend/             # Flask backend
│   ├── abi/            # Smart contract ABIs
│   ├── app.py          # Main Flask application
│   └── requirements.txt # Python dependencies
├── contracts/           # Solidity smart contracts
│   ├── LoyaltyToken.Sol         # ERC20-like token for loyalty points
│   ├── BusinessRegistry.sol     # Business registration and approval
│   ├── Voucher.sol              # Voucher creation and redemption
│   └── LoyaltySystemFactory.sol # Factory for deploying all contracts
└── frontend/            # React frontend
    ├── public/         # Static files
    └── src/            # React source code
```

## Getting Started

### Prerequisites

- Node.js and npm
- Python 3.7+
- Ganache or other Ethereum development blockchain
- MetaMask browser extension

### Installation

1. Clone the repository:
```
git clone <repository-url>
cd loyalty-token-system
```

2. Install backend dependencies:
```
cd backend
pip install -r requirements.txt
```

3. Install frontend dependencies:
```
cd ../frontend
npm install
```

4. Deploy smart contracts:
   - Start Ganache or your preferred Ethereum development blockchain
   - Deploy the contracts using your preferred method (Truffle, Remix, etc.)
   - Deploy the LoyaltySystemFactory contract first, then it will deploy the rest

5. Set environment variables:
   - Update `backend/.env` with the deployed contract addresses

### Running the Application

1. Start the backend:
```
cd backend
flask run
```

2. Start the frontend (in a new terminal):
```
cd frontend
npm start
```

3. Access the application at http://localhost:3000

## Usage

### Admin
- Login using the admin password displayed in the terminal when starting the Flask app
- Approve registered businesses

### Business
- Register an account
- Register your business on the blockchain
- Wait for admin approval
- Create and manage vouchers

### Customer
- Register an account
- Earn loyalty tokens (manually distributed for now)
- Redeem tokens for vouchers offered by businesses

## License

This project is licensed under the MIT License.

