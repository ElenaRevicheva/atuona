// Direct Lazy-Mint Script - Actually sends transactions to blockchain
// This uses thirdweb v5 with proper account handling

import {
  createThirdwebClient,
  getContract,
  sendTransaction,
} from "thirdweb";
import { lazyMint, setClaimConditions } from "thirdweb/extensions/erc721";
import { polygon } from "thirdweb/chains";
import { privateKeyToAccount } from "thirdweb/wallets";
import dotenv from 'dotenv';

dotenv.config();

const CLIENT_ID = process.env.VITE_THIRDWEB_CLIENT_ID;
const SECRET_KEY = process.env.THIRDWEB_SECRET_KEY;
const CONTRACT_ADDRESS = process.env.VITE_CONTRACT_ADDRESS || "0x9cD95Ad5e6A6DAdF206545E90895A2AEF11Ee4D8";

// For this to work, you need a wallet private key that owns/can modify the contract
const ADMIN_PRIVATE_KEY = process.env.ADMIN_PRIVATE_KEY;

if (!CLIENT_ID) {
  console.error("❌ VITE_THIRDWEB_CLIENT_ID is required");
  process.exit(1);
}

if (!SECRET_KEY) {
  console.error("❌ THIRDWEB_SECRET_KEY is required");
  process.exit(1);
}

if (!ADMIN_PRIVATE_KEY) {
  console.error(`
❌ ADMIN_PRIVATE_KEY is required to actually send transactions.

This should be the private key of the wallet that deployed the contract.
Add to .env:
ADMIN_PRIVATE_KEY=your_wallet_private_key_here

⚠️  SECURITY: Never commit private keys to git!
  `);
  process.exit(1);
}

console.log("🎭 Direct Lazy-Mint Setup");
console.log("📋 Contract:", CONTRACT_ADDRESS);

// Initialize client
const client = createThirdwebClient({
  clientId: CLIENT_ID,
  secretKey: SECRET_KEY,
});

// Create account from private key
const account = privateKeyToAccount({ 
  client, 
  privateKey: ADMIN_PRIVATE_KEY 
});

console.log("🔑 Admin account:", account.address);

// Get contract
const contract = getContract({
  client,
  address: CONTRACT_ADDRESS,
  chain: polygon,
});

// Simple metadata for testing
const testMetadata = [
  {
    name: "Test Poem #001",
    description: "Test NFT to verify minting works",
    image: "https://fast-yottabyte-noisy.on-fleek.app/images/poem-001.png",
  }
];

async function directLazyMint() {
  try {
    console.log("🚀 Starting direct lazy-mint...");
    
    // Prepare lazy mint transaction
    const lazyMintTx = lazyMint({
      contract,
      metadatas: testMetadata,
    });
    
    console.log("📤 Sending lazy-mint transaction...");
    
    // Send transaction with account
    const result = await sendTransaction({
      transaction: lazyMintTx,
      account: account,
    });
    
    console.log("✅ Transaction sent!");
    console.log("🎯 Transaction hash:", result.transactionHash);
    
    if (result.transactionHash) {
      console.log("🎉 SUCCESS! NFT lazy-minted to contract!");
      console.log("🔗 View on Polygonscan:", `https://polygonscan.com/tx/${result.transactionHash}`);
      
      // Now set claim conditions
      console.log("⚙️ Setting claim conditions...");
      
      const claimTx = setClaimConditions({
        contract,
        phases: [{
          price: 0n,
          maxClaimablePerWallet: 1n,
          startTime: new Date(),
        }],
      });
      
      const claimResult = await sendTransaction({
        transaction: claimTx,
        account: account,
      });
      
      console.log("✅ Claim conditions set!");
      console.log("🎯 Transaction hash:", claimResult.transactionHash);
      
    } else {
      console.error("❌ No transaction hash - minting failed");
    }
    
  } catch (error) {
    console.error("❌ Direct lazy-mint failed:", error);
    console.error("📋 Error details:", error.message);
  }
}

directLazyMint();