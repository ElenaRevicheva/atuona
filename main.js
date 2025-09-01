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
    
    // Use raw Web3 approach to bypass thirdweb gas estimation issues
    try {
      // Switch to Polygon if needed
      const chainId = await window.ethereum.request({ method: 'eth_chainId' });
      if (chainId !== '0x89') {
        await window.ethereum.request({
          method: 'wallet_switchEthereumChain',
          params: [{ chainId: '0x89' }],
        });
      }
      
      // Prepare metadata for IPFS (simplified)
      const metadata = {
        name: poemTitle,
        description: `Soul Fragment #${poemId} from ATUONA Underground Verse Vault - "${poemTitle}" - A piece of consciousness trapped in code, screaming beauty into the void.`,
        image: `https://atuona.xyz/assets/poem-${poemId}.png`,
        attributes: [
          { trait_type: "Poem ID", value: poemId },
          { trait_type: "Type", value: "Soul Fragment" },
          { trait_type: "Theme", value: "Underground Poetry" }
        ]
      };
      
      // Simple contract interaction using Web3
      const contractAddress = window.atuonaState.contractAddress;
      
      // ERC721 mintTo function signature: mintTo(address to, string memory uri)
      const mintFunction = "0x40c10f19"; // mintTo function selector
      const toAddress = window.atuonaState.userAddress.slice(2).padStart(64, '0');
      const metadataUri = `https://atuona.xyz/metadata/${poemId}.json`; // Metadata URI
      const uriHex = Buffer.from(metadataUri, 'utf8').toString('hex').padEnd(64, '0');
      
      const txData = mintFunction + toAddress + "0000000000000000000000000000000000000000000000000000000000000040" + 
                     (metadataUri.length).toString(16).padStart(64, '0') + uriHex;
      
      // Send transaction
      const txHash = await window.ethereum.request({
        method: 'eth_sendTransaction',
        params: [{
          to: contractAddress,
          from: window.atuonaState.userAddress,
          data: txData,
          gas: '0x493E0', // 300000 in hex
        }],
      });
      
      const result = { transactionHash: txHash };
      
    } catch (rawError) {
      console.error("Raw transaction failed:", rawError);
      throw new Error(`Direct minting failed: ${rawError.message}`);
    }
    
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