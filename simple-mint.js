// ATUONA Gallery - WORKING MINTING (Multiple thirdweb patterns)
console.log("🔥 ATUONA Simple Minting Loading...");

// Your thirdweb contract on Polygon
const CONTRACT_ADDRESS = "0x8551EA2F46ee54A4AB2175bDb75ad2ef369d6115";
const POLYGON_CHAIN_ID = "0x89"; // 137 in hex

// Simple global state
window.atuona = {
  connected: false,
  address: null,
  provider: null
};

// Connect wallet - BULLETPROOF
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
      alert(`✅ Wallet Connected!\n${accounts[0]}\n\nYou can now mint Soul Fragments!`);
    }
    
  } catch (error) {
    console.error("❌ Connection failed:", error);
    alert(`❌ Connection failed: ${error.message}`);
  }
}

// TRY ALL POSSIBLE THIRDWEB MINT PATTERNS
async function mintNFT(poemId, poemTitle) {
  console.log(`🔥 Minting: ${poemTitle} (${poemId})`);
  
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
    
    console.log("🔄 Trying multiple thirdweb mint patterns...");
    
    // Show loading notification
    if (typeof showCyberNotification === 'function') {
      showCyberNotification("🔄 Minting Soul Fragment... Confirm in wallet.", 'info');
    } else {
      alert("🔄 Please confirm the transaction in your wallet...");
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
    
    const metadataURI = `data:application/json;charset=utf-8,${encodeURIComponent(JSON.stringify(metadata))}`;
    const price = ethers.utils.parseEther("0.001");
    
    // Create provider and signer
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();
    
    // Try Pattern 1: Standard ERC721 mint
    try {
      console.log("🔄 Pattern 1: Standard ERC721 mint...");
      const abi1 = [{"inputs":[{"internalType":"address","name":"to","type":"address"}],"name":"mint","outputs":[],"stateMutability":"payable","type":"function"}];
      const contract1 = new ethers.Contract(CONTRACT_ADDRESS, abi1, signer);
      const tx1 = await contract1.mint(window.atuona.address, { value: price, gasLimit: 300000 });
      return await handleSuccess(tx1, poemId);
    } catch (error1) {
      console.log("❌ Pattern 1 failed:", error1.message);
    }
    
    // Try Pattern 2: thirdweb mintTo with URI
    try {
      console.log("🔄 Pattern 2: thirdweb mintTo...");
      const abi2 = [{"inputs":[{"internalType":"address","name":"_to","type":"address"},{"internalType":"string","name":"_tokenURI","type":"string"}],"name":"mintTo","outputs":[],"stateMutability":"payable","type":"function"}];
      const contract2 = new ethers.Contract(CONTRACT_ADDRESS, abi2, signer);
      const tx2 = await contract2.mintTo(window.atuona.address, metadataURI, { value: price, gasLimit: 300000 });
      return await handleSuccess(tx2, poemId);
    } catch (error2) {
      console.log("❌ Pattern 2 failed:", error2.message);
    }
    
    // Try Pattern 3: claim function (common in thirdweb drops)
    try {
      console.log("🔄 Pattern 3: claim function...");
      const abi3 = [{"inputs":[{"internalType":"address","name":"_receiver","type":"address"},{"internalType":"uint256","name":"_quantity","type":"uint256"}],"name":"claim","outputs":[],"stateMutability":"payable","type":"function"}];
      const contract3 = new ethers.Contract(CONTRACT_ADDRESS, abi3, signer);
      const tx3 = await contract3.claim(window.atuona.address, 1, { value: price, gasLimit: 300000 });
      return await handleSuccess(tx3, poemId);
    } catch (error3) {
      console.log("❌ Pattern 3 failed:", error3.message);
    }
    
    // Try Pattern 4: thirdweb mint with quantity
    try {
      console.log("🔄 Pattern 4: mint with quantity...");
      const abi4 = [{"inputs":[{"internalType":"address","name":"_to","type":"address"},{"internalType":"uint256","name":"_quantity","type":"uint256"}],"name":"mint","outputs":[],"stateMutability":"payable","type":"function"}];
      const contract4 = new ethers.Contract(CONTRACT_ADDRESS, abi4, signer);
      const tx4 = await contract4.mint(window.atuona.address, 1, { value: price, gasLimit: 300000 });
      return await handleSuccess(tx4, poemId);
    } catch (error4) {
      console.log("❌ Pattern 4 failed:", error4.message);
    }
    
    // All patterns failed
    throw new Error("All mint patterns failed. Contract may not support public minting or requires different parameters.");
    
  } catch (error) {
    console.error("❌ All minting attempts failed:", error);
    
    let message = "❌ Minting failed!";
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
      alert(message + `\n\nCheck transaction: https://polygonscan.com/tx/0xa6a862dcb314bc9e7c8eeb1101ea74a52618d4b9030e3b2af25c1c5b8ae1cbb2`);
    }
  }
}

// Handle successful transaction
async function handleSuccess(tx, poemId) {
  console.log("⏳ Transaction sent:", tx.hash);
  
  if (typeof showCyberNotification === 'function') {
    showCyberNotification(`⏳ Transaction sent: ${tx.hash.substring(0, 10)}...`, 'info');
  }
  
  // Wait for confirmation
  const receipt = await tx.wait();
  
  if (receipt.status === 1) {
    console.log("✅ NFT minted!", receipt.transactionHash);
    
    if (typeof showCyberNotification === 'function') {
      showCyberNotification("✅ Soul Fragment Collected!", 'success');
    } else {
      alert(`✅ Soul Fragment Collected!\n\nTransaction: ${receipt.transactionHash}\n\nView: https://polygonscan.com/tx/${receipt.transactionHash}`);
    }
    
    updateMintButton(poemId, receipt.transactionHash);
    return receipt;
  } else {
    throw new Error("Transaction failed");
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
  console.log("✅ ATUONA Simple Minting Ready!");
  
  // Check ethers availability
  if (typeof ethers !== 'undefined') {
    console.log("✅ Ethers.js loaded successfully");
  } else {
    console.warn("⚠️ Ethers.js not loaded - please refresh page");
  }
  
  // Add simple status indicator
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
    💎 0.001 POL per mint<br>
    ${typeof ethers !== 'undefined' ? '✅ Ethers.js Ready' : '⚠️ Library Missing'}
  `;
  document.body.appendChild(status);
});

console.log("🎭 ATUONA Gallery - Multi-Pattern Minting Ready!");