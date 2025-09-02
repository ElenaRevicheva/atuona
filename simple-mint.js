// ATUONA Gallery - SIMPLE WORKING MINTING (Bulletproof Version)
console.log("🔥 ATUONA Simple Minting Loading...");

// Check if ethers is available
if (typeof ethers === 'undefined') {
  console.error("❌ Ethers.js not loaded! Using Web3 fallback...");
  alert("❌ Loading blockchain library... Please refresh if minting doesn't work.");
}

// Your existing Polygon contract that WORKS
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
            nativeCurrency: { name: 'MATIC', symbol: 'MATIC', decimals: 18 },
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

// Mint NFT - BULLETPROOF with fallbacks
async function mintNFT(poemId, poemTitle) {
  console.log(`🔥 Minting: ${poemTitle} (${poemId})`);
  
  if (!window.atuona.connected) {
    alert("❌ Please connect your wallet first!");
    await connectWallet();
    return;
  }
  
  try {
    // Check if ethers is available
    if (typeof ethers === 'undefined') {
      // Use raw Web3 calls if ethers is not available
      return await mintWithRawWeb3(poemId, poemTitle);
    }
    
    // Simple contract ABI - just the mint function we need
    const contractABI = [
      {
        "inputs": [
          {"internalType": "address", "name": "to", "type": "address"},
          {"internalType": "string", "name": "uri", "type": "string"}
        ],
        "name": "safeMint",
        "outputs": [],
        "stateMutability": "payable",
        "type": "function"
      }
    ];
    
    // Create ethers provider
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();
    
    // Create contract instance
    const contract = new ethers.Contract(CONTRACT_ADDRESS, contractABI, signer);
    
    // Create simple metadata
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
    
    // Convert metadata to data URI - UTF-8 safe encoding for Russian text
    const metadataJSON = JSON.stringify(metadata);
    console.log("📄 Metadata JSON:", metadataJSON);
    const metadataURI = `data:application/json;charset=utf-8,${encodeURIComponent(metadataJSON)}`;
    console.log("🔗 Metadata URI:", metadataURI.substring(0, 100) + "...");
    
    // Calculate price (0.001 ETH)
    const price = ethers.utils.parseEther("0.001");
    
    console.log("🔄 Sending mint transaction...");
    
    // Show loading notification
    if (typeof showCyberNotification === 'function') {
      showCyberNotification("🔄 Minting Soul Fragment... Confirm in wallet.", 'info');
    } else {
      alert("🔄 Please confirm the transaction in your wallet...");
    }
    
    // Send mint transaction
    const tx = await contract.safeMint(window.atuona.address, metadataURI, {
      value: price,
      gasLimit: 300000
    });
    
    console.log("⏳ Transaction sent:", tx.hash);
    
    // Show pending notification
    if (typeof showCyberNotification === 'function') {
      showCyberNotification(`⏳ Transaction sent: ${tx.hash.substring(0, 10)}...`, 'info');
    }
    
    // Wait for confirmation
    const receipt = await tx.wait();
    
    console.log("✅ NFT minted!", receipt.transactionHash);
    
    // Show success notification
    const successMessage = `✅ Soul Fragment Collected!\n\nTransaction: ${receipt.transactionHash}`;
    if (typeof showCyberNotification === 'function') {
      showCyberNotification("✅ Soul Fragment Collected!", 'success');
    } else {
      alert(successMessage);
    }
    
    // Update button
    updateMintButton(poemId, receipt.transactionHash);
    
  } catch (error) {
    console.error("❌ Minting failed:", error);
    
    let message = "❌ Minting failed!";
    if (error.message.includes("user rejected")) {
      message = "❌ Transaction cancelled by user.";
    } else if (error.message.includes("insufficient funds")) {
      message = "❌ Insufficient funds for gas fees.";
    } else if (error.message.includes("execution reverted")) {
      message = "❌ Contract error. Please try again.";
    }
    
    if (typeof showCyberNotification === 'function') {
      showCyberNotification(message, 'error');
    } else {
      alert(message);
    }
  }
}

// Raw Web3 fallback if ethers.js fails to load
async function mintWithRawWeb3(poemId, poemTitle) {
  console.log("🔄 Using raw Web3 fallback...");
  
  try {
    // Create metadata
    const metadata = {
      name: `${poemTitle} ${poemId}`,
      description: `ATUONA Gallery of Moments - ${poemTitle}. Underground poetry preserved on blockchain.`,
      image: `https://atuona.xyz/poem-${poemId.replace('#', '')}.png`
    };
    
    const metadataURI = `data:application/json;charset=utf-8,${encodeURIComponent(JSON.stringify(metadata))}`;
    
    // Encode function call manually
    const functionSignature = "0x40d097c3"; // safeMint(address,string) signature
    const addressParam = window.atuona.address.toLowerCase().replace('0x', '').padStart(64, '0');
    const stringOffset = (64).toString(16).padStart(64, '0'); // offset to string data
    const stringLength = metadataURI.length.toString(16).padStart(64, '0');
    const stringData = Array.from(metadataURI).map(c => c.charCodeAt(0).toString(16).padStart(2, '0')).join('').padEnd(Math.ceil(metadataURI.length / 32) * 64, '0');
    
    const callData = functionSignature + addressParam + stringOffset + stringLength + stringData;
    
    // Send transaction
    const txHash = await window.ethereum.request({
      method: 'eth_sendTransaction',
      params: [{
        from: window.atuona.address,
        to: CONTRACT_ADDRESS,
        value: '0x38D7EA4C68000', // 0.001 ETH in hex
        data: callData,
        gas: '0x493E0' // 300000 in hex
      }]
    });
    
    console.log("✅ Raw Web3 mint successful:", txHash);
    alert(`✅ Soul Fragment Collected!\n\nTransaction: ${txHash}\n\nView: https://polygonscan.com/tx/${txHash}`);
    
    updateMintButton(poemId, txHash);
    
  } catch (error) {
    console.error("❌ Raw Web3 mint failed:", error);
    alert("❌ Minting failed. Please try again or contact support.");
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
    console.warn("⚠️ Ethers.js not loaded - will use Web3 fallback");
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
    💎 0.001 ETH per mint<br>
    ${typeof ethers !== 'undefined' ? '✅ Ethers.js Ready' : '⚠️ Web3 Fallback'}
  `;
  document.body.appendChild(status);
});

console.log("🎭 ATUONA Gallery - Bulletproof Minting Ready!");