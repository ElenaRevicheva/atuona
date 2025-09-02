// ATUONA Gallery of Moments - Zora Protocol Integration (Vanilla JS)
console.log("🎭 ATUONA Zora Gallery Loading...");

// Zora Protocol Configuration
const ZORA_CONFIG = {
  // Replace with your actual Zora contract address after deployment
  contractAddress: "0x8551EA2F46ee54A4AB2175bDb75ad2ef369d6115", // Placeholder - use your Zora contract
  chainId: 7777777, // Zora Network
  chainName: "Zora",
  rpcUrl: "https://rpc.zora.energy",
  blockExplorerUrl: "https://explorer.zora.energy",
  nativeCurrency: {
    name: "Ethereum",
    symbol: "ETH",
    decimals: 18
  }
};

// Alternative: Use Base network (Zora's recommended L2)
const BASE_CONFIG = {
  contractAddress: "0x8551EA2F46ee54A4AB2175bDb75ad2ef369d6115", // Your contract on Base
  chainId: 8453, // Base Network
  chainName: "Base",
  rpcUrl: "https://mainnet.base.org",
  blockExplorerUrl: "https://basescan.org",
  nativeCurrency: {
    name: "Ethereum",
    symbol: "ETH",
    decimals: 18
  }
};

// Use Base for lower fees (recommended)
const NETWORK_CONFIG = BASE_CONFIG;

// Global state for wallet and Zora connection
window.atuonaZora = {
  isConnected: false,
  userAddress: null,
  provider: null,
  signer: null,
  contract: null,
  network: NETWORK_CONFIG.chainName
};

// Network configuration for wallet
const networkConfig = {
  chainId: `0x${NETWORK_CONFIG.chainId.toString(16)}`, // Convert to hex
  chainName: NETWORK_CONFIG.chainName,
  nativeCurrency: NETWORK_CONFIG.nativeCurrency,
  rpcUrls: [NETWORK_CONFIG.rpcUrl],
  blockExplorerUrls: [NETWORK_CONFIG.blockExplorerUrl]
};

// Connect wallet and switch to Zora/Base network
async function connectToZora(walletType = 'auto') {
  console.log(`🔗 Connecting to ${NETWORK_CONFIG.chainName} network...`);
  
  try {
    if (!window.ethereum) {
      throw new Error("No wallet detected. Please install MetaMask or another Web3 wallet.");
    }
    
    // Request wallet connection
    const accounts = await window.ethereum.request({
      method: 'eth_requestAccounts'
    });
    
    if (accounts.length === 0) {
      throw new Error("No accounts found. Please unlock your wallet.");
    }
    
    // Check current network
    const currentChainId = await window.ethereum.request({
      method: 'eth_chainId'
    });
    
    // Switch to target network if needed
    if (currentChainId !== networkConfig.chainId) {
      try {
        await window.ethereum.request({
          method: 'wallet_switchEthereumChain',
          params: [{ chainId: networkConfig.chainId }]
        });
      } catch (switchError) {
        // If network doesn't exist, add it
        if (switchError.code === 4902) {
          await window.ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [networkConfig]
          });
        } else {
          throw switchError;
        }
      }
    }
    
    // Create ethers provider and signer
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();
    
    // Update global state
    window.atuonaZora.isConnected = true;
    window.atuonaZora.userAddress = accounts[0];
    window.atuonaZora.provider = provider;
    window.atuonaZora.signer = signer;
    
    console.log(`✅ Connected to ${NETWORK_CONFIG.chainName}:`, accounts[0]);
    
    // Update UI
    updateWalletUI(accounts[0]);
    showNotification(`🔗 Connected to ${NETWORK_CONFIG.chainName}: ${accounts[0].substring(0, 6)}...${accounts[0].substring(38)}`, 'success');
    
    return accounts[0];
    
  } catch (error) {
    console.error(`❌ ${NETWORK_CONFIG.chainName} connection failed:`, error);
    showNotification(`❌ Connection failed: ${error.message}`, 'error');
    throw error;
  }
}

// Mint NFT using Zora's simple approach
async function mintOnZora(poemId, poemTitle) {
  console.log(`🎭 Minting on ${NETWORK_CONFIG.chainName}: ${poemTitle} (${poemId})`);
  
  if (!window.atuonaZora.isConnected) {
    showNotification(`❌ Please connect to ${NETWORK_CONFIG.chainName} network first!`, 'error');
    return;
  }
  
  try {
    // Show minting notification
    showNotification(`🔄 Minting Soul Fragment on ${NETWORK_CONFIG.chainName}... Please confirm in wallet.`, 'info');
    
    // Simple ERC721 contract ABI for minting
    const contractABI = [
      {
        "inputs": [
          {"internalType": "address", "name": "to", "type": "address"},
          {"internalType": "string", "name": "uri", "type": "string"}
        ],
        "name": "mint",
        "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
        "stateMutability": "payable",
        "type": "function"
      },
      {
        "inputs": [
          {"internalType": "address", "name": "to", "type": "address"}
        ],
        "name": "safeMint",
        "outputs": [],
        "stateMutability": "payable", 
        "type": "function"
      }
    ];
    
    // Create contract instance
    const contract = new ethers.Contract(
      NETWORK_CONFIG.contractAddress,
      contractABI,
      window.atuonaZora.signer
    );
    
    // Create metadata JSON
    const metadata = {
      name: `${poemTitle} ${poemId}`,
      description: `ATUONA Gallery of Moments - Underground Verse Vault. ${poemTitle} - A digital soul fragment preserved on ${NETWORK_CONFIG.chainName} blockchain. Not as commodity, but as eternal fragment of consciousness.`,
      image: `https://atuona.xyz/images/poem-${poemId.replace('#', '').padStart(3, '0')}.png`,
      attributes: [
        {
          trait_type: "Collection",
          value: "GALLERY OF MOMENTS"
        },
        {
          trait_type: "Poem ID",
          value: poemId
        },
        {
          trait_type: "Type",
          value: "Underground Poetry"
        },
        {
          trait_type: "Network",
          value: NETWORK_CONFIG.chainName
        }
      ]
    };
    
    // For simplicity, encode metadata as data URI (no IPFS needed initially)
    const metadataURI = `data:application/json;base64,${btoa(JSON.stringify(metadata))}`;
    
    // Calculate mint price (0.001 ETH)
    const mintPrice = ethers.utils.parseEther("0.001");
    
    // Try different mint functions based on your contract
    let tx;
    try {
      // Try standard mint function first
      tx = await contract.mint(
        window.atuonaZora.userAddress,
        metadataURI,
        { value: mintPrice }
      );
    } catch (error) {
      // Fallback to safeMint if mint doesn't exist
      console.log("Trying safeMint function...");
      tx = await contract.safeMint(
        window.atuonaZora.userAddress,
        { value: mintPrice }
      );
    }
    
    console.log("🔄 Transaction sent:", tx.hash);
    showNotification(`🔄 Transaction sent: ${tx.hash.substring(0, 10)}...`, 'info');
    
    // Wait for confirmation
    const receipt = await tx.wait();
    
    console.log(`✅ Soul Fragment minted on ${NETWORK_CONFIG.chainName}:`, receipt.transactionHash);
    
    // Show success notification
    showNotification(`✅ Soul Fragment Collected! TX: ${receipt.transactionHash.substring(0, 10)}...`, 'success');
    
    // Update UI
    updateNFTCardStatus(poemId, 'minted', receipt.transactionHash);
    
    return receipt;
    
  } catch (error) {
    console.error(`❌ ${NETWORK_CONFIG.chainName} minting failed:`, error);
    
    let errorMessage = "❌ Minting failed. Please try again.";
    if (error.message.includes("user rejected")) {
      errorMessage = "❌ Transaction cancelled by user.";
    } else if (error.message.includes("insufficient funds")) {
      errorMessage = "❌ Insufficient funds for mint price + gas.";
    }
    
    showNotification(errorMessage, 'error');
    throw error;
  }
}

// UI Helper Functions
function updateWalletUI(address) {
  const walletButton = document.querySelector('.wallet-status');
  if (walletButton) {
    walletButton.textContent = `${address.substring(0, 6)}...${address.substring(38)}`;
    walletButton.setAttribute('data-text', `${NETWORK_CONFIG.chainName.toUpperCase()} CONNECTED`);
    walletButton.classList.add('connected');
  }
}

function updateNFTCardStatus(poemId, status, txHash = null) {
  // Find NFT card by poem ID
  const buttons = document.querySelectorAll('.nft-action');
  let targetCard = null;
  
  buttons.forEach(button => {
    if (button.onclick && button.onclick.toString().includes(poemId)) {
      targetCard = button.closest('.nft-card');
    }
  });
  
  if (targetCard) {
    const statusElement = targetCard.querySelector('.nft-status');
    const actionButton = targetCard.querySelector('.nft-action');
    
    if (status === 'minted' && statusElement && actionButton) {
      statusElement.textContent = 'COLLECTED';
      statusElement.classList.add('minted');
      actionButton.textContent = 'VIEW TRANSACTION';
      actionButton.onclick = () => window.open(`${NETWORK_CONFIG.blockExplorerUrl}/tx/${txHash}`, '_blank');
    }
  }
}

function showNotification(message, type = 'info') {
  if (typeof showCyberNotification === 'function') {
    showCyberNotification(message, type);
  } else {
    // Create simple notification
    const notification = document.createElement('div');
    notification.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: ${type === 'error' ? '#ff4444' : type === 'success' ? '#44ff44' : '#4444ff'};
      color: white;
      padding: 15px;
      border-radius: 5px;
      z-index: 10000;
      max-width: 300px;
      font-family: 'JetBrains Mono', monospace;
    `;
    notification.textContent = message;
    document.body.appendChild(notification);
    
    // Remove after 5 seconds
    setTimeout(() => {
      if (notification.parentNode) {
        notification.parentNode.removeChild(notification);
      }
    }, 5000);
  }
}

// Make functions globally available
window.connectToZora = connectToZora;
window.mintOnZora = mintOnZora;
window.handleWalletConnection = connectToZora;
window.mintPoem = mintOnZora;

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
  console.log(`✅ ATUONA ${NETWORK_CONFIG.chainName} Gallery module loaded!`);
  
  // Update button text to reflect network
  const walletButton = document.querySelector('.wallet-status');
  if (walletButton && !window.atuonaZora.isConnected) {
    walletButton.setAttribute('data-text', `CONNECT TO ${NETWORK_CONFIG.chainName.toUpperCase()}`);
  }
  
  // Add network info to UI
  const networkInfo = document.createElement('div');
  networkInfo.style.cssText = `
    position: fixed;
    bottom: 20px;
    right: 20px;
    background: rgba(0,0,0,0.8);
    color: #fff;
    padding: 10px;
    border-radius: 5px;
    font-size: 12px;
    z-index: 1000;
    font-family: 'JetBrains Mono', monospace;
  `;
  networkInfo.innerHTML = `
    🎭 Powered by Zora Protocol<br>
    🔗 Zero marketplace fees<br>
    ⛽ Low gas on ${NETWORK_CONFIG.chainName}<br>
    💎 Direct blockchain minting
  `;
  document.body.appendChild(networkInfo);
});

console.log(`🎭 ATUONA ${NETWORK_CONFIG.chainName} Gallery - Ready for Underground Poetry Collection!`);