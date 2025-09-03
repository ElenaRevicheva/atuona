// ATUONA Gallery - thirdweb's Exact Vanilla JS Solution
console.log("🔥 ATUONA Simple thirdweb Loading...");

import {
  createThirdwebClient,
  getContract,
} from "thirdweb";
import { claimTo } from "thirdweb/extensions/erc721";
import { polygon } from "thirdweb/chains";

// Initialize thirdweb client
const client = createThirdwebClient({
  clientId: "602cfa7b8c0b862d35f7cfa61c961a38",
});

const contractAddress = "0x8551EA2F46ee54A4AB2175bDb75ad2ef369d6115";

// Global state
window.atuona = {
  connected: false,
  address: null
};

// Connect wallet - thirdweb's exact approach
async function connectWallet() {
  console.log("🔗 Connecting wallet...");
  
  if (!window.ethereum) {
    alert("❌ Please install MetaMask!");
    return;
  }
  
  try {
    // thirdweb's recommended wallet connection
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
    
    // Update state
    window.atuona.connected = true;
    window.atuona.address = userAddress;
    
    // Update UI
    const walletButton = document.querySelector('.wallet-status');
    if (walletButton) {
      walletButton.textContent = `${userAddress.substring(0, 6)}...${userAddress.substring(38)}`;
      walletButton.setAttribute('data-text', 'CONNECTED');
      walletButton.style.background = '#4CAF50';
    }
    
    console.log("✅ Wallet connected:", userAddress);
    
    if (typeof showCyberNotification === 'function') {
      showCyberNotification("✅ Ready for FREE minting!", 'success');
    } else {
      alert("✅ Wallet Connected!\nReady for FREE Soul Fragment collection!");
    }
    
  } catch (error) {
    console.error("❌ Connection failed:", error);
    alert(`❌ Connection failed: ${error.message}`);
  }
}

// FREE minting - thirdweb's exact pattern
async function mintNFT(poemId, poemTitle) {
  console.log(`🔥 FREE Claim Minting: ${poemTitle} (${poemId})`);
  
  if (!window.atuona.connected) {
    await connectWallet();
    return;
  }
  
  try {
    console.log("🔄 Preparing FREE claim...");
    
    if (typeof showCyberNotification === 'function') {
      showCyberNotification("🔄 Claiming Soul Fragment for FREE...", 'info');
    } else {
      alert("🔄 Claiming Soul Fragment for FREE!\nConfirm in wallet...");
    }
    
    // Get contract
    const contract = getContract({
      client,
      address: contractAddress,
      chain: polygon,
    });
    
    // thirdweb's confirmed claimTo pattern
    console.log("🔄 Calling claimTo function...");
    
    const tx = claimTo({
      contract,
      to: window.atuona.address,
      quantity: 1n,
    });
    
    console.log("🔄 Sending transaction...");
    
    await tx.send({
      account: {
        address: window.atuona.address,
        signer: window.ethereum,
      },
    });
    
    console.log("✅ Transaction completed!");
    
    console.log("✅ Soul Fragment claimed for FREE!");
    
    if (typeof showCyberNotification === 'function') {
      showCyberNotification("✅ Soul Fragment Collected for FREE!", 'success');
    } else {
      alert("✅ Soul Fragment Collected for FREE!");
    }
    
    // Update button UI
    updateMintButton(poemId, "claimed");
    
  } catch (error) {
    console.error("❌ Claim failed:", error);
    
    let message = "❌ Free claim failed!";
    if (error.message.includes("user rejected")) {
      message = "❌ Transaction cancelled by user.";
    } else if (error.message.includes("insufficient funds")) {
      message = "❌ Insufficient POL for gas fees.";
    } else {
      message = `❌ Claim failed: ${error.message}`;
    }
    
    if (typeof showCyberNotification === 'function') {
      showCyberNotification(message, 'error');
    } else {
      alert(message);
    }
  }
}

// Update button after successful mint
function updateMintButton(poemId, status) {
  const buttons = document.querySelectorAll('.nft-action');
  buttons.forEach(button => {
    if (button.onclick && button.onclick.toString().includes(poemId)) {
      button.textContent = 'COLLECTED ✅';
      button.style.background = '#4CAF50';
      button.style.cursor = 'pointer';
      if (status !== "claimed") {
        button.onclick = () => window.open(`https://polygonscan.com/tx/${status}`, '_blank');
      }
    }
  });
}

// Make functions globally available
window.handleWalletConnection = connectWallet;
window.mintPoem = mintNFT;

// Initialize
document.addEventListener('DOMContentLoaded', function() {
  console.log("✅ ATUONA Simple thirdweb Ready!");
  
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
    📦 ${contractAddress.substring(0, 8)}...<br>
    🔗 Polygon Network<br>
    💎 FREE Collection (Gas Only)<br>
    ⚡ thirdweb Claim Function
  `;
  document.body.appendChild(status);
});

console.log("🎭 ATUONA Gallery - thirdweb Claim FREE Minting Ready!");