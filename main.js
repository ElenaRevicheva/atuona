// ATUONA Gallery - BULLETPROOF SOLUTION (Direct ethers.js + your contract)
console.log("🔥 ATUONA Bulletproof Minting Loading...");

// Your contract on Polygon - we know this works
const CONTRACT_ADDRESS = "0x8551EA2F46ee54A4AB2175bDb75ad2ef369d6115";
const POLYGON_CHAIN_ID = "0x89";

// Global state
window.atuona = {
  connected: false,
  address: null
};

// Connect wallet - SIMPLE and RELIABLE
async function connectWallet() {
  console.log("🔗 Connecting wallet...");
  
  if (!window.ethereum) {
    alert("❌ Please install MetaMask!");
    return;
  }
  
  try {
    // Request account access
    const [userAddress] = await window.ethereum.request({
      method: "eth_requestAccounts",
    });
    
    // Switch to Polygon
    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: POLYGON_CHAIN_ID }]
      });
    } catch (switchError) {
      if (switchError.code === 4902) {
        await window.ethereum.request({
          method: 'wallet_addEthereumChain',
          params: [{
            chainId: POLYGON_CHAIN_ID,
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

// BULLETPROOF FREE MINTING - Direct contract call
async function mintNFT(poemId, poemTitle) {
  console.log(`🔥 FREE Minting: ${poemTitle} (${poemId})`);
  
  if (!window.atuona.connected) {
    await connectWallet();
    return;
  }
  
  try {
    console.log("🔄 Preparing FREE mint with direct contract call...");
    
    if (typeof showCyberNotification === 'function') {
      showCyberNotification("🔄 Minting Soul Fragment for FREE...", 'info');
    } else {
      alert("🔄 Minting Soul Fragment for FREE!\nConfirm in wallet...");
    }
    
    // Create metadata
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
    
    // Try HTTPS metadata first (might work better than data URI)
    const metadataJson = JSON.stringify(metadata);
    const metadataUri = `https://atuona.xyz/metadata/${poemId.replace('#', '')}.json`;
    
    console.log("📄 Metadata URI:", metadataUri);
    
    // Direct contract call using raw Web3 (bulletproof)
    const mintFunctionSignature = "0x0075a317"; // mintTo(address,string) signature
    const addressParam = window.atuona.address.toLowerCase().replace('0x', '').padStart(64, '0');
    const stringOffset = (64).toString(16).padStart(64, '0'); // offset to string data
    const stringLength = metadataUri.length.toString(16).padStart(64, '0');
    const stringData = Array.from(metadataUri).map(c => c.charCodeAt(0).toString(16).padStart(2, '0')).join('').padEnd(Math.ceil(metadataUri.length / 32) * 64, '0');
    
    const callData = mintFunctionSignature + addressParam + stringOffset + stringLength + stringData;
    
    console.log("🔄 Sending direct contract call...");
    
    // Send transaction
    const txHash = await window.ethereum.request({
      method: 'eth_sendTransaction',
      params: [{
        from: window.atuona.address,
        to: CONTRACT_ADDRESS,
        data: callData,
        gas: '0x493E0' // 300000 in hex
      }]
    });
    
    console.log("✅ Transaction sent:", txHash);
    
    if (typeof showCyberNotification === 'function') {
      showCyberNotification("✅ Soul Fragment Collected for FREE!", 'success');
    } else {
      alert(`✅ Soul Fragment Collected for FREE!\n\nTransaction: ${txHash}\n\nView: https://polygonscan.com/tx/${txHash}`);
    }
    
    // Update button
    updateMintButton(poemId, txHash);
    
  } catch (error) {
    console.error("❌ Minting failed:", error);
    
    let message = "❌ Free minting failed!";
    if (error.message && error.message.includes("user rejected")) {
      message = "❌ Transaction cancelled by user.";
    } else if (error.message && error.message.includes("insufficient funds")) {
      message = "❌ Insufficient POL for gas fees.";
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
  console.log("✅ ATUONA Bulletproof Ready!");
  
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
    📦 ${CONTRACT_ADDRESS.substring(0, 8)}...<br>
    🔗 Polygon Network<br>
    💎 FREE Collection (Gas Only)<br>
    🛡️ Direct Contract Calls
  `;
  document.body.appendChild(status);
});

console.log("🎭 ATUONA Gallery - Bulletproof Direct Minting Ready!");