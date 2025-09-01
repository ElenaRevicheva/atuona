// ATUONA Gallery of Moments - THIRDWEB OFFICIAL MULTI-WALLET SOLUTION
import { createThirdwebClient, getContract } from "thirdweb";
import { 
  metamaskWallet,
  walletConnect,
  coinbaseWallet,
} from "thirdweb/wallets";
import { mintTo } from "thirdweb/extensions/erc721";
import { polygon } from "thirdweb/chains";

console.log("🔥 ATUONA Blockchain module loading...");

// Initialize thirdweb client
const client = createThirdwebClient({
  clientId: "602cfa7b8c0b862d35f7cfa61c961a38",
});

// Global state
let wallet, account;
window.atuonaState = {
  client,
  wallet: null,
  account: null,
  isConnected: false,
  userAddress: null,
  contractAddress: "0x8551EA2F46ee54A4AB2175bDb75ad2ef369d6115"
};

// Multi-wallet connection function - THIRDWEB OFFICIAL APPROACH
async function connectWallet(type) {
  try {
    console.log(`🔗 Connecting ${type} wallet...`);
    
    if (typeof showCyberNotification === 'function') {
      showCyberNotification(`🔗 Connecting ${type} wallet to underground vault...`);
    }
    
    // Create wallet based on type using correct thirdweb v5 syntax
    if (type === "metamask") wallet = metamaskWallet();
    if (type === "walletconnect") wallet = walletConnect();
    if (type === "coinbase") wallet = coinbaseWallet();
    
    // Connect wallet
    account = await wallet.connect({
      client,
      chain: polygon,
    });
    
    // Update global state
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
    
    if (typeof showCyberNotification === 'function') {
      showCyberNotification(`✅ ${type} connected to Polygon! Ready for soul fragment collection.`);
    } else {
      alert(`✅ ${type} connected! Ready for soul fragments.`);
    }
    
  } catch (error) {
    console.error(`❌ ${type} connection failed:`, error);
    if (typeof showCyberNotification === 'function') {
      showCyberNotification(`❌ ${type} connection failed: ${error.message}`);
    } else {
      alert(`❌ ${type} connection failed: ${error.message}`);
    }
  }
}

// Wallet selection function
window.handleWalletConnection = async function() {
  console.log("🔗 Wallet connection clicked!");
  
  // Show wallet options
  const walletChoice = prompt(
    "Choose your wallet:\n" +
    "1 = MetaMask\n" +
    "2 = WalletConnect (Mobile wallets, Trust, Rainbow, etc.)\n" +
    "3 = Coinbase Wallet",
    "1"
  );
  
  if (walletChoice === "1") {
    await connectWallet("metamask");
  } else if (walletChoice === "2") {
    await connectWallet("walletconnect");
  } else if (walletChoice === "3") {
    await connectWallet("coinbase");
  } else {
    if (typeof showCyberNotification === 'function') {
      showCyberNotification("❌ Invalid wallet selection. Please try again.");
    }
  }
};

// WORKING minting function using thirdweb
window.mintPoem = async function(poemId, poemTitle) {
  console.log(`🔥 Mint request: ${poemTitle} (#${poemId})`);
  
  try {
    if (!window.atuonaState.isConnected || !account) {
      alert("🔗 Please connect your wallet first!");
      await window.handleWalletConnection();
      return;
    }
    
    if (typeof showCyberNotification === 'function') {
      showCyberNotification(`🔥 Minting "${poemTitle}" - Soul Fragment #${poemId}... Gasless transaction in progress.`);
    } else {
      alert(`🔥 Minting "${poemTitle}"...`);
    }
    
    // Get contract
    const contract = getContract({
      client,
      address: window.atuonaState.contractAddress,
      chain: polygon,
    });
    
    // Create mint transaction with explicit gas overrides
    const tx = mintTo({
      contract,
      to: account.address,
      nft: {
        name: poemTitle,
        description: `Soul Fragment #${poemId} from ATUONA Underground Verse Vault - "${poemTitle}" - A piece of consciousness trapped in code, screaming beauty into the void. This is not an investment, but a moment of authentic human experience preserved on blockchain.`,
        image: `https://atuona.xyz/assets/poem-${poemId}.png`,
        attributes: [
          { trait_type: "Poem ID", value: poemId },
          { trait_type: "Collection", value: "ATUONA Underground Verse Vault" },
          { trait_type: "Type", value: "Soul Fragment" },
          { trait_type: "Language", value: "Russian/English" },
          { trait_type: "Theme", value: "Underground Poetry" }
        ]
      },
      overrides: {
        gasLimit: 200_000n,
        maxFeePerGas: 50_000_000_000n,
        maxPriorityFeePerGas: 2_000_000_000n,
      },
    });
    
    // Send transaction
    const result = await account.sendTransaction(tx);
    
    console.log("✅ Soul Fragment minted:", result);
    
    const successMessage = `✅ Soul Fragment "${poemTitle}" collected successfully! Transaction: ${result.transactionHash.slice(0,10)}... Welcome to the underground resistance.`;
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