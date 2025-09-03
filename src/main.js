// ATUONA Gallery - REAL NFT MINTING (Following thirdweb's exact guidance)
console.log("🔥 ATUONA Real NFT Minting Loading...");

import {
  createThirdwebClient,
  getContract,
} from "thirdweb";
import { claimTo, totalSupply } from "thirdweb/extensions/erc721";
import { polygon } from "thirdweb/chains";
import { createWallet } from "thirdweb/wallets";

// Initialize thirdweb client
const client = createThirdwebClient({
  clientId: "602cfa7b8c0b862d35f7cfa61c961a38",
});

// Your NFT Drop contract
const NFT_DROP_CONTRACT = "0x9cD95Ad5e6A6DAdF206545E90895A2AEF11Ee4D8";

// Global state
window.atuona = {
  connected: false,
  address: null,
  wallet: null,
  account: null,
  contract: null,
  isClaiming: false
};

// Connect wallet - thirdweb's exact pattern
async function connectWallet() {
  console.log("🔗 Connecting wallet...");
  
  if (window.atuona.connected) {
    console.log("✅ Already connected");
    return;
  }
  
  try {
    // Create thirdweb wallet
    const wallet = createWallet("io.metamask");
    const account = await wallet.connect({
      client,
      chain: polygon,
    });
    
    // Get contract
    const contract = getContract({
      client,
      address: NFT_DROP_CONTRACT,
      chain: polygon,
    });
    
    // Update state
    window.atuona.connected = true;
    window.atuona.address = account.address;
    window.atuona.wallet = wallet;
    window.atuona.account = account;
    window.atuona.contract = contract;
    
    // Update UI
    const walletButton = document.querySelector('.wallet-status');
    if (walletButton) {
      walletButton.textContent = `${account.address.substring(0, 6)}...${account.address.substring(38)}`;
      walletButton.setAttribute('data-text', 'CONNECTED');
      walletButton.style.background = '#4CAF50';
    }
    
    console.log("✅ Wallet connected:", account.address);
    
    if (typeof showCyberNotification === 'function') {
      showCyberNotification("✅ Ready for REAL NFT claiming!", 'success');
    } else {
      alert("✅ Wallet Connected!\nReady for REAL NFT claiming!");
    }
    
  } catch (error) {
    console.error("❌ Connection failed:", error);
    alert(`❌ Connection failed: ${error.message}`);
  }
}

// REAL NFT MINTING - thirdweb's exact working pattern
async function mintNFT(poemId, poemTitle) {
  if (window.atuona.isClaiming) {
    console.log("⏳ Claiming already in progress...");
    return;
  }
  
  console.log(`🔥 REAL NFT Claiming: ${poemTitle} (${poemId})`);
  
  if (!window.atuona.connected || !window.atuona.account) {
    await connectWallet();
    if (!window.atuona.connected) return;
  }
  
  window.atuona.isClaiming = true;
  
  try {
    console.log("🔄 Claiming REAL NFT from drop...");
    
    if (typeof showCyberNotification === 'function') {
      showCyberNotification("🔄 Claiming REAL NFT... Confirm in wallet!", 'info');
    } else {
      alert("🔄 Claiming REAL NFT!\nConfirm in MetaMask...");
    }
    
    // thirdweb's exact pattern - this should trigger MetaMask
    const transaction = claimTo({
      contract: window.atuona.contract,
      to: window.atuona.account.address,
      quantity: 1n,
    });
    
    console.log("🔄 Sending transaction via thirdweb wallet...");
    
    // Send via thirdweb account (this should work!)
    const result = await window.atuona.account.sendTransaction(transaction);
    
    console.log("✅ REAL NFT transaction sent:", result);
    
    if (result.transactionHash) {
      console.log("📋 Transaction hash:", result.transactionHash);
      
      // Check supply after successful mint
      setTimeout(async () => {
        try {
          const newSupply = await totalSupply({ contract: window.atuona.contract });
          console.log("📊 Updated supply after mint:", Number(newSupply));
        } catch (e) {
          console.log("Could not check supply:", e.message);
        }
      }, 3000);
      
      if (typeof showCyberNotification === 'function') {
        showCyberNotification(`✅ REAL NFT Minted! TX: ${result.transactionHash}`, 'success');
      } else {
        alert(`✅ REAL NFT Minted!\n\nTransaction: ${result.transactionHash}\n\nView: https://polygonscan.com/tx/${result.transactionHash}\n\nNFT should appear in your wallet!`);
      }
      
      updateMintButton(poemId, result.transactionHash);
    } else {
      console.log("⚠️ No transaction hash but claim completed");
      
      if (typeof showCyberNotification === 'function') {
        showCyberNotification("✅ NFT claim completed!", 'success');
      } else {
        alert("✅ NFT claim completed!\nCheck your wallet!");
      }
      
      updateMintButton(poemId, "minted");
    }
    
  } catch (error) {
    console.error("❌ REAL claiming failed:", error);
    
    let message = "❌ NFT claiming failed!";
    if (error.message && error.message.includes("user rejected")) {
      message = "❌ Transaction cancelled by user.";
    } else if (error.message && error.message.includes("insufficient funds")) {
      message = "❌ Insufficient POL for gas fees.";
    } else {
      message = `❌ NFT claiming failed: ${error.message}`;
    }
    
    if (typeof showCyberNotification === 'function') {
      showCyberNotification(message, 'error');
    } else {
      alert(message);
    }
  } finally {
    window.atuona.isClaiming = false;
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
      if (txHash && txHash !== "minted" && txHash !== "claimed") {
        button.onclick = () => window.open(`https://polygonscan.com/tx/${txHash}`, '_blank');
      }
    }
  });
}

// Make functions globally available
window.handleWalletConnection = connectWallet;
window.mintPoem = mintNFT;

// Initialize
document.addEventListener('DOMContentLoaded', function() {
  console.log("✅ ATUONA Real NFT Minting Ready!");
  
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
    💎 REAL NFT Minting<br>
    🎯 Users Get Actual NFTs
  `;
  document.body.appendChild(status);
});

console.log("🎭 ATUONA Gallery - REAL NFT Minting Ready!");