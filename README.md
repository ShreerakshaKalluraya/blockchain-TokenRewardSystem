
1. Local Blockchain Setup (Ganache)
  --Install and Run Ganache
  
  npm install -g ganache  # Install globally
  ganache  # Run local testnet
  
  After running Ganache: you will get a bunch of keys and accounts 
  Note the RPC Server URL (usually http://localhost:8545)
  Save at least one private key from the generated accounts

2. MetaMask Configuration
  Open MetaMask → Settings → Advanced
  Enable "Show test networks"

  go back

  Click network dropdown( top left)  → "Add a custom network"
  Enter:
  Network Name: Local Ganache( anything )
  RPC URL: http://localhost:8545 (from Ganache terminal)
  Chain ID: 1337  ( terminal )
  Currency Symbol: ETH

  go back


  In MetaMask → "Import account"( top center)
  Paste a private key from Ganache
  you should see money in you account ( chill thats not real ) 

3. Smart Contract Deployment (Remix IDE)
  Go to remix.ethereum.org
  Create new file LoyaltyToken.sol and paste your contract code
  compile it 
  go to compile tab -click on advanced configuration 
  change the evm version to london

  Go to "Deploy & Run Transactions" tab
  Environment: Select "Injected Provider - MetaMask"
  Confirm MetaMask is connected to Local Ganache network
  Click "Deploy"
  Copy the deployed contract address and paste it in web3.actions.js and app.py(backend)
4. Backend Setup
    new terminal 
    cd backend

    Configure Environment
    Edit app.py:(contact address)
    
    python
    CONTRACT_ADDRESS = "0x..."  # Paste deployed address
    WEB3_PROVIDER = "http://localhost:8545"  # Ganache RPC
    Run Backend
    bash
    python app.py

    # Server starts at http://localhost:5000

5. Frontend Setup

  cd frontend
  npm install web3  # Install dependencies
  npx serve  # Starts at http://localhost:3000
  Configure Frontend
  Edit web3.actions.js:

  javascript
  const CONTRACT_ADDRESS = "0x...";  // Your deployed address
  const CONTRACT_ABI = [...];       // From Remix compile tab
  =====( you should find this at the bottom of the compile tab) 


6. Full System Flow
Ganache running (Terminal 1)

Backend running (Terminal 2)

Frontend running (Terminal 3)

MetaMask connected to Local Ganache

Access frontend at http://localhost:3000

