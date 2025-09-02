// ATUONA Gallery - FREE UNDERGROUND MINTING (Final Working Version)
console.log("🔥 ATUONA Free Minting Loading...");

// Your thirdweb contract on Polygon
const CONTRACT_ADDRESS = "0x8551EA2F46ee54A4AB2175bDb75ad2ef369d6115";
const POLYGON_CHAIN_ID = "0x89"; // 137 in hex

// Simple global state
window.atuona = {
  connected: false,
  address: null,
  provider: null
};

// Connect wallet
async function connectWallet() {
  console.log("🔗 Connecting wallet...");
  
  if (!window.ethereum) {
    alert("❌ Please install MetaMask or another Web3 wallet!\n\nDownload MetaMask: https://metamask.io");
    return;
  }
  
  try {
    // Request account access
    const accounts = await window.ethereum.request({
      method: 'eth_requestAccounts'
    });
    
    if (!accounts || accounts.length === 0) {
      throw new Error("No accounts found. Please unlock your wallet.");
    }
    
    // Switch to Polygon if needed
    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: POLYGON_CHAIN_ID }]
      });
    } catch (switchError) {
      // Add Polygon network if not exists
      if (switchError.code === 4902) {
        await window.ethereum.request({
          method: 'wallet_addEthereumChain',
          params: [{
            chainId: POLYGON_CHAIN_ID,
            chainName: 'Polygon',
            nativeCurrency: { name: 'Polygon', symbol: 'POL', decimals: 18 },
            rpcUrls: ['https://polygon-rpc.com/', 'https://rpc.ankr.com/polygon'],
            blockExplorerUrls: ['https://polygonscan.com/']
          }]
        });
      } else {
        console.warn("Network switch failed:", switchError);
      }
    }
    
    // Update state
    window.atuona.connected = true;
    window.atuona.address = accounts[0];
    window.atuona.provider = window.ethereum;
    
    // Update UI
    const walletButton = document.querySelector('.wallet-status');
    if (walletButton) {
      walletButton.textContent = `${accounts[0].substring(0, 6)}...${accounts[0].substring(38)}`;
      walletButton.setAttribute('data-text', 'CONNECTED');
      walletButton.style.background = '#4CAF50';
    }
    
    console.log("✅ Wallet connected:", accounts[0]);
    
    // Show success notification
    if (typeof showCyberNotification === 'function') {
      showCyberNotification(`🔗 Wallet Connected: ${accounts[0].substring(0, 8)}...`, 'success');
    } else {
      alert(`✅ Wallet Connected!\n${accounts[0]}\n\nYou can now collect Soul Fragments for FREE!`);
    }
    
  } catch (error) {
    console.error("❌ Connection failed:", error);
    alert(`❌ Connection failed: ${error.message}`);
  }
}

// FREE MINTING - No payments, just gas
async function mintNFT(poemId, poemTitle) {
  console.log(`🔥 FREE Minting: ${poemTitle} (${poemId})`);
  
  if (!window.atuona.connected) {
    alert("❌ Please connect your wallet first!");
    await connectWallet();
    return;
  }
  
  try {
    if (typeof ethers === 'undefined') {
      alert("❌ Blockchain library not loaded. Please refresh the page and try again.");
      return;
    }
    
    console.log("🔄 Preparing FREE mint transaction (no payment required)...");
    
    // Show loading notification
    if (typeof showCyberNotification === 'function') {
      showCyberNotification("🔄 Collecting Soul Fragment for FREE... Confirm in wallet.", 'info');
    } else {
      alert("🔄 Collecting Soul Fragment for FREE!\n\nOnly gas fees apply - confirm in wallet...");
    }
    
    // Correct thirdweb contract ABI (nonpayable mintTo)
    const contractABI = [
      {
        "inputs": [
          {"internalType": "address", "name": "_to", "type": "address"},
          {"internalType": "string", "name": "_uri", "type": "string"}
        ],
        "name": "mintTo",
        "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
        "stateMutability": "nonpayable",
        "type": "function"
      }
    ];
    
    // Create provider and contract
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();
    const contract = new ethers.Contract(CONTRACT_ADDRESS, contractABI, signer);
    
    // Create metadata
    const metadata = {
      name: `${poemTitle} ${poemId}`,
      description: `ATUONA Gallery of Moments - ${poemTitle}. Underground poetry preserved on blockchain. Free collection - true to underground values.`,
      image: `https://atuona.xyz/poem-${poemId.replace('#', '')}.png`,
      attributes: [
        { trait_type: "Poem", value: poemTitle },
        { trait_type: "ID", value: poemId },
        { trait_type: "Collection", value: "GALLERY OF MOMENTS" },
        { trait_type: "Type", value: "Free Underground Poetry" }
      ]
    };
    
    const metadataURI = `data:application/json;charset=utf-8,${encodeURIComponent(JSON.stringify(metadata))}`;
    console.log("📄 Metadata URI created:", metadataURI.substring(0, 100) + "...");
    
    // FREE MINT - NO PAYMENT, just gas
    console.log("🔄 Calling mintTo function (FREE - no payment)...");
    const tx = await contract.mintTo(window.atuona.address, metadataURI, {
      gasLimit: 300000
      // NO VALUE PARAMETER - completely free!
    });
    
    console.log("⏳ FREE mint transaction sent:", tx.hash);
    
    // Show pending notification
    if (typeof showCyberNotification === 'function') {
      showCyberNotification(`⏳ FREE mint sent: ${tx.hash.substring(0, 10)}...`, 'info');
    }
    
    // Wait for confirmation
    const receipt = await tx.wait();
    
    if (receipt.status === 1) {
      console.log("✅ Soul Fragment collected for FREE!", receipt.transactionHash);
      
      if (typeof showCyberNotification === 'function') {
        showCyberNotification("✅ Soul Fragment Collected for FREE!", 'success');
      } else {
        alert(`✅ Soul Fragment Collected for FREE!\n\nTransaction: ${receipt.transactionHash}\n\nView: https://polygonscan.com/tx/${receipt.transactionHash}`);
      }
      
      updateMintButton(poemId, receipt.transactionHash);
      return receipt;
    } else {
      throw new Error("Transaction failed");
    }
    
  } catch (error) {
    console.error("❌ Free minting failed:", error);
    
    let message = "❌ Free minting failed!";
    if (error.message.includes("user rejected")) {
      message = "❌ Transaction cancelled by user.";
    } else if (error.message.includes("insufficient funds")) {
      message = "❌ Insufficient POL for gas fees.";
    } else if (error.message.includes("execution reverted")) {
      message = "❌ Contract error. You might not have minting permissions.";
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

// Make functions available globally
window.handleWalletConnection = connectWallet;
window.mintPoem = mintNFT;

// Initialize when page loads
document.addEventListener('DOMContentLoaded', function() {
  console.log("✅ ATUONA Free Minting Ready!");
  
  // Check ethers availability
  if (typeof ethers !== 'undefined') {
    console.log("✅ Ethers.js loaded successfully");
  } else {
    console.warn("⚠️ Ethers.js not loaded - please refresh page");
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
    📦 ${CONTRACT_ADDRESS.substring(0, 8)}...<br>
    🔗 Polygon Network<br>
    💎 FREE Collection (Gas Only)<br>
    ${typeof ethers !== 'undefined' ? '✅ Ethers.js Ready' : '⚠️ Library Missing'}
  `;
  document.body.appendChild(status);
});

console.log("🎭 ATUONA Gallery - FREE Underground Poetry Collection Ready!");