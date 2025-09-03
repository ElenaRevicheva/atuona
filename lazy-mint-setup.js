// ATUONA Gallery - Automated Lazy Mint and Claim Setup
import {
  createThirdwebClient,
  getContract,
} from "thirdweb";
import { upload } from "thirdweb/storage";
import { lazyMint, setClaimConditions } from "thirdweb/extensions/erc721";
import { polygon } from "thirdweb/chains";
import fs from 'fs';
import path from 'path';

// Initialize thirdweb client with your credentials
const client = createThirdwebClient({
  clientId: "602cfa7b8c0b862d35f7cfa61c961a38",
  // You'll need to add secretKey for server operations
  // secretKey: "YOUR_SECRET_KEY", // Add this for lazy minting
});

// Your NFT Drop contract
const contract = getContract({
  client,
  address: "0x9cD95Ad5e6A6DAdF206545E90895A2AEF11Ee4D8",
  chain: polygon,
});

async function setupNFTDrop() {
  try {
    console.log("🎭 Starting ATUONA NFT Drop setup...");
    
    // 1. Load all metadata files
    console.log("📋 Loading metadata files...");
    const metadataFiles = [];
    
    for (let i = 1; i <= 45; i++) {
      const id = i.toString().padStart(3, '0');
      const filePath = path.join('./metadata', `${id}.json`);
      
      if (fs.existsSync(filePath)) {
        const metadata = JSON.parse(fs.readFileSync(filePath, 'utf8'));
        metadataFiles.push(metadata);
        console.log(`✅ Loaded ${id}.json`);
      }
    }
    
    console.log(`📤 Uploading ${metadataFiles.length} metadata files to IPFS...`);
    
    // 2. Upload all metadata to IPFS
    const uris = await upload({
      client,
      files: metadataFiles,
    });
    
    console.log("✅ All metadata uploaded to IPFS!");
    console.log("📋 IPFS URIs:", uris);
    
    // 3. Lazy mint all 45 NFTs
    console.log("🎯 Lazy minting all 45 NFTs...");
    
    const lazyMintResult = await lazyMint({
      contract,
      metadatas: uris.map(uri => ({ uri })),
    });
    
    console.log("✅ Lazy minting completed!", lazyMintResult);
    
    // 4. Set FREE claim conditions
    console.log("⚙️ Setting FREE claim conditions...");
    
    const claimResult = await setClaimConditions({
      contract,
      phases: [
        {
          price: 0n, // FREE
          maxClaimablePerWallet: 0n, // Unlimited
          start: new Date(),
        },
      ],
    });
    
    console.log("✅ FREE claim conditions set!", claimResult);
    
    console.log("🎉 ATUONA NFT Drop setup complete!");
    console.log("🎭 Your underground poetry gallery is ready for FREE claiming!");
    
  } catch (error) {
    console.error("❌ Setup failed:", error);
    console.log("📋 Error details:", error.message);
  }
}

// Run setup
setupNFTDrop();