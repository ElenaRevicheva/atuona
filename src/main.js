// ATUONA Gallery - NFT Drop with Automated Setup
console.log("🔥 ATUONA NFT Drop Loading...");

// Import automated setup (no IPFS upload needed)
import { setupWithDirectMetadata } from "./automated-nft-setup.js";

import {
  createThirdwebClient,
  getContract,
} from "thirdweb";
import { claimTo, totalSupply, ownerOf, getNFT } from "thirdweb/extensions/erc721";
import { polygon } from "thirdweb/chains";

// Initialize thirdweb client with correct clientId
const client = createThirdwebClient({
  clientId: "602cfa7b8c0b862d35f7cfa61c961a38", // Your client ID
});

// Your NFT Drop contract address
const NFT_DROP_CONTRACT = "0x9cD95Ad5e6A6DAdF206545E90895A2AEF11Ee4D8";

// Global state with loading prevention
window.atuona = {
  connected: false,
  address: null,
  contract: null,
  isConnecting: false,
  isClaiming: false
};

// Connect wallet - Fixed to prevent multiple calls
async function connectWallet() {
  // Prevent multiple connection attempts
  if (window.atuona.isConnecting) {
    console.log("⏳ Connection already in progress...");
    return;
  }
  
  console.log("🔗 Connecting wallet...");
  window.atuona.isConnecting = true;
  
  if (!window.ethereum) {
    alert("❌ Please install MetaMask!");
    window.atuona.isConnecting = false;
    return;
  }
  
  try {
    // Single wallet connection request
    const [userAddress] = await window.ethereum.request({
      method: "eth_requestAccounts",
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
    
    // Get NFT Drop contract
    const contract = getContract({
      client,
      address: NFT_DROP_CONTRACT,
      chain: polygon,
    });
    
    // Update state
    window.atuona.connected = true;
    window.atuona.address = userAddress;
    window.atuona.contract = contract;
    window.atuona.isConnecting = false;
    
    // Update UI
    const walletButton = document.querySelector('.wallet-status');
    if (walletButton) {
      walletButton.textContent = `${userAddress.substring(0, 6)}...${userAddress.substring(38)}`;
      walletButton.setAttribute('data-text', 'CONNECTED');
      walletButton.style.background = '#4CAF50';
    }
    
    console.log("✅ Wallet connected:", userAddress);
    
    if (typeof showCyberNotification === 'function') {
      showCyberNotification("✅ Ready for FREE claiming!", 'success');
    } else {
      alert("✅ Wallet Connected!\nReady for FREE Soul Fragment claiming!");
    }
    
  } catch (error) {
    console.error("❌ Connection failed:", error);
    window.atuona.isConnecting = false;
    alert(`❌ Connection failed: ${error.message}`);
  }
}

// FREE claiming - Fixed to prevent BigInt errors and multiple calls
async function mintNFT(poemId, poemTitle) {
  // Prevent multiple claiming attempts
  if (window.atuona.isClaiming) {
    console.log("⏳ Claiming already in progress...");
    return;
  }
  
  console.log(`🔥 FREE Claiming: ${poemTitle} (${poemId})`);
  
  // Ensure wallet is connected first
  if (!window.atuona.connected || !window.atuona.contract || !window.atuona.address) {
    console.log("🔗 Wallet not connected, connecting first...");
    await connectWallet();
    if (!window.atuona.connected) {
      return; // Connection failed
    }
  }
  
  window.atuona.isClaiming = true;
  
  // Disable claim buttons during transaction
  const claimButtons = document.querySelectorAll('.nft-action');
  claimButtons.forEach(btn => {
    btn.disabled = true;
    btn.style.opacity = '0.5';
  });
  
  try {
    console.log("🔄 Claiming from NFT Drop...");
    
    if (typeof showCyberNotification === 'function') {
      showCyberNotification("🔄 Claiming Soul Fragment for FREE...", 'info');
    } else {
      alert("🔄 Claiming Soul Fragment for FREE!\nConfirm in wallet...");
    }
    
    // Simple claim transaction - no complex wallet creation
    const transaction = claimTo({
      contract: window.atuona.contract,
      to: window.atuona.address,
      quantity: 1n,
    });
    
    console.log("🔄 Transaction prepared:", transaction);
    console.log("🔍 Transaction type:", typeof transaction);
    console.log("🔍 Transaction keys:", Object.keys(transaction));
    console.log("🔄 Attempting to send...");
    
    // Use thirdweb's proper transaction sending method
    console.log("🔄 Using thirdweb transaction sending...");
    
    // Import sendTransaction from thirdweb
    const { sendTransaction } = await import("thirdweb");
    
    // Create account object for thirdweb
    const account = {
      address: window.atuona.address,
      async sendTransaction(tx) {
        // Use MetaMask to send
        const txHash = await window.ethereum.request({
          method: 'eth_sendTransaction',
          params: [{
            from: window.atuona.address,
            to: tx.to,
            data: tx.data,
            value: tx.value ? `0x${BigInt(tx.value).toString(16)}` : '0x0',
            gas: '0x493E0' // Fixed gas limit
          }]
        });
        
        // Wait for confirmation using ethers
        const provider = new ethers.BrowserProvider(window.ethereum);
        const receipt = await provider.waitForTransaction(txHash);
        
        return {
          transactionHash: receipt.hash,
          blockNumber: receipt.blockNumber,
          status: receipt.status
        };
      }
    };
    
    // Send transaction properly
    const result = await account.sendTransaction(transaction);
    
    console.log("✅ Transaction confirmed on blockchain!");
    console.log("📋 Transaction hash:", result.transactionHash);
    console.log("📋 Block number:", result.blockNumber);
    
    // Try to extract token ID from result
    if (result && result.logs) {
      const transferEvent = result.logs.find(log => 
        log.topics && log.topics[0] === '0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef'
      );
      if (transferEvent && transferEvent.topics[3]) {
        const tokenId = parseInt(transferEvent.topics[3], 16);
        console.log("🎭 TOKEN ID:", tokenId);
        console.log("📱 Import to MetaMask:");
        console.log("   Contract: 0x9cD95Ad5e6A6DAdF206545E90895A2AEF11Ee4D8");
        console.log("   Token ID:", tokenId);
        
        if (typeof showCyberNotification === 'function') {
          showCyberNotification(`✅ Token ID: ${tokenId} - Import to MetaMask!`, 'success');
        }
      }
    }
    
    // Get token ID safely
    try {
      const currentSupply = await totalSupply({ contract: window.atuona.contract });
      const supplyNumber = Number(currentSupply);
      
      console.log("📊 Total supply:", supplyNumber);
      
      if (supplyNumber > 0) {
        // Check the last few tokens to find user's NFT
        let userTokenId = null;
        
        // Check last 5 tokens
        for (let i = Math.max(0, supplyNumber - 5); i < supplyNumber; i++) {
          try {
            const owner = await ownerOf({ contract: window.atuona.contract, tokenId: BigInt(i) });
            console.log(`🔍 Token ${i} owner:`, owner);
            
            if (owner.toLowerCase() === window.atuona.address.toLowerCase()) {
              userTokenId = i;
              console.log("🎭 FOUND YOUR TOKEN ID:", userTokenId);
              break;
            }
          } catch (e) {
            console.log(`Token ${i} not found or error:`, e.message);
          }
        }
        
        if (userTokenId !== null) {
          console.log("📱 MetaMask Import Info:");
          console.log("   Contract: 0x9cD95Ad5e6A6DAdF206545E90895A2AEF11Ee4D8");
          console.log("   Token ID:", userTokenId);
          console.log("   Network: Polygon Mainnet");
          console.log("   Owner:", window.atuona.address);
          
          if (typeof showCyberNotification === 'function') {
            showCyberNotification(`✅ Token ID: ${userTokenId} - Import to MetaMask!`, 'success');
          } else {
            alert(`✅ Soul Fragment Collected!\n\nMetaMask Import:\nContract: 0x9cD95Ad5e6A6DAdF206545E90895A2AEF11Ee4D8\nToken ID: ${userTokenId}\nNetwork: Polygon`);
          }
          
          updateMintButton(poemId, `token-${userTokenId}`);
        } else {
          console.log("⏳ Token not found yet, may need to wait for indexing");
          
          if (typeof showCyberNotification === 'function') {
            showCyberNotification("✅ Soul Fragment Collected! Check wallet in a moment.", 'success');
          } else {
            alert("✅ Soul Fragment Collected!\nNFT should appear in your wallet shortly.\nTry importing after a minute.");
          }
          
          updateMintButton(poemId, "claimed");
        }
      } else {
        console.log("📊 No tokens minted yet, supply is 0");
        
        if (typeof showCyberNotification === 'function') {
          showCyberNotification("✅ Soul Fragment Collected! Wait for indexing.", 'success');
        } else {
          alert("✅ Soul Fragment Collected!\nWait a moment for blockchain indexing.");
        }
        
        updateMintButton(poemId, "claimed");
      }
      
    } catch (error) {
      console.log("Could not verify token ownership:", error);
      
      // Provide general import info
      console.log("📱 General MetaMask Import Info:");
      console.log("   Contract: 0x9cD95Ad5e6A6DAdF206545E90895A2AEF11Ee4D8");
      console.log("   Network: Polygon");
      console.log("   Try token IDs: 0, 1, 2, 3, 4...");
      
      if (typeof showCyberNotification === 'function') {
        showCyberNotification("✅ Soul Fragment Collected for FREE!", 'success');
      } else {
        alert("✅ Soul Fragment Collected!\nTry importing with token IDs 0, 1, 2, etc.");
      }
      
      updateMintButton(poemId, "claimed");
    }
    
  } catch (error) {
    console.error("❌ Claiming failed:", error);
    
    let message = "❌ Free claiming failed!";
    if (error.message && error.message.includes("user rejected")) {
      message = "❌ Transaction cancelled by user.";
    } else if (error.message && error.message.includes("insufficient funds")) {
      message = "❌ Insufficient POL for gas fees.";
    } else if (error.message && error.message.includes("No active claim condition")) {
      message = "❌ Claim conditions not set yet. Please complete setup first.";
    } else if (error.message && error.message.includes("Already processing")) {
      message = "⏳ Please wait for current transaction to complete.";
    } else {
      message = `❌ Claiming failed: ${error.message}`;
    }
    
    if (typeof showCyberNotification === 'function') {
      showCyberNotification(message, 'error');
    } else {
      alert(message);
    }
  } finally {
    // Re-enable claim buttons
    window.atuona.isClaiming = false;
    const claimButtons = document.querySelectorAll('.nft-action');
    claimButtons.forEach(btn => {
      btn.disabled = false;
      btn.style.opacity = '1';
    });
  }
}

// Update button after successful claim
function updateMintButton(poemId, txHash) {
  const buttons = document.querySelectorAll('.nft-action');
  buttons.forEach(button => {
    if (button.onclick && button.onclick.toString().includes(poemId)) {
      button.textContent = 'COLLECTED ✅';
      button.style.background = '#4CAF50';
      button.style.cursor = 'pointer';
      button.disabled = true; // Prevent re-claiming
      if (txHash && txHash !== "claimed") {
        button.onclick = () => window.open(`https://polygonscan.com/tx/${txHash}`, '_blank');
      }
    }
  });
}

// Make functions globally available
window.handleWalletConnection = connectWallet;
window.mintPoem = mintNFT;

// Initialize with automated setup
document.addEventListener('DOMContentLoaded', async function() {
  console.log("✅ ATUONA NFT Drop Ready!");
  
  // Force setup check - clear cache if supply is 0
  const currentSupply = await totalSupply({ 
    contract: getContract({
      client,
      address: NFT_DROP_CONTRACT, 
      chain: polygon
    })
  });
  
  console.log("📊 Current contract supply:", Number(currentSupply));
  
  // If supply is 0, force setup regardless of cache
  if (Number(currentSupply) === 0) {
    console.log("🔄 Supply is 0, forcing setup...");
    localStorage.removeItem('atuona-setup-complete'); // Clear cache
  }
  
  // Check if automated setup is needed
  if (!localStorage.getItem('atuona-setup-complete')) {
    console.log("🚀 Running direct metadata setup...");
    console.log("📋 Contract address:", NFT_DROP_CONTRACT);
    
    try {
      const setupResult = await setupWithDirectMetadata();
      console.log("📋 Setup result:", setupResult);
      
      if (setupResult.success) {
        localStorage.setItem('atuona-setup-complete', 'true');
        console.log("🎉 Direct setup completed!");
        
        // Wait a moment for blockchain indexing
        console.log("⏳ Waiting for blockchain indexing...");
        setTimeout(async () => {
          try {
            const newSupply = await totalSupply({ 
              contract: getContract({ client, address: NFT_DROP_CONTRACT, chain: polygon })
            });
            console.log("📊 Updated supply after setup:", Number(newSupply));
          } catch (e) {
            console.log("Could not check updated supply:", e.message);
          }
        }, 5000); // Wait 5 seconds
        
        if (typeof showCyberNotification === 'function') {
          showCyberNotification("🎉 Underground Gallery is LIVE! FREE claiming enabled!", 'success');
        } else {
          alert("🎉 Setup Complete!\nUsers can now claim poetry NFTs for FREE!");
        }
      } else {
        console.log("❌ Setup failed:", setupResult.error);
        console.log("📋 You may need to complete setup manually in thirdweb dashboard");
      }
    } catch (error) {
      console.log("❌ Setup error:", error);
      console.log("📋 Manual setup may be required");
    }
  } else {
    console.log("✅ Setup already completed (cached)");
  }
  
  // Add status indicator
  const status = document.createElement('div');
  status.style.cssText = `
    position: fixed;
    bottom: 20px;
    right: 20px;
    background: rgba(0,0,0,0.9);
    color: #fff;
    padding: 10px;
    border-radius: 5px;
    font-size: 11px;
    z-index: 1000;
    font-family: monospace;
    border: 1px solid #333;
  `;
  status.innerHTML = `
    🎭 ATUONA Gallery<br>
    📦 NFT Drop: ${NFT_DROP_CONTRACT.substring(0, 8)}...<br>
    🔗 Polygon Network<br>
    💎 FREE Collection (Gas Only)<br>
    🎯 Claim-Based Minting
  `;
  document.body.appendChild(status);
});

console.log("🎭 ATUONA Gallery - NFT Drop Claim Solution Ready!");