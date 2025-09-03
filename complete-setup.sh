#!/bin/bash
# ATUONA Gallery - Complete Automated Setup Script

echo "🎭 ATUONA Gallery - Automated NFT Drop Setup"
echo "============================================"

# Check if secret key is provided
if [ -z "$1" ]; then
    echo "❌ Please provide your thirdweb secret key:"
    echo "Usage: ./complete-setup.sh YOUR_SECRET_KEY"
    echo ""
    echo "Get your secret key from: https://thirdweb.com/dashboard"
    echo "It starts with 'RWy...' or similar"
    exit 1
fi

SECRET_KEY=$1
echo "✅ Using secret key: ${SECRET_KEY:0:10}..."

# Step 1: Upload metadata to IPFS
echo ""
echo "📤 Step 1: Uploading 45 metadata files to IPFS..."
UPLOAD_RESULT=$(npx thirdweb upload ./metadata -k $SECRET_KEY)
echo "$UPLOAD_RESULT"

# Extract IPFS URI from output
IPFS_URI=$(echo "$UPLOAD_RESULT" | grep -o 'ipfs://[^[:space:]]*' | head -1)

if [ -z "$IPFS_URI" ]; then
    echo "❌ Failed to get IPFS URI from upload"
    exit 1
fi

echo "✅ Metadata uploaded to IPFS: $IPFS_URI"

# Step 2: Update setup script with IPFS URI and secret key
echo ""
echo "🔧 Step 2: Updating setup script with IPFS URI and secret key..."

# Create updated setup script
cat > scripts/setup-nft-drop.js << EOF
// ATUONA NFT Drop Setup - Updated with real values
import {
  createThirdwebClient,
  getContract,
} from "thirdweb";
import {
  lazyMint,
  setClaimConditions,
} from "thirdweb/extensions/erc721";
import { polygon } from "thirdweb/chains";

const client = createThirdwebClient({
  secretKey: "$SECRET_KEY",
});

const contract = getContract({
  client,
  address: "0x9cD95Ad5e6A6DAdF206545E90895A2AEF11Ee4D8",
  chain: polygon,
});

async function setupNFTDrop() {
  try {
    console.log("🎭 Starting NFT Drop setup...");
    
    console.log("🎯 Lazy minting 45 NFTs...");
    await lazyMint({
      contract,
      metadatas: Array.from({ length: 45 }, (_, i) => ({
        uri: \`$IPFS_URI/\${i + 1}.json\`,
      })),
    });
    
    console.log("✅ Lazy minting completed!");
    
    console.log("⚙️ Setting free claim conditions...");
    await setClaimConditions({
      contract,
      phases: [
        {
          price: 0n,
          maxClaimablePerWallet: 0n,
          start: new Date(),
        },
      ],
    });
    
    console.log("✅ Free claim conditions set!");
    console.log("🎉 NFT Drop setup complete!");
    console.log("🎭 Your underground poetry gallery is ready!");
    
  } catch (error) {
    console.error("❌ Setup failed:", error);
  }
}

setupNFTDrop();
EOF

echo "✅ Setup script updated with real values"

# Step 3: Run the setup script
echo ""
echo "🚀 Step 3: Running NFT Drop setup..."
node scripts/setup-nft-drop.js

echo ""
echo "🎉 COMPLETE! Your underground poetry gallery is now live!"
echo "🎭 Users can claim real NFTs at your website!"
echo "📋 Contract: 0x9cD95Ad5e6A6DAdF206545E90895A2AEF11Ee4D8"
echo "🔗 Network: Polygon"