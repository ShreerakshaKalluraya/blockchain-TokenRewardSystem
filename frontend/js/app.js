document.addEventListener('DOMContentLoaded', async () => {
    // Connect Wallet
    document.getElementById('connectWallet').addEventListener('click', async () => {
      try {
        const address = await window.loyaltyApp.connectWallet();
        document.getElementById('walletAddress').textContent = address;
        const balance = await window.loyaltyApp.getBalance(address);
        document.getElementById('pointsBalance').textContent = balance;
      } catch (error) {
        console.error("Connection error:", error);
        alert(error.message);
      }
    });
  
    // Earn Points
    document.getElementById('earnPoints').addEventListener('click', async () => {
      try {
        const address = document.getElementById('walletAddress').textContent;
        if (!address) throw new Error("Please connect wallet first");
        
        console.log("Earning points...");
        await window.loyaltyApp.earnPoints(address, 10);
        
        console.log("Updating balance...");
        const newBalance = await window.loyaltyApp.getBalance(address);
        document.getElementById('pointsBalance').textContent = newBalance;
        
      } catch (error) {
        console.error("Earn points failed:", error);
        alert(error.message);
      }
    });
  });