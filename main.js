// ATUONA Gallery of Moments - Multi-Wallet thirdweb v5 Solution
console.log("🔥 ATUONA Blockchain module loading...");

import {
  createThirdwebClient,
  getContract,
} from "thirdweb";
import {
  metamaskWallet,
  walletConnect,
  coinbaseWallet,
} from "thirdweb/wallets";
import { mintTo } from "thirdweb/extensions/erc721";
import { polygon } from "thirdweb/chains";

// Initialize thirdweb client
const client = createThirdwebClient({
  clientId: "602cfa7b8c0b862d35f7cfa61c961a38",
});

// Contract setup
const contract = getContract({
  client,
  address: "0x8551EA2F46ee54A4AB2175bDb75ad2ef369d6115",
  chain: polygon,
});

let wallet, account;

// Global state
window.atuonaState = {
  isConnected: false,
  userAddress: null,
  client: client,
  contract: contract,
  wallet: null,
  account: null
};

// Multi-wallet connection function
async function connectWallet(type = 'auto') {
  console.log("🔗 Wallet connection clicked!");
  
  try {
    // Auto-detect or use specified wallet
    if (type === 'auto') {
      if (window.ethereum?.isMetaMask) {
        type = 'metamask';
      } else if (window.ethereum?.isPhantom) {
        type = 'phantom';
      } else {
        type = 'walletconnect';
      }
    }
    
    console.log(`🔗 Using ${type} wallet`);
    
    // Initialize wallet based on type
    if (type === "metamask") {
      wallet = metamaskWallet();
    } else if (type === "walletconnect") {
      wallet = walletConnect();
    } else if (type === "coinbase") {
      wallet = coinbaseWallet();
    } else {
      // Fallback to MetaMask
      wallet = metamaskWallet();
    }
    
    // Connect wallet
    account = await wallet.connect({
      client,
      chain: polygon,
    });
    
    // Update global state
    window.atuonaState.isConnected = true;
    window.atuonaState.userAddress = account.address;
    window.atuonaState.wallet = wallet;
    window.atuonaState.account = account;
    
    console.log("✅ Wallet connected:", account.address);
    
    // Update UI
    const walletButton = document.querySelector('.wallet-status');
    if (walletButton) {
      walletButton.textContent = `${account.address.substring(0, 6)}...${account.address.substring(38)}`;
      walletButton.setAttribute('data-text', 'CONNECTED');
    }
    
    // Show success notification
    if (typeof showCyberNotification === 'function') {
      showCyberNotification('🔗 Wallet Connected Successfully!', 'success');
    } else {
      alert(`✅ Wallet Connected: ${account.address}`);
    }
    
  } catch (error) {
    console.error("❌ Wallet connection failed:", error);
    
    if (typeof showCyberNotification === 'function') {
      showCyberNotification('❌ Wallet connection failed. Please try again.', 'error');
    } else {
      alert("❌ Wallet connection failed. Please try again.");
    }
  }
}

// NFT Minting function
async function mintNFT(poemId, poemTitle) {
  console.log(`🔥 Mint request: ${poemTitle} (${poemId})`);
  
  if (!account) {
    if (typeof showCyberNotification === 'function') {
      showCyberNotification('❌ Please connect your wallet first!', 'error');
    } else {
      alert("❌ Please connect your wallet first!");
    }
    return;
  }
  
  try {
    // Show minting notification
    if (typeof showCyberNotification === 'function') {
      showCyberNotification('🔄 Minting Soul Fragment... Please confirm in wallet.', 'info');
    }
    
    // Prepare NFT metadata
    const nftMetadata = {
      name: `${poemTitle} ${poemId}`,
      description: `ATUONA Gallery of Moments - Underground Verse Vault. ${poemTitle} - A digital soul fragment preserved on blockchain. Not as commodity, but as eternal fragment of consciousness.`,
      image: `https://atuona.xyz/images/poem-${poemId.replace('#', '').padStart(3, '0')}.png`, // Placeholder - you can replace with actual images
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
    
    // Execute mint transaction with explicit gas settings
    const tx = mintTo({
      contract,
      to: account.address,
      nft: nftMetadata,
      // Add gas overrides to prevent BigInt errors
      overrides: {
        gasLimit: BigInt(300000), // 300k gas limit
        maxFeePerGas: BigInt(50000000000), // 50 gwei
        maxPriorityFeePerGas: BigInt(2000000000), // 2 gwei
      }
    });
    
    const result = await account.sendTransaction(tx);
    
    console.log("✅ Soul Fragment transaction sent:", result.transactionHash);
    
    // Show success notification
    if (typeof showCyberNotification === 'function') {
      showCyberNotification(`✅ Soul Fragment Collected! TX: ${result.transactionHash}`, 'success');
    } else {
      alert(`✅ Soul Fragment Collected!\nTransaction: ${result.transactionHash}`);
    }
    
  } catch (error) {
    console.error("❌ Minting failed:", error);
    
    let errorMessage = "❌ Minting failed. Please try again.";
    if (error.message.includes("user rejected")) {
      errorMessage = "❌ Transaction cancelled by user.";
    } else if (error.message.includes("insufficient funds")) {
      errorMessage = "❌ Insufficient funds for gas fees.";
    }
    
    if (typeof showCyberNotification === 'function') {
      showCyberNotification(errorMessage, 'error');
    } else {
      alert(errorMessage);
    }
  }
}

// Attach functions to window for HTML access
window.handleWalletConnection = connectWallet;
window.mintPoem = mintNFT;
window.connectWallet = connectWallet;

console.log("✅ ATUONA Underground Gallery blockchain module loaded!");