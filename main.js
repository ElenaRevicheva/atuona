// ATUONA Gallery - Simple thirdweb Vanilla JS (Following thirdweb's exact guidance)
console.log("🔥 ATUONA Simple thirdweb Loading...");

import {
  createThirdwebClient,
  getContract,
} from "thirdweb";
import { mintTo } from "thirdweb/extensions/erc721";
import { polygon } from "thirdweb/chains";
import { createWallet } from "thirdweb/wallets";

// Initialize thirdweb client
const client = createThirdwebClient({
  clientId: "602cfa7b8c0b862d35f7cfa61c961a38",
});

const contractAddress = "0x8551EA2F46ee54A4AB2175bDb75ad2ef369d6115";
let wallet;
let account;

// Connect wallet - Simple thirdweb approach
async function connectWallet() {
  console.log("🔗 Connecting wallet...");
  
  try {
    // Create wallet (auto-detect MetaMask/injected)
    wallet = createWallet("io.metamask");
    account = await wallet.connect({ client, chain: polygon });
    
    console.log("✅ Wallet connected:", account.address);
    
    // Update UI
    const walletButton = document.querySelector('.wallet-status');
    if (walletButton) {
      walletButton.textContent = `${account.address.substring(0, 6)}...${account.address.substring(38)}`;
      walletButton.setAttribute('data-text', 'CONNECTED');
      walletButton.style.background = '#4CAF50';
    }
    
    // Show success notification
    if (typeof showCyberNotification === 'function') {
      showCyberNotification("✅ Wallet Connected - Ready for FREE minting!", 'success');
    } else {
      alert(`✅ Wallet Connected!\n${account.address}\n\nReady for FREE Soul Fragment collection!`);
    }
    
  } catch (error) {
    console.error("❌ Connection failed:", error);
    
    if (typeof showCyberNotification === 'function') {
      showCyberNotification("❌ Wallet connection failed. Please try again.", 'error');
    } else {
      alert(`❌ Connection failed: ${error.message}`);
    }
  }
}

// Simple FREE minting - thirdweb's exact approach
async function mintNFT(poemId, poemTitle) {
  console.log(`🔥 Simple FREE Minting: ${poemTitle} (${poemId})`);
  
  if (!wallet || !account) {
    alert("❌ Please connect your wallet first!");
    await connectWallet();
    return;
  }
  
  try {
    console.log("🔄 Preparing simple FREE mint...");
    
    // Show loading notification
    if (typeof showCyberNotification === 'function') {
      showCyberNotification("🔄 Collecting Soul Fragment for FREE... Confirm in wallet.", 'info');
    } else {
      alert("🔄 Collecting Soul Fragment for FREE!\n\nOnly gas fees - confirm in wallet...");
    }
    
    // Get contract instance
    const contract = getContract({
      client,
      address: contractAddress,
      chain: polygon,
    });
    
    // Simple FREE mint - thirdweb's exact pattern
    const tx = await mintTo({
      contract,
      to: account.address,
      // No metadata needed - keeping it simple!
    });
    
    console.log("✅ FREE mint transaction sent:", tx.transactionHash);
    
    // Show success notification
    if (typeof showCyberNotification === 'function') {
      showCyberNotification("✅ Soul Fragment Collected for FREE!", 'success');
    } else {
      alert(`✅ Soul Fragment Collected for FREE!\n\nTransaction: ${tx.transactionHash}\n\nView: https://polygonscan.com/tx/${tx.transactionHash}`);
    }
    
    // Update button UI
    updateMintButton(poemId, tx.transactionHash);
    
  } catch (error) {
    console.error("❌ Simple minting failed:", error);
    
    let message = "❌ Free minting failed!";
    if (error.message.includes("user rejected")) {
      message = "❌ Transaction cancelled by user.";
    } else if (error.message.includes("insufficient funds")) {
      message = "❌ Insufficient POL for gas fees.";
    } else {
      message = `❌ Minting failed: ${error.message}`;
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

// Make functions globally available for HTML onclick handlers
window.handleWalletConnection = connectWallet;
window.mintPoem = mintNFT;

// Initialize when DOM loads
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
    ⚡ Simple thirdweb SDK
  `;
  document.body.appendChild(status);
});

console.log("🎭 ATUONA Gallery - Simple thirdweb FREE Minting Ready!");