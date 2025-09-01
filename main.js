// ATUONA Gallery of Moments - Complete NFT Gallery with Multi-Wallet Support
console.log("🔥 ATUONA Underground NFT Gallery Loading...");

import { createThirdwebClient, getContract } from "thirdweb";
import { createWallet, walletConnect } from "thirdweb/wallets";
import { mintTo } from "thirdweb/extensions/erc721";
import { polygon } from "thirdweb/chains";

// Initialize thirdweb client with your API key
const client = createThirdwebClient({
  clientId: "602cfa7b8c0b862d35f7cfa61c961a38",
});

// Your NFT contract on Polygon
const contract = getContract({
  client,
  address: "0x8551EA2F46ee54A4AB2175bDb75ad2ef369d6115",
  chain: polygon,
});

// Global state for wallet connection
window.atuonaGallery = {
  isConnected: false,
  userAddress: null,
  wallet: null,
  account: null,
  client: client,
  contract: contract
};

// Multi-wallet connection with support for all major wallets
async function connectWallet(walletType = 'auto') {
  console.log("🔗 Connecting wallet...");
  
  try {
    let wallet;
    
    // Auto-detect wallet or use specified type
    if (walletType === 'auto') {
      // Check for installed wallets
      if (window.ethereum?.isMetaMask) {
        walletType = 'metamask';
      } else if (window.ethereum?.isPhantom) {
        walletType = 'phantom';
      } else if (window.ethereum?.isCoinbaseWallet) {
        walletType = 'coinbase';
      } else if (window.ethereum) {
        walletType = 'injected';
      } else {
        walletType = 'walletconnect';
      }
    }
    
    console.log(`🔗 Using ${walletType} wallet`);
    
    // Create wallet based on type
    switch (walletType) {
      case 'metamask':
        wallet = createWallet("io.metamask");
        break;
      case 'coinbase':
        wallet = createWallet("com.coinbase.wallet");
        break;
      case 'phantom':
        wallet = createWallet("app.phantom");
        break;
      case 'walletconnect':
        wallet = walletConnect();
        break;
      case 'injected':
      default:
        // Try to use any injected wallet
        wallet = createWallet("io.metamask"); // Fallback to MetaMask format
        break;
    }
    
    // Connect the wallet
    const account = await wallet.connect({
      client,
      chain: polygon,
    });
    
    // Update global state
    window.atuonaGallery.isConnected = true;
    window.atuonaGallery.userAddress = account.address;
    window.atuonaGallery.wallet = wallet;
    window.atuonaGallery.account = account;
    
    console.log("✅ Wallet connected:", account.address);
    
    // Update UI
    updateWalletUI(account.address);
    
    // Show success notification
    showNotification(`🔗 Wallet Connected: ${account.address.substring(0, 6)}...${account.address.substring(38)}`, 'success');
    
    return account;
    
  } catch (error) {
    console.error("❌ Wallet connection failed:", error);
    showNotification('❌ Wallet connection failed. Please try again.', 'error');
    throw error;
  }
}

// NFT Minting function with proper error handling
async function mintNFT(poemId, poemTitle) {
  console.log(`🔥 Minting: ${poemTitle} (${poemId})`);
  
  if (!window.atuonaGallery.isConnected || !window.atuonaGallery.account) {
    showNotification('❌ Please connect your wallet first!', 'error');
    return;
  }
  
  try {
    // Show minting notification
    showNotification('🔄 Minting Soul Fragment... Please confirm in wallet.', 'info');
    
    // Create NFT metadata
    const nftMetadata = {
      name: `${poemTitle} ${poemId}`,
      description: `ATUONA Gallery of Moments - Underground Verse Vault. ${poemTitle} - A digital soul fragment preserved on blockchain. Not as commodity, but as eternal fragment of consciousness.`,
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
          trait_type: "Chain",
          value: "Polygon"
        }
      ]
    };
    
    // Execute mint transaction
    const transaction = mintTo({
      contract: window.atuonaGallery.contract,
      to: window.atuonaGallery.account.address,
      nft: nftMetadata,
    });
    
    // Send transaction with the connected wallet
    const result = await window.atuonaGallery.wallet.sendTransaction({
      transaction,
      account: window.atuonaGallery.account,
    });
    
    console.log("✅ NFT minted successfully:", result.transactionHash);
    
    // Show success notification
    showNotification(`✅ Soul Fragment Collected! TX: ${result.transactionHash}`, 'success');
    
    // Update UI to show minted status
    updateNFTCardStatus(poemId, 'minted', result.transactionHash);
    
    return result;
    
  } catch (error) {
    console.error("❌ Minting failed:", error);
    
    let errorMessage = "❌ Minting failed. Please try again.";
    if (error.message.includes("user rejected")) {
      errorMessage = "❌ Transaction cancelled by user.";
    } else if (error.message.includes("insufficient funds")) {
      errorMessage = "❌ Insufficient funds for gas fees.";
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
    walletButton.setAttribute('data-text', 'CONNECTED');
    walletButton.classList.add('connected');
  }
}

function updateNFTCardStatus(poemId, status, txHash = null) {
  const nftCard = document.querySelector(`[data-poem-id="${poemId}"]`);
  if (nftCard) {
    const statusElement = nftCard.querySelector('.nft-status');
    const actionButton = nftCard.querySelector('.nft-action');
    
    if (status === 'minted' && statusElement && actionButton) {
      statusElement.textContent = 'COLLECTED';
      statusElement.classList.add('minted');
      actionButton.textContent = 'VIEW ON POLYGONSCAN';
      actionButton.onclick = () => window.open(`https://polygonscan.com/tx/${txHash}`, '_blank');
    }
  }
}

function showNotification(message, type = 'info') {
  // Use existing cyber notification system if available
  if (typeof showCyberNotification === 'function') {
    showCyberNotification(message, type);
  } else {
    // Fallback to alert
    alert(message);
  }
}

// Wallet connection options for different wallet types
function showWalletOptions() {
  const options = [
    { type: 'metamask', name: 'MetaMask', available: !!window.ethereum?.isMetaMask },
    { type: 'coinbase', name: 'Coinbase Wallet', available: !!window.ethereum?.isCoinbaseWallet },
    { type: 'phantom', name: 'Phantom', available: !!window.ethereum?.isPhantom },
    { type: 'walletconnect', name: 'WalletConnect', available: true }
  ];
  
  const availableOptions = options.filter(opt => opt.available);
  
  if (availableOptions.length === 1) {
    // Auto-connect if only one wallet available
    return connectWallet(availableOptions[0].type);
  } else {
    // Show selection or auto-detect
    return connectWallet('auto');
  }
}

// Make functions globally available for HTML onclick handlers
window.handleWalletConnection = showWalletOptions;
window.mintPoem = mintNFT;
window.connectWallet = connectWallet;
window.atuonaConnect = showWalletOptions;
window.atuonaMint = mintNFT;

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
  console.log("✅ ATUONA Underground Gallery blockchain module loaded!");
  
  // Check if wallet was previously connected
  if (localStorage.getItem('atuona-wallet-connected') === 'true') {
    console.log("🔄 Attempting to reconnect wallet...");
    connectWallet('auto').catch(err => {
      console.log("Could not auto-reconnect wallet:", err);
      localStorage.removeItem('atuona-wallet-connected');
    });
  }
});

// Save connection state
window.addEventListener('beforeunload', function() {
  if (window.atuonaGallery.isConnected) {
    localStorage.setItem('atuona-wallet-connected', 'true');
  }
});

console.log("🎭 ATUONA Gallery of Moments - Ready for Underground NFT Collection!");