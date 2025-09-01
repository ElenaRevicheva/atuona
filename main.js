// ATUONA Gallery of Moments - Blockchain Integration
import {
  createThirdwebClient,
  getContract,
} from "thirdweb";
import { mintTo } from "thirdweb/extensions/erc721";
import { polygon } from "thirdweb/chains";
import { 
  createWallet,
  injectedProvider
} from "thirdweb/wallets";

console.log("🔥 ATUONA Blockchain module loading...");

// Initialize thirdweb client
const client = createThirdwebClient({
  clientId: "602cfa7b8c0b862d35f7cfa61c961a38",
});

// Get contract on Polygon
const contract = getContract({
  client,
  address: "0x8551EA2F46ee54A4AB2175bDb75ad2ef369d6115",
  chain: polygon,
});

// Global state
window.atuonaState = {
  client,
  contract,
  wallet: null,
  account: null,
  isConnected: false,
  userAddress: null,
  isInitialized: true
};

// Multi-wallet connection
window.handleWalletConnection = async function() {
  console.log("🔗 Wallet connection clicked!");
  
  try {
    // Show connection message
    if (typeof showCyberNotification === 'function') {
      showCyberNotification("🔗 Choose your wallet to enter the underground vault...");
    } else {
      alert("🔗 Connecting wallet...");
    }
    
    // Create wallet instance
    const wallet = createWallet("io.metamask");
    
    // Connect wallet
    const account = await wallet.connect({
      client,
      chain: polygon,
    });
    
    window.atuonaState.wallet = wallet;
    window.atuonaState.account = account;
    window.atuonaState.isConnected = true;
    window.atuonaState.userAddress = account.address;
    
    console.log("✅ Wallet connected:", account.address);
    
    // Update UI
    const walletButton = document.querySelector('.wallet-status');
    if (walletButton) {
      walletButton.textContent = `Connected: ${account.address.slice(0,6)}...${account.address.slice(-4)}`;
      walletButton.style.color = 'var(--silver-grey)';
    }
    
    // Success message
    if (typeof showCyberNotification === 'function') {
      showCyberNotification("✅ Wallet connected to Polygon! Ready for gasless soul fragment collection.");
    } else {
      alert("✅ Wallet connected! Ready to collect soul fragments.");
    }
    
  } catch (error) {
    console.error("❌ Wallet connection failed:", error);
    const message = `❌ Wallet connection failed: ${error.message}`;
    if (typeof showCyberNotification === 'function') {
      showCyberNotification(message);
    } else {
      alert(message);
    }
  }
};

// Direct minting from website
window.mintPoem = async function(poemId, poemTitle) {
  console.log(`🔥 Mint request: ${poemTitle} (#${poemId})`);
  
  try {
    if (!window.atuonaState.isConnected) {
      alert("🔗 Please connect your wallet first!");
      await window.handleWalletConnection();
      return;
    }
    
    const message = `🔥 Minting "${poemTitle}" - Soul Fragment #${poemId}... Gasless transaction in progress.`;
    if (typeof showCyberNotification === 'function') {
      showCyberNotification(message);
    } else {
      alert(message);
    }
    
    // Create mint transaction with simplified gas handling
    const transaction = mintTo({
      contract: window.atuonaState.contract,
      to: window.atuonaState.userAddress,
      nft: {
        name: poemTitle,
        description: `Soul Fragment #${poemId} from ATUONA Underground Verse Vault - "${poemTitle}" - A piece of consciousness trapped in code, screaming beauty into the void. This is not an investment, but a moment of authentic human experience preserved on blockchain.`,
        image: `https://atuona.xyz/assets/poem-${poemId}.png`,
        attributes: {
          "Poem ID": poemId,
          "Collection": "ATUONA Underground Verse Vault", 
          "Type": "Soul Fragment",
          "Language": "Russian/English",
          "Theme": "Underground Poetry",
          "Publication Date": "2019-2025"
        }
      }
    });
    
    // Send transaction with explicit gas settings
    const result = await window.atuonaState.account.sendTransaction({
      ...transaction,
      gasLimit: 300000n, // Fixed gas limit as BigInt
      gasPrice: undefined, // Let network determine
    });
    
    console.log("✅ Soul Fragment minted:", result);
    
    const successMessage = `✅ Soul Fragment "${poemTitle}" collected successfully! Transaction: ${result.transactionHash.slice(0,10)}... Welcome to the underground.`;
    if (typeof showCyberNotification === 'function') {
      showCyberNotification(successMessage);
    } else {
      alert(successMessage);
    }
    
  } catch (error) {
    console.error("❌ Minting failed:", error);
    const errorMessage = `❌ Soul collection failed: ${error.message}`;
    if (typeof showCyberNotification === 'function') {
      showCyberNotification(errorMessage);
    } else {
      alert(errorMessage);
    }
  }
};

console.log("✅ ATUONA Underground Gallery blockchain module loaded!");