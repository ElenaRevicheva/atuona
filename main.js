// ATUONA Gallery - thirdweb IPFS Upload Solution
console.log("🔥 ATUONA thirdweb IPFS Loading...");

import { createThirdwebClient, getContract } from "thirdweb";
import { upload } from "thirdweb/storage";
import { polygon } from "thirdweb/chains";

// Initialize thirdweb client
const client = createThirdwebClient({
  clientId: "602cfa7b8c0b862d35f7cfa61c961a38",
});

// Your contract
const contract = getContract({
  client,
  address: "0x8551EA2F46ee54A4AB2175bDb75ad2ef369d6115",
  chain: polygon,
});

// Global state
window.atuona = {
  connected: false,
  address: null,
  client: client,
  contract: contract,
  metadataUris: {} // Will store IPFS URIs for each poem
};

// All 45 poems metadata for batch upload
const allPoemsMetadata = [
  {
    name: "На память 001",
    description: "ATUONA Gallery of Moments - На память. Underground poetry preserved on blockchain. Free collection - true to underground values.",
    image: "https://atuona.xyz/poem-001.png",
    attributes: [
      { trait_type: "Poem", value: "На память" },
      { trait_type: "ID", value: "001" },
      { trait_type: "Collection", value: "GALLERY OF MOMENTS" },
      { trait_type: "Type", value: "Free Underground Poetry" }
    ]
  },
  {
    name: "To Beautrix 002", 
    description: "ATUONA Gallery of Moments - To Beautrix. Underground poetry preserved on blockchain. Free collection - true to underground values.",
    image: "https://atuona.xyz/poem-002.png",
    attributes: [
      { trait_type: "Poem", value: "To Beautrix" },
      { trait_type: "ID", value: "002" },
      { trait_type: "Collection", value: "GALLERY OF MOMENTS" },
      { trait_type: "Type", value: "Free Underground Poetry" }
    ]
  },
  // Add more poems here - I'll create a script to generate all 45
];

// Upload all metadata to IPFS (one-time batch upload)
async function uploadAllMetadata() {
  try {
    console.log("📤 Uploading all 45 poems to IPFS...");
    
    if (typeof showCyberNotification === 'function') {
      showCyberNotification("📤 Uploading poetry to IPFS... This may take a moment.", 'info');
    }
    
    // Batch upload all metadata using thirdweb
    const uris = await upload({
      client,
      files: allPoemsMetadata,
    });
    
    console.log("✅ All metadata uploaded to IPFS:", uris);
    
    // Store URIs mapped to poem IDs
    uris.forEach((uri, index) => {
      const poemId = String(index + 1).padStart(3, '0');
      window.atuona.metadataUris[poemId] = uri;
    });
    
    console.log("✅ Metadata URIs mapped:", window.atuona.metadataUris);
    
    if (typeof showCyberNotification === 'function') {
      showCyberNotification("✅ All poetry uploaded to IPFS! Ready for minting.", 'success');
    }
    
    return uris;
    
  } catch (error) {
    console.error("❌ IPFS upload failed:", error);
    
    if (typeof showCyberNotification === 'function') {
      showCyberNotification("❌ IPFS upload failed. Please try again.", 'error');
    }
    
    throw error;
  }
}

// Connect wallet and upload metadata
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
    
    // Switch to Polygon
    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: "0x89" }]
      });
    } catch (switchError) {
      if (switchError.code === 4902) {
        await window.ethereum.request({
          method: 'wallet_addEthereumChain',
          params: [{
            chainId: "0x89",
            chainName: 'Polygon',
            nativeCurrency: { name: 'Polygon', symbol: 'POL', decimals: 18 },
            rpcUrls: ['https://polygon-rpc.com/'],
            blockExplorerUrls: ['https://polygonscan.com/']
          }]
        });
      }
    }
    
    // Update state
    window.atuona.connected = true;
    window.atuona.address = accounts[0];
    
    // Update UI
    const walletButton = document.querySelector('.wallet-status');
    if (walletButton) {
      walletButton.textContent = `${accounts[0].substring(0, 6)}...${accounts[0].substring(38)}`;
      walletButton.setAttribute('data-text', 'CONNECTED');
      walletButton.style.background = '#4CAF50';
    }
    
    console.log("✅ Wallet connected:", accounts[0]);
    
    // Upload metadata if not already done
    if (Object.keys(window.atuona.metadataUris).length === 0) {
      await uploadAllMetadata();
    }
    
    if (typeof showCyberNotification === 'function') {
      showCyberNotification("✅ Ready for FREE minting!", 'success');
    } else {
      alert("✅ Wallet Connected!\nReady for FREE Soul Fragment collection!");
    }
    
  } catch (error) {
    console.error("❌ Connection failed:", error);
    alert(`❌ Connection failed: ${error.message}`);
  }
}

// FREE MINTING with thirdweb IPFS
async function mintNFT(poemId, poemTitle) {
  console.log(`🔥 FREE IPFS Minting: ${poemTitle} (${poemId})`);
  
  if (!window.atuona.connected) {
    await connectWallet();
    return;
  }
  
  try {
    // Get IPFS URI for this poem
    const metadataURI = window.atuona.metadataUris[poemId];
    if (!metadataURI) {
      throw new Error("Metadata not uploaded yet. Please wait and try again.");
    }
    
    console.log("📄 Using IPFS URI:", metadataURI);
    
    // Show loading notification
    if (typeof showCyberNotification === 'function') {
      showCyberNotification("🔄 Minting Soul Fragment for FREE...", 'info');
    }
    
    // Use simple ethers.js call with IPFS URI
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();
    
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
    
    const contractInstance = new ethers.Contract(
      "0x8551EA2F46ee54A4AB2175bDb75ad2ef369d6115",
      contractABI,
      signer
    );
    
    // FREE MINT with IPFS URI
    const tx = await contractInstance.mintTo(window.atuona.address, metadataURI, {
      gasLimit: 300000
    });
    
    console.log("⏳ FREE mint with IPFS sent:", tx.hash);
    
    const receipt = await tx.wait();
    
    if (receipt.status === 1) {
      console.log("✅ Soul Fragment collected with IPFS!", receipt.transactionHash);
      
      if (typeof showCyberNotification === 'function') {
        showCyberNotification("✅ Soul Fragment Collected for FREE!", 'success');
      } else {
        alert(`✅ Soul Fragment Collected for FREE!\n\nTransaction: ${receipt.transactionHash}`);
      }
      
      // Update button
      const buttons = document.querySelectorAll('.nft-action');
      buttons.forEach(button => {
        if (button.onclick && button.onclick.toString().includes(poemId)) {
          button.textContent = 'COLLECTED ✅';
          button.style.background = '#4CAF50';
          button.onclick = () => window.open(`https://polygonscan.com/tx/${receipt.transactionHash}`, '_blank');
        }
      });
    }
    
  } catch (error) {
    console.error("❌ IPFS minting failed:", error);
    
    let message = "❌ Free minting failed!";
    if (error.message.includes("Metadata not uploaded")) {
      message = "❌ Metadata still uploading. Please wait and try again.";
    } else if (error.message.includes("user rejected")) {
      message = "❌ Transaction cancelled by user.";
    }
    
    if (typeof showCyberNotification === 'function') {
      showCyberNotification(message, 'error');
    } else {
      alert(message);
    }
  }
}

// Make functions available
window.handleWalletConnection = connectWallet;
window.mintPoem = mintNFT;

// Initialize
document.addEventListener('DOMContentLoaded', function() {
  console.log("✅ ATUONA thirdweb IPFS Ready!");
});

console.log("🎭 ATUONA Gallery - thirdweb IPFS Solution Ready!");