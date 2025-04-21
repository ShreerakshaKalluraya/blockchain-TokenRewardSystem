document.addEventListener('DOMContentLoaded', async () => {
    // Initialize Web3
    const initialized = await window.loyaltyApp.initWeb3();
    if (!initialized) {
      alert("Please install and unlock MetaMask!");
      return;
    }
  
    // Generate QR Code for user's address
    const accounts = await web3.eth.getAccounts();
    new QRCode(document.getElementById("qrcode"), {
      text: accounts[0],
      width: 200,
      height: 200
    });
  
    // Issue Points Functionality
    document.getElementById('issuePoints').addEventListener('click', async () => {
      const customerAddress = document.getElementById('customerAddress').value;
      const points = document.getElementById('pointsAmount').value;
  
      if (!web3.utils.isAddress(customerAddress)) {
        alert("Invalid wallet address");
        return;
      }
  
      try {
        const accounts = await web3.eth.getAccounts();
        await contract.methods.mint(customerAddress, points)
          .send({ from: accounts[0] });
        alert(`Successfully issued ${points} points!`);
      } catch (error) {
        console.error("Error issuing points:", error);
        alert("Failed to issue points: " + error.message);
      }
    });
  });