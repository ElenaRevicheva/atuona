// Automated Lazy-Mint Script for ATUONA Underground Poetry NFTs
// This script automatically populates your ERC721 Drop contract with 45 claimable NFT poems

import {
  createThirdwebClient,
  getContract,
} from "thirdweb";
import { lazyMint, setClaimConditions } from "thirdweb/extensions/erc721";
import { polygon } from "thirdweb/chains";
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Validate required environment variables
const SECRET_KEY = process.env.THIRDWEB_SECRET_KEY;
const CONTRACT_ADDRESS = process.env.VITE_CONTRACT_ADDRESS || "0x9cD95Ad5e6A6DAdF206545E90895A2AEF11Ee4D8";

if (!SECRET_KEY) {
  throw new Error("THIRDWEB_SECRET_KEY is required for automated setup. Get it from thirdweb dashboard.");
}

if (!CONTRACT_ADDRESS || CONTRACT_ADDRESS === "undefined") {
  throw new Error("Contract address is undefined! Please set VITE_CONTRACT_ADDRESS.");
}

console.log("🎭 ATUONA Automated Lazy-Mint Setup");
console.log("📋 Contract:", CONTRACT_ADDRESS);
console.log("🌐 Network: Polygon");

// Initialize client with secret key (for backend operations)
const client = createThirdwebClient({
  secretKey: SECRET_KEY,
});

// Get contract instance
const contract = getContract({
  client,
  address: CONTRACT_ADDRESS,
  chain: polygon,
});

// 45 Underground Poetry NFT Metadata
const nftMetadatas = [
  {
    name: "Digital Shadows #001",
    description: "ATUONA Gallery of Moments - Underground Poem 001. Raw, unfiltered poetry preserved on blockchain. Free collection - true to underground values.",
    image: "https://fast-yottabyte-noisy.on-fleek.app/images/poem-001.png",
    attributes: [
      { trait_type: "Poem", value: "Digital Shadows" },
      { trait_type: "ID", value: "001" },
      { trait_type: "Collection", value: "GALLERY OF MOMENTS" },
      { trait_type: "Type", value: "Free Underground Poetry" },
      { trait_type: "Theme", value: "Digital Consciousness" }
    ]
  },
  {
    name: "Underground Verses #002",
    description: "ATUONA Gallery of Moments - Underground Poem 002. Poetry from the depths of human experience.",
    image: "https://fast-yottabyte-noisy.on-fleek.app/images/poem-002.png",
    attributes: [
      { trait_type: "Poem", value: "Underground Verses" },
      { trait_type: "ID", value: "002" },
      { trait_type: "Collection", value: "GALLERY OF MOMENTS" },
      { trait_type: "Type", value: "Free Underground Poetry" },
      { trait_type: "Theme", value: "Raw Truth" }
    ]
  },
  {
    name: "Silver Lines #003",
    description: "ATUONA Gallery of Moments - Underground Poem 003. Finding light in darkness through verse.",
    image: "https://fast-yottabyte-noisy.on-fleek.app/images/poem-003.png",
    attributes: [
      { trait_type: "Poem", value: "Silver Lines" },
      { trait_type: "ID", value: "003" },
      { trait_type: "Collection", value: "GALLERY OF MOMENTS" },
      { trait_type: "Type", value: "Free Underground Poetry" },
      { trait_type: "Theme", value: "Hope" }
    ]
  },
  {
    name: "Neon Dreams #004",
    description: "ATUONA Gallery of Moments - Underground Poem 004. Electric visions of urban consciousness.",
    image: "https://fast-yottabyte-noisy.on-fleek.app/images/poem-004.png",
    attributes: [
      { trait_type: "Poem", value: "Neon Dreams" },
      { trait_type: "ID", value: "004" },
      { trait_type: "Collection", value: "GALLERY OF MOMENTS" },
      { trait_type: "Type", value: "Free Underground Poetry" },
      { trait_type: "Theme", value: "Urban Vision" }
    ]
  },
  {
    name: "Electric Poetry #005",
    description: "ATUONA Gallery of Moments - Underground Poem 005. Charged words from the underground scene.",
    image: "https://fast-yottabyte-noisy.on-fleek.app/images/poem-005.png",
    attributes: [
      { trait_type: "Poem", value: "Electric Poetry" },
      { trait_type: "ID", value: "005" },
      { trait_type: "Collection", value: "GALLERY OF MOMENTS" },
      { trait_type: "Type", value: "Free Underground Poetry" },
      { trait_type: "Theme", value: "Energy" }
    ]
  },
  {
    name: "Soul Fragments #006",
    description: "ATUONA Gallery of Moments - Underground Poem 006. Pieces of the human soul preserved in verse.",
    image: "https://fast-yottabyte-noisy.on-fleek.app/images/poem-006.png",
    attributes: [
      { trait_type: "Poem", value: "Soul Fragments" },
      { trait_type: "ID", value: "006" },
      { trait_type: "Collection", value: "GALLERY OF MOMENTS" },
      { trait_type: "Type", value: "Free Underground Poetry" },
      { trait_type: "Theme", value: "Soul" }
    ]
  }
];

// Generate remaining 39 poems (7-45) with procedural metadata
for (let i = 7; i <= 45; i++) {
  const id = i.toString().padStart(3, '0');
  const poemTitles = [
    "Broken Mirrors", "Street Wisdom", "Midnight Confessions", "Concrete Dreams",
    "Lost Frequencies", "Underground Anthem", "Rebel Hearts", "City Scars",
    "Neon Nights", "Digital Ghosts", "Raw Emotions", "Street Philosophy",
    "Underground Kings", "Broken Systems", "Truth Seekers", "Night Visions",
    "Urban Legends", "Digital Rebellion", "Soul Searching", "Street Poetry",
    "Underground Voices", "Neon Prophets", "Digital Warriors", "Street Dreams",
    "Underground Truth", "City Lights", "Digital Souls", "Street Wisdom",
    "Underground Fire", "Neon Poetry", "Digital Hearts", "Street Rebels",
    "Underground Dreams", "City Voices", "Digital Truth", "Street Legends",
    "Underground Spirit", "Neon Souls", "Digital Fire"
  ];
  
  const title = poemTitles[(i - 7) % poemTitles.length];
  
  nftMetadatas.push({
    name: `${title} #${id}`,
    description: `ATUONA Gallery of Moments - Underground Poem ${id}. Raw, unfiltered poetry preserved on blockchain. Free collection - true to underground values.`,
    image: `https://fast-yottabyte-noisy.on-fleek.app/images/poem-${id}.png`,
    attributes: [
      { trait_type: "Poem", value: title },
      { trait_type: "ID", value: id },
      { trait_type: "Collection", value: "GALLERY OF MOMENTS" },
      { trait_type: "Type", value: "Free Underground Poetry" },
      { trait_type: "Theme", value: "Underground Culture" }
    ]
  });
}

// Main automated setup function
async function automatedLazyMintSetup() {
  try {
    console.log("🚀 Starting Automated Lazy-Mint Setup...");
    console.log(`📝 Preparing ${nftMetadatas.length} NFT poems for minting...`);
    
    // Step 1: Lazy-mint all NFTs to the contract
    console.log("🎯 Lazy-minting NFTs to contract...");
    
    const lazyMintResult = await lazyMint({
      contract,
      metadatas: nftMetadatas,
    });
    
    console.log("✅ Lazy-minting completed!");
    console.log("🎭 Minted NFTs:", lazyMintResult);
    
    // Step 2: Set FREE claim conditions
    console.log("⚙️ Setting FREE claim conditions...");
    
    const claimConditionsResult = await setClaimConditions({
      contract,
      phases: [
        {
          price: 0n, // Completely FREE (only gas fees)
          maxClaimablePerWallet: 1n, // 1 NFT per wallet
          maxClaimableSupply: 45n, // Total of 45 NFTs available
          startTime: new Date(), // Available immediately
          // No end time - always available
        },
      ],
    });
    
    console.log("✅ FREE claim conditions set!");
    console.log("🎯 Claim conditions:", claimConditionsResult);
    
    console.log(`
    ╔══════════════════════════════════════════════════════════════╗
    ║  🎉 AUTOMATED SETUP COMPLETE!                                ║
    ║                                                              ║
    ║  ✅ 45 NFT Poems Lazy-Minted                                ║
    ║  ✅ FREE Claim Conditions Set                               ║
    ║  ✅ 1 NFT per wallet limit                                  ║
    ║  ✅ Available immediately                                   ║
    ║                                                              ║
    ║  🎭 Your Underground Poetry Gallery is LIVE!                ║
    ║  🔗 Contract: ${CONTRACT_ADDRESS.slice(0, 10)}...                        ║
    ║  🌐 Network: Polygon                                         ║
    ║  💎 Users can now claim NFTs for FREE!                      ║
    ╚══════════════════════════════════════════════════════════════╝
    `);
    
    return { success: true, mintedCount: nftMetadatas.length };
    
  } catch (error) {
    console.error("❌ Automated setup failed:", error);
    console.error("📋 Error details:", error.message);
    
    return { success: false, error: error.message };
  }
}

// Export for use in other scripts
export { automatedLazyMintSetup, nftMetadatas };

// Run automatically if this script is executed directly
if (typeof window === 'undefined') {
  // Running in Node.js environment
  automatedLazyMintSetup()
    .then(result => {
      if (result.success) {
        console.log("🎉 Setup completed successfully!");
        process.exit(0);
      } else {
        console.error("❌ Setup failed:", result.error);
        process.exit(1);
      }
    })
    .catch(error => {
      console.error("❌ Script execution failed:", error);
      process.exit(1);
    });
}