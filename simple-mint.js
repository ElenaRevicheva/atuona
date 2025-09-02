// ATUONA Gallery - SIMPLE WORKING MINTING (No Complex SDKs)
console.log("🔥 ATUONA Simple Minting Loading...");

// Your existing Polygon contract that WORKS
const CONTRACT_ADDRESS = "0x8551EA2F46ee54A4AB2175bDb75ad2ef369d6115";
const POLYGON_CHAIN_ID = "0x89"; // 137 in hex

// Simple global state
window.atuona = {
  connected: false,
  address: null,
  provider: null
};

// Connect wallet - SIMPLE
async function connectWallet() {
  console.log("🔗 Connecting wallet...");
  
  if (!window.ethereum) {
    alert("❌ Please install MetaMask or another Web3 wallet!");
    return;
  }
  
  try {
    // Request account access
    const accounts = await window.ethereum.request({
      method: 'eth_requestAccounts'
    });
    
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
            rpcUrls: ['https://polygon-rpc.com/'],
            blockExplorerUrls: ['https://polygonscan.com/']
          }]
        });
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
    }
    
    console.log("✅ Wallet connected:", accounts[0]);
    alert(`✅ Wallet Connected!\n${accounts[0]}`);
    
  } catch (error) {
    console.error("❌ Connection failed:", error);
    alert(`❌ Connection failed: ${error.message}`);
  }
}

// Mint NFT - SIMPLE
async function mintNFT(poemId, poemTitle) {
  console.log(`🔥 Minting: ${poemTitle} (${poemId})`);
  
  if (!window.atuona.connected) {
    alert("❌ Please connect your wallet first!");
    return;
  }
  
  try {
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
    
    // Convert metadata to data URI (no IPFS needed)
    const metadataURI = `data:application/json;base64,${btoa(JSON.stringify(metadata))}`;
    
    // Calculate price (0.001 ETH)
    const price = ethers.utils.parseEther("0.001");
    
    console.log("🔄 Sending mint transaction...");
    alert("🔄 Please confirm the transaction in your wallet...");
    
    // Send mint transaction
    const tx = await contract.safeMint(window.atuona.address, metadataURI, {
      value: price,
      gasLimit: 300000
    });
    
    console.log("⏳ Transaction sent:", tx.hash);
    alert(`⏳ Transaction sent!\nHash: ${tx.hash}`);
    
    // Wait for confirmation
    const receipt = await tx.wait();
    
    console.log("✅ NFT minted!", receipt.transactionHash);
    alert(`✅ Soul Fragment Collected!\n\nTransaction: ${receipt.transactionHash}\n\nView on Polygonscan: https://polygonscan.com/tx/${receipt.transactionHash}`);
    
    // Update button
    const buttons = document.querySelectorAll('.nft-action');
    buttons.forEach(button => {
      if (button.onclick.toString().includes(poemId)) {
        button.textContent = 'COLLECTED ✅';
        button.style.background = '#4CAF50';
        button.onclick = () => window.open(`https://polygonscan.com/tx/${receipt.transactionHash}`, '_blank');
      }
    });
    
  } catch (error) {
    console.error("❌ Minting failed:", error);
    
    let message = "❌ Minting failed!";
    if (error.message.includes("user rejected")) {
      message = "❌ Transaction cancelled by user.";
    } else if (error.message.includes("insufficient funds")) {
      message = "❌ Insufficient funds for gas fees.";
    }
    
    alert(message);
  }
}

// Make functions available globally
window.handleWalletConnection = connectWallet;
window.mintPoem = mintNFT;

// Initialize when page loads
document.addEventListener('DOMContentLoaded', function() {
  console.log("✅ ATUONA Simple Minting Ready!");
  
  // Add simple status indicator
  const status = document.createElement('div');
  status.style.cssText = `
    position: fixed;
    bottom: 20px;
    right: 20px;
    background: rgba(0,0,0,0.8);
    color: #fff;
    padding: 10px;
    border-radius: 5px;
    font-size: 12px;
    z-index: 1000;
    font-family: monospace;
  `;
  status.innerHTML = `
    🎭 ATUONA Gallery<br>
    📦 Contract: ${CONTRACT_ADDRESS.substring(0, 8)}...<br>
    🔗 Network: Polygon<br>
    💎 Price: 0.001 ETH
  `;
  document.body.appendChild(status);
});

console.log("🎭 ATUONA Gallery - Simple Minting Ready!");