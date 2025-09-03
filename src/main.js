// ATUONA Gallery - NFT Drop Claim Implementation
console.log("🔥 ATUONA NFT Drop Loading...");

import {
  createThirdwebClient,
  getContract,
} from "thirdweb";
import { claimTo } from "thirdweb/extensions/erc721";
import { polygon } from "thirdweb/chains";
import { createWallet } from "thirdweb/wallets";

// Initialize thirdweb client
const client = createThirdwebClient({
  clientId: "602cfa7b8c0b862d35f7cfa61c961a38",
});

// Your NEW NFT Drop contract address
const NFT_DROP_CONTRACT = "0x9cD95Ad5e6A6DAdF206545E90895A2AEF11Ee4D8"; // NFT Drop on Polygon

// Global state
window.atuona = {
  connected: false,
  address: null,
  contract: null
};

// Connect wallet
async function connectWallet() {
  console.log("🔗 Connecting wallet...");
  
  if (!window.ethereum) {
    alert("❌ Please install MetaMask!");
    return;
  }
  
  try {
    // Connect to MetaMask
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
    alert(`❌ Connection failed: ${error.message}`);
  }
}

// FREE claiming from NFT Drop
async function mintNFT(poemId, poemTitle) {
  console.log(`🔥 FREE Claiming: ${poemTitle} (${poemId})`);
  
  if (!window.atuona.connected || !window.atuona.contract) {
    await connectWallet();
    return;
  }
  
  try {
    console.log("🔄 Claiming from NFT Drop...");
    
    if (typeof showCyberNotification === 'function') {
      showCyberNotification("🔄 Claiming Soul Fragment for FREE...", 'info');
    } else {
      alert("🔄 Claiming Soul Fragment for FREE!\nConfirm in wallet...");
    }
    
    // Claim from NFT Drop - thirdweb's exact pattern
    console.log("🔄 Preparing claim transaction...");
    
    const transaction = claimTo({
      contract: window.atuona.contract,
      to: window.atuona.address,
      quantity: 1n,
    });
    
    console.log("🔄 Sending claim transaction...");
    
    // Send transaction using wallet
    const walletClient = createWallet("io.metamask");
    const account = await walletClient.connect({ client, chain: polygon });
    
    const result = await account.sendTransaction(transaction);
    
    console.log("✅ Soul Fragment claimed for FREE!", result);
    
    if (typeof showCyberNotification === 'function') {
      showCyberNotification("✅ Soul Fragment Collected for FREE!", 'success');
    } else {
      alert(`✅ Soul Fragment Collected for FREE!\n\nTransaction: ${result.transactionHash || result}`);
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
      message = "❌ Claim conditions not set yet. Please wait for setup to complete.";
    } else {
      message = `❌ Claiming failed: ${error.message}`;
    }
    
    if (typeof showCyberNotification === 'function') {
      showCyberNotification(message, 'error');
    } else {
      alert(message);
    }
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
      if (txHash && txHash !== "claimed") {
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
  console.log("✅ ATUONA NFT Drop Ready!");
  
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
    📦 NFT Drop Contract<br>
    🔗 Polygon Network<br>
    💎 FREE Collection (Gas Only)<br>
    🎯 Claim-Based Minting
  `;
  document.body.appendChild(status);
  
  // Show setup message if contract not set
  if (NFT_DROP_CONTRACT === "YOUR_NEW_NFT_DROP_CONTRACT_ADDRESS") {
    const setupNotice = document.createElement('div');
    setupNotice.style.cssText = `
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      background: rgba(255, 0, 0, 0.9);
      color: white;
      padding: 20px;
      border-radius: 10px;
      z-index: 10000;
      font-family: monospace;
      text-align: center;
      max-width: 400px;
    `;
    setupNotice.innerHTML = `
      🚧 NFT DROP SETUP IN PROGRESS 🚧<br><br>
      Deploy your NFT Drop contract and<br>
      update the contract address in main.js<br><br>
      <button onclick="this.parentNode.remove()" style="background: #4CAF50; color: white; border: none; padding: 10px; border-radius: 5px; cursor: pointer;">OK</button>
    `;
    document.body.appendChild(setupNotice);
  }
});

console.log("🎭 ATUONA Gallery - NFT Drop Claim Solution Ready!");