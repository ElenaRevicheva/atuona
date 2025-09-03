// ATUONA Gallery - Simple NFT Claiming (Backend Setup Complete)
console.log("🔥 ATUONA Simple NFT Claiming Loading...");

import {
  createThirdwebClient,
  getContract,
} from "thirdweb";
import { claimTo } from "thirdweb/extensions/erc721";
import { createWallet } from "thirdweb/wallets";
import { polygon } from "thirdweb/chains";

// Initialize client
const client = createThirdwebClient({
  clientId: "602cfa7b8c0b862d35f7cfa61c961a38",
});

// Get contract (NFT Drop with 45 lazy-minted NFTs)
const contract = getContract({
  client,
  address: "0x9cD95Ad5e6A6DAdF206545E90895A2AEF11Ee4D8",
  chain: polygon,
});

// Wallet state
let currentWallet = null;
let currentAccount = null;

// Connect wallet function
async function connectWallet() {
  try {
    console.log("🔗 Connecting wallet...");
    
    // Create MetaMask wallet
    currentWallet = createWallet("io.metamask");
    currentAccount = await currentWallet.connect({ client, chain: polygon });
    
    console.log("✅ Wallet connected:", currentAccount.address);
    
    // Update UI
    const walletButton = document.querySelector('.wallet-status');
    if (walletButton) {
      walletButton.textContent = 'CONNECTED';
      walletButton.style.color = '#00ff88';
    }
    
    return true;
  } catch (error) {
    console.error("❌ Wallet connection failed:", error);
    alert("Please install MetaMask or use a Web3 browser");
    return false;
  }
}

// Claim poem NFT function
async function claimPoem(poemId, poemTitle) {
  if (!currentAccount) {
    alert("Please connect wallet first!");
    await connectWallet();
    return;
  }
  
  try {
    console.log(`🔥 Claiming NFT: ${poemTitle} (${poemId})`);
    
    // Use claimTo function for NFT Drop - simplified approach
    const result = await claimTo({
      contract,
      to: currentAccount.address,
      quantity: 1n,
      account: currentAccount, // Pass account directly to claimTo
    });
    
    console.log("✅ NFT claimed successfully!", result.transactionHash);
    alert(`🎭 Soul Fragment claimed!\n\nTransaction: ${result.transactionHash}\n\nCheck your wallet and Polygonscan!`);
    
  } catch (error) {
    console.error("❌ Claim failed:", error);
    alert(`Claiming failed: ${error.message}`);
  }
}

// Make functions globally available
window.handleWalletConnection = connectWallet;
window.claimPoem = claimPoem;

// Initialize
document.addEventListener('DOMContentLoaded', function() {
  console.log("✅ ATUONA Simple NFT Claiming Ready!");
  console.log("🎭 Backend setup completed - 45 NFTs ready for claiming!");
  console.log("📋 Contract: 0x9cD95Ad5e6A6DAdF206545E90895A2AEF11Ee4D8");
  console.log("🔗 Network: Polygon");
  console.log("💎 FREE claiming (only gas fees)!");
});

console.log("🎭 ATUONA Gallery - Simple NFT Claiming Ready!");