// ATUONA Gallery - NFT Drop with Automated Setup
console.log("🔥 ATUONA NFT Drop Loading...");

// Import automated setup (no IPFS upload needed)
import { setupWithDirectMetadata } from "./automated-nft-setup.js";

import {
  createThirdwebClient,
  getContract,
} from "thirdweb";
import { claimTo } from "thirdweb/extensions/erc721";
import { polygon } from "thirdweb/chains";

// Initialize thirdweb client with correct clientId
const client = createThirdwebClient({
  clientId: "602cfa7b8c0b862d35f7cfa61c961a38", // Your client ID
});

// Your NFT Drop contract address
const NFT_DROP_CONTRACT = "0x9cD95Ad5e6A6DAdF206545E90895A2AEF11Ee4D8";

// Global state with loading prevention
window.atuona = {
  connected: false,
  address: null,
  contract: null,
  isConnecting: false,
  isClaiming: false
};

// Connect wallet - Fixed to prevent multiple calls
async function connectWallet() {
  // Prevent multiple connection attempts
  if (window.atuona.isConnecting) {
    console.log("⏳ Connection already in progress...");
    return;
  }
  
  console.log("🔗 Connecting wallet...");
  window.atuona.isConnecting = true;
  
  if (!window.ethereum) {
    alert("❌ Please install MetaMask!");
    window.atuona.isConnecting = false;
    return;
  }
  
  try {
    // Single wallet connection request
    const [userAddress] = await window.ethereum.request({
      method: "eth_requestAccounts",
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
    
    // Get NFT Drop contract
    const contract = getContract({
      client,
      address: NFT_DROP_CONTRACT,
      chain: polygon,
    });
    
    // Update state
    window.atuona.connected = true;
    window.atuona.address = userAddress;
    window.atuona.contract = contract;
    window.atuona.isConnecting = false;
    
    // Update UI
    const walletButton = document.querySelector('.wallet-status');
    if (walletButton) {
      walletButton.textContent = `${userAddress.substring(0, 6)}...${userAddress.substring(38)}`;
      walletButton.setAttribute('data-text', 'CONNECTED');
      walletButton.style.background = '#4CAF50';
    }
    
    console.log("✅ Wallet connected:", userAddress);
    
    if (typeof showCyberNotification === 'function') {
      showCyberNotification("✅ Ready for FREE claiming!", 'success');
    } else {
      alert("✅ Wallet Connected!\nReady for FREE Soul Fragment claiming!");
    }
    
  } catch (error) {
    console.error("❌ Connection failed:", error);
    window.atuona.isConnecting = false;
    alert(`❌ Connection failed: ${error.message}`);
  }
}

// FREE claiming - Fixed to prevent BigInt errors and multiple calls
async function mintNFT(poemId, poemTitle) {
  // Prevent multiple claiming attempts
  if (window.atuona.isClaiming) {
    console.log("⏳ Claiming already in progress...");
    return;
  }
  
  console.log(`🔥 FREE Claiming: ${poemTitle} (${poemId})`);
  
  // Ensure wallet is connected first
  if (!window.atuona.connected || !window.atuona.contract || !window.atuona.address) {
    console.log("🔗 Wallet not connected, connecting first...");
    await connectWallet();
    if (!window.atuona.connected) {
      return; // Connection failed
    }
  }
  
  window.atuona.isClaiming = true;
  
  // Disable claim buttons during transaction
  const claimButtons = document.querySelectorAll('.nft-action');
  claimButtons.forEach(btn => {
    btn.disabled = true;
    btn.style.opacity = '0.5';
  });
  
  try {
    console.log("🔄 Claiming from NFT Drop...");
    
    if (typeof showCyberNotification === 'function') {
      showCyberNotification("🔄 Claiming Soul Fragment for FREE...", 'info');
    } else {
      alert("🔄 Claiming Soul Fragment for FREE!\nConfirm in wallet...");
    }
    
    // Simple claim transaction - no complex wallet creation
    const transaction = claimTo({
      contract: window.atuona.contract,
      to: window.atuona.address,
      quantity: 1n,
    });
    
    console.log("🔄 Transaction prepared, sending...");
    
    // Direct transaction send without complex wallet setup
    const result = await transaction;
    
    console.log("✅ Soul Fragment claimed for FREE!");
    console.log("📋 Transaction result:", result);
    
    if (typeof showCyberNotification === 'function') {
      showCyberNotification("✅ Soul Fragment Collected for FREE!", 'success');
    } else {
      alert(`✅ Soul Fragment Collected for FREE!\n\nResult: ${JSON.stringify(result)}`);
    }
    
    // Update button
    updateMintButton(poemId, result.transactionHash || "claimed");
    
  } catch (error) {
    console.error("❌ Claiming failed:", error);
    
    let message = "❌ Free claiming failed!";
    if (error.message && error.message.includes("user rejected")) {
      message = "❌ Transaction cancelled by user.";
    } else if (error.message && error.message.includes("insufficient funds")) {
      message = "❌ Insufficient POL for gas fees.";
    } else if (error.message && error.message.includes("No active claim condition")) {
      message = "❌ Claim conditions not set yet. Please complete setup first.";
    } else if (error.message && error.message.includes("Already processing")) {
      message = "⏳ Please wait for current transaction to complete.";
    } else {
      message = `❌ Claiming failed: ${error.message}`;
    }
    
    if (typeof showCyberNotification === 'function') {
      showCyberNotification(message, 'error');
    } else {
      alert(message);
    }
  } finally {
    // Re-enable claim buttons
    window.atuona.isClaiming = false;
    const claimButtons = document.querySelectorAll('.nft-action');
    claimButtons.forEach(btn => {
      btn.disabled = false;
      btn.style.opacity = '1';
    });
  }
}

// Update button after successful claim
function updateMintButton(poemId, txHash) {
  const buttons = document.querySelectorAll('.nft-action');
  buttons.forEach(button => {
    if (button.onclick && button.onclick.toString().includes(poemId)) {
      button.textContent = 'COLLECTED ✅';
      button.style.background = '#4CAF50';
      button.style.cursor = 'pointer';
      button.disabled = true; // Prevent re-claiming
      if (txHash && txHash !== "claimed") {
        button.onclick = () => window.open(`https://polygonscan.com/tx/${txHash}`, '_blank');
      }
    }
  });
}

// Make functions globally available
window.handleWalletConnection = connectWallet;
window.mintPoem = mintNFT;

// Initialize with automated setup
document.addEventListener('DOMContentLoaded', async function() {
  console.log("✅ ATUONA NFT Drop Ready!");
  
  // Run automated setup with direct metadata (no IPFS upload)
  if (!localStorage.getItem('atuona-setup-complete')) {
    console.log("🚀 Running direct metadata setup...");
    
    try {
      const setupResult = await setupWithDirectMetadata();
      if (setupResult.success) {
        localStorage.setItem('atuona-setup-complete', 'true');
        console.log("🎉 Direct setup completed!");
        
        if (typeof showCyberNotification === 'function') {
          showCyberNotification("🎉 Underground Gallery is LIVE! FREE claiming enabled!", 'success');
        } else {
          alert("🎉 Setup Complete!\nUsers can now claim poetry NFTs for FREE!");
        }
      }
    } catch (error) {
      console.log("⚠️ Setup failed, will retry:", error.message);
    }
  }
  
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
    📦 NFT Drop: ${NFT_DROP_CONTRACT.substring(0, 8)}...<br>
    🔗 Polygon Network<br>
    💎 FREE Collection (Gas Only)<br>
    🎯 Claim-Based Minting
  `;
  document.body.appendChild(status);
});

console.log("🎭 ATUONA Gallery - NFT Drop Claim Solution Ready!");