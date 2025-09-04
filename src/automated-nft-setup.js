// ATUONA Gallery - Fully Automated NFT Drop Setup (No Manual Work)
console.log("🤖 ATUONA Automated Setup Loading...");

import {
  createThirdwebClient,
  getContract,
} from "thirdweb";
import { lazyMint, setClaimConditions } from "thirdweb/extensions/erc721";
import { polygon } from "thirdweb/chains";
import dotenv from 'dotenv';

// Load env when running via Node (ignored in browser)
try { dotenv.config(); } catch {}

// Client with your credentials
const client = createThirdwebClient({
  clientId: import.meta?.env?.VITE_THIRDWEB_CLIENT_ID ?? process.env.VITE_THIRDWEB_CLIENT_ID,
});

// Contract address with validation
const NFT_DROP_ADDRESS = import.meta?.env?.VITE_CONTRACT_ADDRESS ?? process.env.VITE_CONTRACT_ADDRESS;

// Validate contract address before using it
if (!NFT_DROP_ADDRESS || NFT_DROP_ADDRESS === "undefined") {
  throw new Error("NFT Drop contract address is not set! Please set VITE_CONTRACT_ADDRESS environment variable.");
}

// Your NFT Drop contract
const contract = getContract({
  client,
  address: NFT_DROP_ADDRESS,
  chain: polygon,
});

// All 45 poems with DIRECT metadata (no IPFS upload needed)
const directMetadata = [];

// Generate all 45 poems with embedded metadata
for (let i = 1; i <= 45; i++) {
  const id = i.toString().padStart(3, '0');
  
  // Create data URI with embedded metadata (no external upload needed)
  const metadata = {
    name: `Underground Poem #${id}`,
    description: `ATUONA Gallery of Moments - Underground Poem ${id}. Raw, unfiltered poetry preserved on blockchain. Free collection - true to underground values. Part of the 45-piece collection spanning addiction recovery, family trauma, spiritual rebellion, and human consciousness.`,
    image: `https://atuona.xyz/images/poem-${id}.png`,
    attributes: [
      { trait_type: "Poem", value: `Underground Poem ${id}` },
      { trait_type: "ID", value: id },
      { trait_type: "Collection", value: "GALLERY OF MOMENTS" },
      { trait_type: "Type", value: "Free Underground Poetry" },
      { trait_type: "Language", value: "Mixed" },
      { trait_type: "Year", value: "2019-2025" }
    ]
  };
  
  // Create data URI (no IPFS needed!)
  const dataUri = `data:application/json;charset=utf-8,${encodeURIComponent(JSON.stringify(metadata))}`;
  directMetadata.push({ uri: dataUri });
}

// AUTOMATED SETUP FUNCTION (No external uploads)
export async function setupWithDirectMetadata() {
  try {
    console.log("🎭 Starting DIRECT metadata setup...");
    
    // Step 1: Lazy mint with direct metadata URIs (no IPFS upload)
    console.log("🎯 Lazy minting 45 NFTs with direct metadata...");
    
    const lazyMintResult = await lazyMint({
      contract,
      metadatas: directMetadata,
    });
    
    console.log("✅ Lazy minting completed!");
    
    // Step 2: Set FREE claim conditions
    console.log("⚙️ Setting FREE claim conditions...");
    
    const claimResult = await setClaimConditions({
      contract,
      phases: [
        {
          price: 0n, // Completely FREE
          maxClaimablePerWallet: 1n, // 1 per wallet
          start: new Date(),
          // No end date - always available
        },
      ],
    });
    
    console.log("✅ FREE claim conditions set!");
    console.log("🎉 AUTOMATED SETUP COMPLETE!");
    console.log("🎭 Your underground poetry gallery is LIVE!");
    
    return { success: true };
    
  } catch (error) {
    console.error("❌ Direct setup failed:", error);
    
    // If direct metadata fails, try simpler approach
    if (error.message.includes("NFTMetadataInvalidUrl")) {
      console.log("🔄 Trying fallback setup...");
      return await setupWithSimpleMetadata();
    }
    
    return { success: false, error: error.message };
  }
}

// Fallback setup with minimal metadata
async function setupWithSimpleMetadata() {
  try {
    console.log("🔄 Using simple metadata approach...");
    
    // Create minimal metadata for each NFT
    const simpleMetadata = [];
    for (let i = 1; i <= 45; i++) {
      const id = i.toString().padStart(3, '0');
      simpleMetadata.push({
        uri: `https://atuona.xyz/metadata/${id}.json` // Simple HTTPS URIs
      });
    }
    
    await lazyMint({
      contract,
      metadatas: simpleMetadata,
    });
    
    await setClaimConditions({
      contract,
      phases: [{ price: 0n, maxClaimablePerWallet: 1n, start: new Date() }],
    });
    
    console.log("✅ Simple setup completed!");
    return { success: true };
    
  } catch (error) {
    console.error("❌ Simple setup also failed:", error);
    return { success: false, error: error.message };
  }
}