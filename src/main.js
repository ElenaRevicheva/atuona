// ATUONA Gallery - thirdweb's EXACT Solution with ABI
console.log("🔥 ATUONA thirdweb ABI Loading...");

import {
  createThirdwebClient,
  getContract,
} from "thirdweb";
import { polygon } from "thirdweb/chains";
import contractABI from "./contract-abi.json";

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

// Connect wallet
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

// FREE minting with ABI - thirdweb's exact solution
async function mintNFT(poemId, poemTitle) {
  console.log(`🔥 FREE ABI Minting: ${poemTitle} (${poemId})`);
  
  if (!window.atuona.connected) {
    await connectWallet();
    return;
  }
  
  try {
    console.log("🔄 Creating contract with ABI...");
    console.log("📋 ABI loaded:", Array.isArray(contractABI) ? "✅ Valid array" : "❌ Not array");
    
    // Check if mintTo function exists in ABI
    const mintToFunction = contractABI.find(item => item.name === "mintTo" && item.type === "function");
    console.log("🔍 mintTo function in ABI:", !!mintToFunction);
    if (mintToFunction) {
      console.log("📋 mintTo function details:", mintToFunction);
    }
    
    if (typeof showCyberNotification === 'function') {
      showCyberNotification("🔄 Minting Soul Fragment for FREE...", 'info');
    } else {
      alert("🔄 Minting Soul Fragment for FREE!\nConfirm in wallet...");
    }
    
    // Get contract with ABI - thirdweb's exact pattern
    const contract = getContract({
      client,
      address: contractAddress,
      chain: polygon,
      abi: contractABI, // <-- ABI provided as JSON!
    });
    
    console.log("✅ Contract created with ABI");
    console.log("🔍 contract.write available:", !!contract.write);
    console.log("🔍 contract.write.mintTo available:", !!contract.write?.mintTo);
    
    // Create metadata URI
    const metadata = {
      name: `${poemTitle} ${poemId}`,
      description: `ATUONA Gallery of Moments - ${poemTitle}. Underground poetry preserved on blockchain.`,
      image: `https://atuona.xyz/poem-${poemId.replace('#', '')}.png`,
      attributes: [
        { trait_type: "Poem", value: poemTitle },
        { trait_type: "ID", value: poemId },
        { trait_type: "Collection", value: "GALLERY OF MOMENTS" }
      ]
    };
    
    // Use HTTPS metadata URL instead of data URI
    const metadataUri = `https://atuona.xyz/metadata/${poemId.replace('#', '')}.json`;
    console.log("📄 Metadata URI:", metadataUri);
    
    console.log("🔄 Calling contract.write.mintTo...");
    
    // thirdweb's exact pattern with ABI
    const result = await contract.write.mintTo([window.atuona.address, metadataUri]);
    
    console.log("✅ mintTo completed:", result);
    
    if (typeof showCyberNotification === 'function') {
      showCyberNotification("✅ Soul Fragment Collected for FREE!", 'success');
    } else {
      alert(`✅ Soul Fragment Collected for FREE!\n\nResult: ${JSON.stringify(result)}`);
    }
    
    // Update button
    updateMintButton(poemId, result.transactionHash || "minted");
    
  } catch (error) {
    console.error("❌ ABI minting failed:", error);
    
    let message = "❌ Free minting failed!";
    if (error.message && error.message.includes("user rejected")) {
      message = "❌ Transaction cancelled by user.";
    } else if (error.message && error.message.includes("insufficient funds")) {
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
      if (txHash && txHash !== "minted") {
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
  console.log("✅ ATUONA thirdweb ABI Ready!");
  
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
    📋 Contract ABI Loaded
  `;
  document.body.appendChild(status);
});

console.log("🎭 ATUONA Gallery - thirdweb ABI Solution Ready!");