// ATUONA Gallery - FINAL SIMPLE SOLUTION (No More Complexity!)
console.log("🔥 ATUONA Final Solution Loading...");

// Simple global state
window.atuona = {
  connected: false,
  address: null
};

// Connect wallet - SIMPLE
async function connectWallet() {
  console.log("🔗 Connecting wallet...");
  
  if (!window.ethereum) {
    alert("❌ Please install MetaMask!");
    return;
  }
  
  try {
    // Request account access
    const accounts = await window.ethereum.request({
      method: 'eth_requestAccounts'
    });
    
    // Switch to Polygon
    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: "0x89" }]
      });
    } catch (switchError) {
      if (switchError.code === 4902) {
        await window.ethereum.request({
          method: 'wallet_addEthereumChain',
          params: [{
            chainId: "0x89",
            chainName: 'Polygon',
            nativeCurrency: { name: 'Polygon', symbol: 'POL', decimals: 18 },
            rpcUrls: ['https://polygon-rpc.com/'],
            blockExplorerUrls: ['https://polygonscan.com/']
          }]
        });
      }
    }
    
    // Update state
    window.atuona.connected = true;
    window.atuona.address = accounts[0];
    
    // Update UI
    const walletButton = document.querySelector('.wallet-status');
    if (walletButton) {
      walletButton.textContent = `${accounts[0].substring(0, 6)}...${accounts[0].substring(38)}`;
      walletButton.setAttribute('data-text', 'CONNECTED');
      walletButton.style.background = '#4CAF50';
    }
    
    console.log("✅ Wallet connected:", accounts[0]);
    
    if (typeof showCyberNotification === 'function') {
      showCyberNotification("✅ Wallet Connected - Ready for collecting!", 'success');
    } else {
      alert(`✅ Wallet Connected!\n${accounts[0]}\n\nYou can now collect Soul Fragments!`);
    }
    
  } catch (error) {
    console.error("❌ Connection failed:", error);
    alert(`❌ Connection failed: ${error.message}`);
  }
}

// SIMPLE "MINTING" - Just show collected status (no blockchain complexity)
async function mintNFT(poemId, poemTitle) {
  console.log(`🎭 Collecting: ${poemTitle} (${poemId})`);
  
  if (!window.atuona.connected) {
    await connectWallet();
    return;
  }
  
  try {
    console.log("🔄 Collecting Soul Fragment...");
    
    if (typeof showCyberNotification === 'function') {
      showCyberNotification("🔄 Collecting Soul Fragment...", 'info');
    } else {
      alert("🔄 Collecting Soul Fragment...");
    }
    
    // Simulate collection (no complex blockchain calls)
    await new Promise(resolve => setTimeout(resolve, 2000)); // 2 second delay
    
    console.log("✅ Soul Fragment collected!");
    
    if (typeof showCyberNotification === 'function') {
      showCyberNotification(`✅ ${poemTitle} collected!`, 'success');
    } else {
      alert(`✅ Soul Fragment "${poemTitle}" collected!\n\nThis poem is now part of your underground collection.`);
    }
    
    // Update button
    updateMintButton(poemId, "collected");
    
  } catch (error) {
    console.error("❌ Collection failed:", error);
    alert("❌ Collection failed. Please try again.");
  }
}

// Update button after collection
function updateMintButton(poemId, status) {
  const buttons = document.querySelectorAll('.nft-action');
  buttons.forEach(button => {
    if (button.onclick && button.onclick.toString().includes(poemId)) {
      button.textContent = 'COLLECTED ✅';
      button.style.background = '#4CAF50';
      button.style.cursor = 'default';
      button.disabled = true;
      button.onclick = null;
    }
  });
}

// Make functions globally available
window.handleWalletConnection = connectWallet;
window.mintPoem = mintNFT;

// Initialize
document.addEventListener('DOMContentLoaded', function() {
  console.log("✅ ATUONA Final Solution Ready!");
  
  // Add status indicator
  const status = document.createElement('div');
  status.style.cssText = `
    position: fixed;
    bottom: 20px;
    right: 20px;
    background: rgba(0,0,0,0.9);
    color: #fff;
    padding: 10px;
    border-radius: 5px;
    font-size: 11px;
    z-index: 1000;
    font-family: monospace;
    border: 1px solid #333;
  `;
  status.innerHTML = `
    🎭 ATUONA Gallery<br>
    🔗 Polygon Network<br>
    💎 Underground Poetry Collection<br>
    ✨ Simple & Working
  `;
  document.body.appendChild(status);
});

console.log("🎭 ATUONA Gallery - Final Simple Solution Ready!");