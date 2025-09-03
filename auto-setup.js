// ATUONA Gallery - FULLY AUTOMATED NFT DROP SETUP
// This script will automatically upload metadata, lazy mint, and set claim conditions

import {
  createThirdwebClient,
  getContract,
} from "thirdweb";
import { upload } from "thirdweb/storage";
import { lazyMint, setClaimConditions } from "thirdweb/extensions/erc721";
import { polygon } from "thirdweb/chains";

// Initialize client
const client = createThirdwebClient({
  clientId: "602cfa7b8c0b862d35f7cfa61c961a38",
});

// Your NFT Drop contract
const contract = getContract({
  client,
  address: "0x9cD95Ad5e6A6DAdF206545E90895A2AEF11Ee4D8",
  chain: polygon,
});

// All 45 poems metadata (embedded directly in code)
const allPoemsMetadata = [
  {
    name: "На память #001",
    description: "ATUONA Gallery of Moments - На память. Underground poetry preserved on blockchain. Free collection - true to underground values. Memory, loss, and the brutal machinery of existence.",
    image: "https://atuona.xyz/images/poem-001.png",
    attributes: [
      { trait_type: "Poem", value: "На память" },
      { trait_type: "ID", value: "001" },
      { trait_type: "Collection", value: "GALLERY OF MOMENTS" },
      { trait_type: "Type", value: "Free Underground Poetry" },
      { trait_type: "Language", value: "Russian" }
    ]
  },
  {
    name: "To Beautrix #002",
    description: "ATUONA Gallery of Moments - To Beautrix. Underground poetry preserved on blockchain. Free collection - true to underground values. Passionate dedication exploring love, desire, and human connection.",
    image: "https://atuona.xyz/images/poem-002.png",
    attributes: [
      { trait_type: "Poem", value: "To Beautrix" },
      { trait_type: "ID", value: "002" },
      { trait_type: "Collection", value: "GALLERY OF MOMENTS" },
      { trait_type: "Type", value: "Free Underground Poetry" },
      { trait_type: "Language", value: "English" }
    ]
  },
  {
    name: "Atuona #003",
    description: "ATUONA Gallery of Moments - Atuona. Underground poetry preserved on blockchain. Free collection - true to underground values. Artistic exile and creative rebellion, named after Gauguin's final village.",
    image: "https://atuona.xyz/images/poem-003.png",
    attributes: [
      { trait_type: "Poem", value: "Atuona" },
      { trait_type: "ID", value: "003" },
      { trait_type: "Collection", value: "GALLERY OF MOMENTS" },
      { trait_type: "Type", value: "Free Underground Poetry" },
      { trait_type: "Language", value: "Mixed" }
    ]
  }
  // Add remaining 42 poems...
];

// Generate remaining poems metadata
for (let i = 4; i <= 45; i++) {
  const id = i.toString().padStart(3, '0');
  allPoemsMetadata.push({
    name: `Underground Poem #${id}`,
    description: `ATUONA Gallery of Moments - Underground Poem ${id}. Raw, unfiltered poetry preserved on blockchain. Free collection - true to underground values.`,
    image: `https://atuona.xyz/images/poem-${id}.png`,
    attributes: [
      { trait_type: "Poem", value: `Underground Poem ${id}` },
      { trait_type: "ID", value: id },
      { trait_type: "Collection", value: "GALLERY OF MOMENTS" },
      { trait_type: "Type", value: "Free Underground Poetry" },
      { trait_type: "Language", value: "Mixed" }
    ]
  });
}

// AUTOMATED SETUP FUNCTION
export async function autoSetupNFTDrop() {
  try {
    console.log("🎭 Starting AUTOMATED ATUONA NFT Drop setup...");
    
    // Step 1: Upload all metadata to IPFS
    console.log("📤 Step 1: Uploading 45 metadata files to IPFS...");
    const uris = await upload({
      client,
      files: allPoemsMetadata,
    });
    
    console.log(`✅ Uploaded ${uris.length} metadata files to IPFS!`);
    console.log("📋 IPFS URIs:", uris.slice(0, 3), "...");
    
    // Step 2: Lazy mint all 45 NFTs
    console.log("🎯 Step 2: Lazy minting all 45 NFTs...");
    const lazyMintResult = await lazyMint({
      contract,
      metadatas: uris.map(uri => ({ uri })),
    });
    
    console.log("✅ Lazy minting completed!");
    console.log("📋 Lazy mint result:", lazyMintResult);
    
    // Step 3: Set FREE claim conditions
    console.log("⚙️ Step 3: Setting FREE claim conditions...");
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
    console.log("📋 Claim conditions result:", claimResult);
    
    // Step 4: Success notification
    console.log("🎉 AUTOMATED SETUP COMPLETE!");
    console.log("🎭 Your underground poetry gallery is LIVE!");
    console.log("💎 Users can now claim NFTs for FREE (gas only)!");
    
    return {
      success: true,
      uris,
      lazyMintResult,
      claimResult
    };
    
  } catch (error) {
    console.error("❌ Automated setup failed:", error);
    return {
      success: false,
      error: error.message
    };
  }
}

// Auto-run setup when this module loads (if in browser)
if (typeof window !== 'undefined') {
  // Run setup automatically
  autoSetupNFTDrop().then(result => {
    if (result.success) {
      alert("🎉 ATUONA NFT Drop setup complete!\nUsers can now claim poetry NFTs for FREE!");
    } else {
      alert(`❌ Setup failed: ${result.error}`);
    }
  });
}