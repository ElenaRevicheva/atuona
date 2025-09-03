// ATUONA Gallery - Following thirdweb's EXACT Step-by-Step Guidance
console.log("🔥 ATUONA thirdweb Exact Workflow Loading...");

import {
  createThirdwebClient,
  getContract,
} from "thirdweb";
import { upload } from "thirdweb/storage";
import { lazyMint, setClaimConditions } from "thirdweb/extensions/erc721";
import { ClaimButton } from "thirdweb/react";
import { polygon } from "thirdweb/chains";

// Step 1: Initialize client (thirdweb's exact pattern)
const client = createThirdwebClient({
  clientId: "602cfa7b8c0b862d35f7cfa61c961a38", // Your exact clientId
});

// Step 2: Get contract (thirdweb's exact pattern)
const contract = getContract({
  client,
  address: "0x9cD95Ad5e6A6DAdF206545E90895A2AEF11Ee4D8",
  chain: polygon,
});

// Step 3: Prepare 45 metadata files (thirdweb's exact format)
const metadataFiles = [];
for (let i = 1; i <= 45; i++) {
  metadataFiles.push({
    name: `Underground Poem #${i.toString().padStart(3, '0')}`,
    description: `ATUONA Gallery of Moments - Underground Poem ${i}. Raw, unfiltered poetry preserved on blockchain. Free collection - true to underground values.`,
    image: `https://atuona.xyz/images/poem-${i.toString().padStart(3, '0')}.png`
  });
}

// Step 4: Automated workflow (thirdweb's exact steps)
async function executeThirdwebWorkflow() {
  try {
    console.log("📤 Step 1: Batch uploading metadata to IPFS...");
    
    // Upload all metadata to IPFS (thirdweb's exact method)
    const uris = await upload({
      client,
      files: metadataFiles,
    });
    
    console.log("✅ Metadata uploaded to IPFS!");
    console.log("📋 Base URI:", uris[0].split('/').slice(0, -1).join('/'));
    
    console.log("🎯 Step 2: Lazy minting all 45 NFTs...");
    
    // Lazy mint all 45 NFTs (thirdweb's exact pattern)
    await lazyMint({
      contract,
      metadatas: uris.map(uri => ({ uri })),
    });
    
    console.log("✅ Lazy minting completed!");
    
    console.log("⚙️ Step 3: Setting free claim conditions...");
    
    // Set free claim conditions (thirdweb's exact pattern)
    await setClaimConditions({
      contract,
      phases: [
        {
          price: 0n,
          maxClaimablePerWallet: 0n, // unlimited
          start: new Date(),
        },
      ],
    });
    
    console.log("✅ Free claim conditions set!");
    console.log("🎉 thirdweb Workflow Complete!");
    console.log("🎭 Your underground poetry gallery is LIVE!");
    
    return { success: true };
    
  } catch (error) {
    console.error("❌ thirdweb workflow failed:", error);
    return { success: false, error: error.message };
  }
}

// Global state for simple wallet tracking
window.atuona = {
  connected: false,
  address: null
};

// Simple wallet connection
async function connectWallet() {
  console.log("🔗 Connecting wallet...");
  
  if (!window.ethereum) {
    alert("❌ Please install MetaMask!");
    return;
  }
  
  try {
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
    alert("✅ Wallet Connected!\nReady for NFT claiming!");
    
  } catch (error) {
    console.error("❌ Connection failed:", error);
    alert(`❌ Connection failed: ${error.message}`);
  }
}

// Step 5: Claim button functionality (thirdweb's exact pattern)
async function mintNFT(poemId, poemTitle) {
  console.log(`🔥 Claiming NFT: ${poemTitle} (${poemId})`);
  
  if (!window.atuona.connected) {
    await connectWallet();
    return;
  }
  
  // For now, show that claiming is ready
  // The actual ClaimButton component would handle the real claiming
  alert(`🎭 Ready to claim "${poemTitle}"!\n\nIn a React implementation, this would use:\n<ClaimButton contract={{address: "0x9cD95Ad5e6A6DAdF206545E90895A2AEF11Ee4D8", chain: polygon}} quantity={1} />`);
}

// Make functions available
window.handleWalletConnection = connectWallet;
window.mintPoem = mintNFT;

// Initialize and run thirdweb's exact workflow
document.addEventListener('DOMContentLoaded', async function() {
  console.log("✅ ATUONA thirdweb Workflow Ready!");
  
  // Run thirdweb's exact workflow if not completed
  if (!localStorage.getItem('thirdweb-workflow-complete')) {
    console.log("🚀 Executing thirdweb's exact workflow...");
    
    const result = await executeThirdwebWorkflow();
    if (result.success) {
      localStorage.setItem('thirdweb-workflow-complete', 'true');
      alert("🎉 thirdweb Workflow Complete!\nYour NFT Drop is ready for claiming!");
    } else {
      console.log("❌ Workflow failed:", result.error);
    }
  } else {
    console.log("✅ thirdweb workflow already completed");
  }
});

console.log("🎭 ATUONA Gallery - thirdweb Exact Workflow Ready!");