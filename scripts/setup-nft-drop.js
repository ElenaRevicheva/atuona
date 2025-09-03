// ATUONA NFT Drop Setup Script - thirdweb's EXACT Backend Pattern
// Run this script locally with: node scripts/setup-nft-drop.js

import {
  createThirdwebClient,
  getContract,
} from "thirdweb";
import {
  lazyMint,
  setClaimConditions,
} from "thirdweb/extensions/erc721";
import { polygon } from "thirdweb/chains";

// Use secretKey for backend scripts (thirdweb's exact guidance)
const client = createThirdwebClient({
  secretKey: "YOUR_SECRET_KEY", // You need to add your secret key here
  // Alternative: Use clientId if secretKey not available
  clientId: "602cfa7b8c0b862d35f7cfa61c961a38",
});

const contract = getContract({
  client,
  address: "0x9cD95Ad5e6A6DAdF206545E90895A2AEF11Ee4D8",
  chain: polygon,
});

async function setupNFTDrop() {
  try {
    console.log("🎭 Starting thirdweb's exact NFT Drop setup...");
    
    // Step 1: Lazy mint all 45 NFTs (replace YOUR_BASE_URI with actual IPFS URI)
    console.log("🎯 Lazy minting 45 NFTs...");
    
    await lazyMint({
      contract,
      metadatas: Array.from({ length: 45 }, (_, i) => ({
        uri: `ipfs://YOUR_BASE_URI/${i + 1}.json`, // Replace with actual IPFS base URI
      })),
    });
    
    console.log("✅ Lazy minting completed!");
    
    // Step 2: Set free, public claim conditions (thirdweb's exact pattern)
    console.log("⚙️ Setting free claim conditions...");
    
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
    console.log("🎉 NFT Drop setup complete!");
    console.log("🎭 Your underground poetry gallery is ready for claiming!");
    
  } catch (error) {
    console.error("❌ Setup failed:", error);
    console.log("Error details:", error.message);
  }
}

// Run the setup
setupNFTDrop();