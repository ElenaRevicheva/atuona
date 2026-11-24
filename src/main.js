// ATUONA Gallery - Simple NFT Claiming (Backend Setup Complete)
console.log("🔥 ATUONA Simple NFT Claiming Loading...");

import {
  createThirdwebClient,
  getContract,
  sendTransaction,
} from "thirdweb";
import { claimTo } from "thirdweb/extensions/erc721";
import { createWallet } from "thirdweb/wallets";
import { polygon } from "thirdweb/chains";

// Initialize client with validation
const CLIENT_ID = import.meta.env.VITE_THIRDWEB_CLIENT_ID || "602cfa7b8c0b862d35f7cfa61c961a38";

if (!CLIENT_ID) {
  throw new Error("Thirdweb Client ID is not set! Please set VITE_THIRDWEB_CLIENT_ID environment variable.");
}

const client = createThirdwebClient({
  clientId: CLIENT_ID,
});

// Contract address with validation
const NFT_DROP_ADDRESS = import.meta.env.VITE_CONTRACT_ADDRESS || "0x9cD95Ad5e6A6DAdF206545E90895A2AEF11Ee4D8";

// Validate contract address before using it
if (!NFT_DROP_ADDRESS || NFT_DROP_ADDRESS === "undefined") {
  throw new Error("NFT Drop contract address is not set! Please set VITE_CONTRACT_ADDRESS environment variable.");
}

// Log contract details for debugging
console.log("🔗 Contract Address:", NFT_DROP_ADDRESS);
console.log("🌐 Chain:", polygon.name);

// Get contract (NFT Drop with 45 lazy-minted NFTs)
const contract = getContract({
  client,
  address: NFT_DROP_ADDRESS,
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
    console.log(`🔥 Summoning soul fragment inspired by: ${poemTitle} (${poemId})`);
    
    // Prepare the claim transaction
    console.log("🔄 Preparing mystical transaction...");
    console.log(`🎭 The blockchain will choose which moment finds you...`);
    const preparedTransaction = claimTo({
      contract,
      to: currentAccount.address,
      quantity: 1n,
    });
    
    console.log("🚀 Sending transaction to blockchain...");
    
    // Actually send the transaction to the blockchain
    const result = await sendTransaction({
      transaction: preparedTransaction,
      account: currentAccount,
    });
    
    console.log("✅ Transaction sent!", result);
    console.log("🔍 Transaction hash:", result.transactionHash);
    
    if (result && result.transactionHash) {
      console.log("✅ NFT claimed successfully!", result.transactionHash);
      alert(`Soul Fragment Claimed!\n\n"The moment has chosen you."\n\nA piece of the underground has been immortalized in your wallet.\nThe blockchain has decided which verse was meant for you.\n\nTransaction: ${result.transactionHash}\n\nCheck your wallet to discover your destined poem.\n\nPolygonscan: https://polygonscan.com/tx/${result.transactionHash}`);
    } else {
      console.log("❌ No transaction hash received");
      alert("Transaction was sent but no hash received. Please check your wallet.");
    }
    
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
  console.log(`
    ╔══════════════════════════════════════════════════════════════╗
    ║  🔮 SILVER LINES UNDERGROUND NFT GALLERY INITIALIZED 🔮     ║
    ║                                                              ║
    ║  » Blockchain: Ready                                         ║
    ║  » Soul Fragments: Loading...                                ║
    ║  » Digital Poetry: Active                                    ║
    ║  » Underground Mode: ENGAGED                                 ║
    ║                                                              ║
    ║  Press 1-3 to navigate, ESC to close notifications          ║
    ╚══════════════════════════════════════════════════════════════╝
            `);
  console.log("✅ ATUONA Simple NFT Claiming Ready!");
  console.log("🎭 Backend setup completed - 45 NFTs ready for claiming!");
  console.log("📋 Contract:", NFT_DROP_ADDRESS);
  console.log("🔗 Network: Polygon");
  console.log("💎 FREE claiming (only gas fees)!");
});

console.log("🎭 ATUONA Gallery - Simple NFT Claiming Ready!");