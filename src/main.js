// ATUONA Gallery - thirdweb's EXACT Browser Solution (ethers.js)
console.log("🔥 ATUONA ethers.js Browser Loading...");

import contractABI from "./contract-abi.json";

// Contract details
const contractAddress = "0x8551EA2F46ee54A4AB2175bDb75ad2ef369d6115";

// Global state
window.atuona = {
  connected: false,
  address: null
};

// Connect wallet - thirdweb's browser approach
async function connectWallet() {
  console.log("🔗 Connecting wallet...");
  
  if (!window.ethereum) {
    alert("❌ Please install MetaMask!");
    return;
  }
  
  try {
    // Connect to MetaMask - thirdweb's exact pattern
    await window.ethereum.request({
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
    
    // Get user address
    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();
    const userAddress = await signer.getAddress();
    
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

// FREE minting - thirdweb's exact browser solution with ethers.js
async function mintNFT(poemId, poemTitle) {
  console.log(`🔥 FREE ethers.js Minting: ${poemTitle} (${poemId})`);
  
  if (!window.atuona.connected) {
    await connectWallet();
    return;
  }
  
  try {
    console.log("🔄 Using ethers.js for browser minting...");
    
    if (typeof showCyberNotification === 'function') {
      showCyberNotification("🔄 Minting Soul Fragment for FREE...", 'info');
    } else {
      alert("🔄 Minting Soul Fragment for FREE!\nConfirm in wallet...");
    }
    
    // thirdweb's exact browser pattern with ethers.js
    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();
    const contract = new ethers.Contract(
      contractAddress,
      contractABI,
      signer,
    );
    
    console.log("✅ ethers.js contract created");
    
    // Create metadata URI
    const metadata = {
      name: `${poemTitle} ${poemId}`,
      description: `ATUONA Gallery of Moments - ${poemTitle}. Underground poetry preserved on blockchain. Free collection - true to underground values.`,
      image: `https://atuona.xyz/poem-${poemId.replace('#', '')}.png`,
      attributes: [
        { trait_type: "Poem", value: poemTitle },
        { trait_type: "ID", value: poemId },
        { trait_type: "Collection", value: "GALLERY OF MOMENTS" }
      ]
    };
    
    const metadataUri = `https://atuona.xyz/metadata/${poemId.replace('#', '')}.json`;
    console.log("📄 Metadata URI:", metadataUri);
    
    // thirdweb's exact browser call
    console.log("🔄 Calling contract.mintTo with ethers.js...");
    const tx = await contract.mintTo(
      window.atuona.address,
      metadataUri,
    );
    
    console.log("⏳ Transaction sent:", tx.hash);
    
    // Wait for confirmation
    await tx.wait();
    
    console.log("✅ Soul Fragment minted for FREE!");
    
    if (typeof showCyberNotification === 'function') {
      showCyberNotification("✅ Soul Fragment Collected for FREE!", 'success');
    } else {
      alert(`✅ Soul Fragment Collected for FREE!\n\nTransaction: ${tx.hash}\n\nView: https://polygonscan.com/tx/${tx.hash}`);
    }
    
    // Update button
    updateMintButton(poemId, tx.hash);
    
  } catch (error) {
    console.error("❌ ethers.js minting failed:", error);
    
    let message = "❌ Free minting failed!";
    if (error.message && error.message.includes("user rejected")) {
      message = "❌ Transaction cancelled by user.";
    } else if (error.message && error.message.includes("insufficient funds")) {
      message = "❌ Insufficient POL for gas fees.";
    } else if (error.message && error.message.includes("NFTMetadataInvalidUrl")) {
      message = "❌ Invalid metadata URL. Using data URI fallback.";
      // Fallback to data URI
      const metadataDataUri = `data:application/json;charset=utf-8,${encodeURIComponent(JSON.stringify(metadata))}`;
      try {
        const tx = await contract.mintTo(window.atuona.address, metadataDataUri);
        await tx.wait();
        console.log("✅ Fallback minting succeeded!");
        updateMintButton(poemId, tx.hash);
        return;
      } catch (fallbackError) {
        message = `❌ Both HTTPS and data URI failed: ${fallbackError.message}`;
      }
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

// Make functions globally available
window.handleWalletConnection = connectWallet;
window.mintPoem = mintNFT;

// Initialize
document.addEventListener('DOMContentLoaded', function() {
  console.log("✅ ATUONA ethers.js Browser Ready!");
  
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
    ⚡ ethers.js Direct Calls
  `;
  document.body.appendChild(status);
});

console.log("🎭 ATUONA Gallery - ethers.js Browser Solution Ready!");