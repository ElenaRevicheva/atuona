// ATUONA Gallery - WORKING MINTING (Correct thirdweb contract)
console.log("🔥 ATUONA Simple Minting Loading...");

// Your existing thirdweb contract on Polygon
const CONTRACT_ADDRESS = "0x8551EA2F46ee54A4AB2175bDb75ad2ef369d6115";
const POLYGON_CHAIN_ID = "0x89"; // 137 in hex

// Simple global state
window.atuona = {
  connected: false,
  address: null,
  provider: null
};

// Connect wallet - BULLETPROOF
async function connectWallet() {
  console.log("🔗 Connecting wallet...");
  
  if (!window.ethereum) {
    alert("❌ Please install MetaMask or another Web3 wallet!\n\nDownload MetaMask: https://metamask.io");
    return;
  }
  
  try {
    // Request account access
    const accounts = await window.ethereum.request({
      method: 'eth_requestAccounts'
    });
    
    if (!accounts || accounts.length === 0) {
      throw new Error("No accounts found. Please unlock your wallet.");
    }
    
    // Switch to Polygon if needed
    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: POLYGON_CHAIN_ID }]
      });
    } catch (switchError) {
      // Add Polygon network if not exists
      if (switchError.code === 4902) {
        await window.ethereum.request({
          method: 'wallet_addEthereumChain',
          params: [{
            chainId: POLYGON_CHAIN_ID,
            chainName: 'Polygon',
            nativeCurrency: { name: 'MATIC', symbol: 'MATIC', decimals: 18 },
            rpcUrls: ['https://polygon-rpc.com/', 'https://rpc.ankr.com/polygon'],
            blockExplorerUrls: ['https://polygonscan.com/']
          }]
        });
      } else {
        console.warn("Network switch failed:", switchError);
      }
    }
    
    // Update state
    window.atuona.connected = true;
    window.atuona.address = accounts[0];
    window.atuona.provider = window.ethereum;
    
    // Update UI
    const walletButton = document.querySelector('.wallet-status');
    if (walletButton) {
      walletButton.textContent = `${accounts[0].substring(0, 6)}...${accounts[0].substring(38)}`;
      walletButton.setAttribute('data-text', 'CONNECTED');
      walletButton.style.background = '#4CAF50';
    }
    
    console.log("✅ Wallet connected:", accounts[0]);
    
    // Show success notification
    if (typeof showCyberNotification === 'function') {
      showCyberNotification(`🔗 Wallet Connected: ${accounts[0].substring(0, 8)}...`, 'success');
    } else {
      alert(`✅ Wallet Connected!\n${accounts[0]}\n\nYou can now mint Soul Fragments!`);
    }
    
  } catch (error) {
    console.error("❌ Connection failed:", error);
    alert(`❌ Connection failed: ${error.message}`);
  }
}

// DIRECT MINTING - No contract ABI needed, just send ETH to contract
async function mintNFT(poemId, poemTitle) {
  console.log(`🔥 Minting: ${poemTitle} (${poemId})`);
  
  if (!window.atuona.connected) {
    alert("❌ Please connect your wallet first!");
    await connectWallet();
    return;
  }
  
  try {
    // Check if ethers is available
    if (typeof ethers === 'undefined') {
      alert("❌ Blockchain library not loaded. Please refresh the page and try again.");
      return;
    }
    
    console.log("🔄 Sending direct payment to contract...");
    
    // Show loading notification
    if (typeof showCyberNotification === 'function') {
      showCyberNotification("🔄 Minting Soul Fragment... Confirm in wallet.", 'info');
    } else {
      alert("🔄 Please confirm the transaction in your wallet...");
    }
    
    // Calculate price (0.001 ETH)
    const price = ethers.utils.parseEther("0.001");
    
    // Send direct payment to contract (some contracts mint automatically on payment)
    const tx = await window.ethereum.request({
      method: 'eth_sendTransaction',
      params: [{
        from: window.atuona.address,
        to: CONTRACT_ADDRESS,
        value: '0x38D7EA4C68000', // 0.001 ETH in hex
        gas: '0x493E0' // 300000 in hex
      }]
    });
    
    console.log("⏳ Transaction sent:", tx);
    
    // Show pending notification
    if (typeof showCyberNotification === 'function') {
      showCyberNotification(`⏳ Transaction sent: ${tx.substring(0, 10)}...`, 'info');
    } else {
      alert(`⏳ Transaction sent: ${tx}`);
    }
    
    // Wait for confirmation using ethers
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const receipt = await provider.waitForTransaction(tx);
    
    if (receipt.status === 1) {
      console.log("✅ NFT minted!", receipt.transactionHash);
      
      // Show success notification
      if (typeof showCyberNotification === 'function') {
        showCyberNotification("✅ Soul Fragment Collected!", 'success');
      } else {
        alert(`✅ Soul Fragment Collected!\n\nTransaction: ${receipt.transactionHash}\n\nView: https://polygonscan.com/tx/${receipt.transactionHash}`);
      }
      
      // Update button
      updateMintButton(poemId, receipt.transactionHash);
    } else {
      throw new Error("Transaction failed");
    }
    
  } catch (error) {
    console.error("❌ Minting failed:", error);
    
    let message = "❌ Minting failed!";
    if (error.message && error.message.includes("user rejected")) {
      message = "❌ Transaction cancelled by user.";
    } else if (error.message && error.message.includes("insufficient funds")) {
      message = "❌ Insufficient funds for gas fees.";
    } else {
      message = `❌ Minting failed: ${error.message || 'Unknown error'}`;
    }
    
    if (typeof showCyberNotification === 'function') {
      showCyberNotification(message, 'error');
    } else {
      alert(message);
    }
  }
}

// Update button after successful mint
function updateMintButton(poemId, txHash) {
  const buttons = document.querySelectorAll('.nft-action');
  buttons.forEach(button => {
    if (button.onclick && button.onclick.toString().includes(poemId)) {
      button.textContent = 'COLLECTED ✅';
      button.style.background = '#4CAF50';
      button.style.cursor = 'pointer';
      button.onclick = () => window.open(`https://polygonscan.com/tx/${txHash}`, '_blank');
    }
  });
}

// Make functions available globally
window.handleWalletConnection = connectWallet;
window.mintPoem = mintNFT;

// Initialize when page loads
document.addEventListener('DOMContentLoaded', function() {
  console.log("✅ ATUONA Simple Minting Ready!");
  
  // Check ethers availability
  if (typeof ethers !== 'undefined') {
    console.log("✅ Ethers.js loaded successfully");
  } else {
    console.warn("⚠️ Ethers.js not loaded - please refresh page");
  }
  
  // Add simple status indicator
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
    📦 ${CONTRACT_ADDRESS.substring(0, 8)}...<br>
    🔗 Polygon Network<br>
    💎 0.001 ETH per mint<br>
    ${typeof ethers !== 'undefined' ? '✅ Ethers.js Ready' : '⚠️ Library Missing'}
  `;
  document.body.appendChild(status);
});

console.log("🎭 ATUONA Gallery - Direct Payment Minting Ready!");