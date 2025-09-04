#!/usr/bin/env node

// ATUONA NFT Contract Setup Script
// This script automatically sets up your NFT Drop contract with 45 poems

console.log(`
╔══════════════════════════════════════════════════════════════╗
║  🎭 ATUONA NFT CONTRACT SETUP                                ║
║                                                              ║
║  This script will automatically:                            ║
║  • Lazy-mint 45 underground poetry NFTs                     ║
║  • Set FREE claim conditions (1 per wallet)                 ║
║  • Make NFTs immediately claimable                          ║
║                                                              ║
║  Requirements:                                               ║
║  • THIRDWEB_SECRET_KEY in .env file                         ║
║  • Contract deployed at specified address                   ║
╚══════════════════════════════════════════════════════════════╝
`);

import { automatedLazyMintSetup } from './automated-lazy-mint.js';

// Run the setup
automatedLazyMintSetup()
  .then(result => {
    if (result.success) {
      console.log(`
╔══════════════════════════════════════════════════════════════╗
║  🎉 SUCCESS! NFT CONTRACT SETUP COMPLETE                    ║
║                                                              ║
║  ✅ ${result.mintedCount} NFT poems are now claimable                   ║
║  ✅ FREE claiming enabled (only gas fees)                   ║
║  ✅ 1 NFT per wallet limit set                              ║
║                                                              ║
║  🚀 Your website is ready for real NFT claiming!           ║
║  🎭 Users can now claim underground poetry NFTs!           ║
╚══════════════════════════════════════════════════════════════╝
      `);
    } else {
      console.error(`
╔══════════════════════════════════════════════════════════════╗
║  ❌ SETUP FAILED                                            ║
║                                                              ║
║  Error: ${result.error}
║                                                              ║
║  Please check:                                               ║
║  • THIRDWEB_SECRET_KEY is set in .env                      ║
║  • Contract address is correct                              ║
║  • You have permission to modify the contract              ║
╚══════════════════════════════════════════════════════════════╝
      `);
      process.exit(1);
    }
  })
  .catch(error => {
    console.error(`
╔══════════════════════════════════════════════════════════════╗
║  ❌ SCRIPT EXECUTION FAILED                                 ║
║                                                              ║
║  ${error.message}
║                                                              ║
║  Please check your .env configuration and try again.       ║
╚══════════════════════════════════════════════════════════════╝
    `);
    process.exit(1);
  });