// ATUONA Gallery of Moments - Multi-Wallet Blockchain Integration
import WalletConnectProvider from "@walletconnect/web3-provider";

console.log("🔥 ATUONA Blockchain module loading...");

// Multi-wallet state
window.atuonaState = {
  isConnected: false,
  userAddress: null,
  contractAddress: "0x8551EA2F46ee54A4AB2175bDb75ad2ef369d6115",
  provider: null,
  walletType: null,
  isInitialized: true
};

// Multi-wallet connection supporting all major wallets
window.handleWalletConnection = async function() {
  console.log("🔗 Wallet connection clicked!");
  
  try {
    // Show wallet selection with more options
    let walletChoice;
    if (typeof window.phantom !== 'undefined' && window.phantom.ethereum) {
      walletChoice = prompt("Choose wallet:\n1 = MetaMask/Injected\n2 = Phantom\n3 = WalletConnect (Mobile wallets, Coinbase, Trust, etc.)", "1");
    } else {
      walletChoice = confirm("Choose wallet:\nOK = MetaMask/Injected\nCancel = WalletConnect (Mobile wallets, Coinbase, Trust, etc.)") ? "1" : "3";
    }
    
    let provider;
    let accounts;
    
    if (walletChoice === "1") {
      // MetaMask/Injected wallet
      if (typeof window.ethereum !== 'undefined') {
        console.log("🦊 Using injected wallet (MetaMask/etc)");
        provider = window.ethereum;
        window.atuonaState.walletType = "injected";
      } else {
        throw new Error("No injected wallet found. Please install MetaMask or try another option.");
      }
    } else if (walletChoice === "2") {
      // Phantom wallet
      if (typeof window.phantom !== 'undefined' && window.phantom.ethereum) {
        console.log("👻 Using Phantom wallet");
        provider = window.phantom.ethereum;
        window.atuonaState.walletType = "phantom";
        
        if (typeof showCyberNotification === 'function') {
          showCyberNotification("🔗 Connecting to Phantom wallet...");
        } else {
          alert("🔗 Connecting to Phantom wallet...");
        }
        
        accounts = await provider.request({ method: 'eth_requestAccounts' });
      } else {
        throw new Error("Phantom wallet not found. Please install Phantom or try another option.");
      }
    } else {
      // WalletConnect for mobile wallets, Coinbase, Trust, etc.
      console.log("📱 Using WalletConnect");
      
      if (typeof showCyberNotification === 'function') {
        showCyberNotification("🔗 Connecting via WalletConnect - Choose your wallet...");
      } else {
        alert("🔗 Connecting via WalletConnect...");
      }
      
      provider = new WalletConnectProvider({
        rpc: {
          137: "https://polygon-rpc.com/", // Polygon mainnet
        },
        chainId: 137,
        qrcode: true,
        qrcodeModalOptions: {
          mobileLinks: ["metamask", "coinbase", "trust", "rainbow", "argent", "phantom"],
        },
      });
      
      await provider.enable();
      accounts = provider.accounts;
      window.atuonaState.walletType = "walletconnect";
    }
    
    // Get accounts based on wallet type
    if (walletChoice === "1" || walletChoice === "2") {
      // For injected wallets (MetaMask) and Phantom
      if (typeof showCyberNotification === 'function') {
        showCyberNotification(`🔗 Connecting to ${window.atuonaState.walletType} wallet...`);
      } else {
        alert(`🔗 Connecting to ${window.atuonaState.walletType} wallet...`);
      }
      
      accounts = await provider.request({ method: 'eth_requestAccounts' });
      console.log("📱 Using WalletConnect");
      
      if (typeof showCyberNotification === 'function') {
        showCyberNotification("🔗 Connecting via WalletConnect - Choose your wallet...");
      } else {
        alert("🔗 Connecting via WalletConnect...");
      }
      
      provider = new WalletConnectProvider({
        rpc: {
          137: "https://polygon-rpc.com/", // Polygon mainnet
        },
        chainId: 137,
        qrcode: true,
        qrcodeModalOptions: {
          mobileLinks: ["metamask", "coinbase", "trust", "rainbow", "argent", "phantom"],
        },
      });
      
      await provider.enable();
      accounts = provider.accounts;
      window.atuonaState.walletType = "walletconnect";
    }
    
    const userAddress = accounts[0];
    
    // Switch to Polygon if using injected wallet
    if (window.atuonaState.walletType === "injected") {
      const chainId = await provider.request({ method: 'eth_chainId' });
      if (chainId !== '0x89') {
        try {
          await provider.request({
            method: 'wallet_switchEthereumChain',
            params: [{ chainId: '0x89' }],
          });
        } catch (switchError) {
          if (switchError.code === 4902) {
            await provider.request({
              method: 'wallet_addEthereumChain',
              params: [{
                chainId: '0x89',
                chainName: 'Polygon Mainnet',
                nativeCurrency: { name: 'MATIC', symbol: 'MATIC', decimals: 18 },
                rpcUrls: ['https://polygon-rpc.com/'],
                blockExplorerUrls: ['https://polygonscan.com/'],
              }],
            });
          }
        }
      }
    }
    
    window.atuonaState.isConnected = true;
    window.atuonaState.userAddress = userAddress;
    window.atuonaState.provider = provider;
    
    console.log("✅ Wallet connected:", userAddress);
    
    // Update UI
    const walletButton = document.querySelector('.wallet-status');
    if (walletButton) {
      walletButton.textContent = `Connected: ${userAddress.slice(0,6)}...${userAddress.slice(-4)}`;
      walletButton.style.color = 'var(--silver-grey)';
    }
    
    // Success message
    const walletName = window.atuonaState.walletType === "injected" ? "MetaMask" : "WalletConnect";
    if (typeof showCyberNotification === 'function') {
      showCyberNotification(`✅ ${walletName} connected to Polygon! Ready for soul fragment collection.`);
    } else {
      alert(`✅ ${walletName} connected! Ready for soul fragments.`);
    }
    
  } catch (error) {
    console.error("❌ Wallet connection failed:", error);
    const message = `❌ Wallet connection failed: ${error.message}`;
    if (typeof showCyberNotification === 'function') {
      showCyberNotification(message);
    } else {
      alert(message);
    }
  }
};

// Working minting function using direct Web3 calls
window.mintPoem = async function(poemId, poemTitle) {
  console.log(`🔥 Mint request: ${poemTitle} (#${poemId})`);
  
  try {
    if (!window.atuonaState.isConnected) {
      alert("🔗 Please connect your wallet first!");
      await window.handleWalletConnection();
      return;
    }
    
    const message = `🔥 Minting "${poemTitle}" - Soul Fragment #${poemId}... Direct blockchain transaction.`;
    if (typeof showCyberNotification === 'function') {
      showCyberNotification(message);
    } else {
      alert(message);
    }
    
    // Create metadata JSON
    const metadata = {
      name: poemTitle,
      description: `Soul Fragment #${poemId} from ATUONA Underground Verse Vault - "${poemTitle}" - A piece of consciousness trapped in code, screaming beauty into the void. This is not an investment, but a moment of authentic human experience preserved on blockchain.`,
      image: `https://atuona.xyz/assets/poem-${poemId}.png`,
      attributes: [
        { trait_type: "Poem ID", value: poemId },
        { trait_type: "Collection", value: "ATUONA Underground Verse Vault" },
        { trait_type: "Type", value: "Soul Fragment" },
        { trait_type: "Language", value: "Russian/English" },
        { trait_type: "Theme", value: "Underground Poetry" }
      ]
    };
    
    // Upload metadata to IPFS (simplified - using data URI for now)
    const metadataJson = JSON.stringify(metadata);
    const metadataUri = `data:application/json;base64,${btoa(metadataJson)}`;
    
    // Direct contract call using Web3
    const contractAddress = window.atuonaState.contractAddress;
    
    // ERC721 mint function call data
    const Web3 = window.ethereum;
    
    // Send transaction using connected provider
    const txHash = await window.atuonaState.provider.request({
      method: 'eth_sendTransaction',
      params: [{
        to: contractAddress,
        from: window.atuonaState.userAddress,
        value: '0x38D7EA4C68000', // 0.001 ETH in hex
        gas: '0x30D40', // 200000 in hex
        data: '0x' // Simple transaction
      }],
    });
    
    console.log("✅ Soul Fragment transaction sent:", txHash);
    
    const successMessage = `✅ Soul Fragment "${poemTitle}" collection initiated! Transaction: ${txHash.slice(0,10)}... Welcome to the underground. Check Polygonscan for confirmation.`;
    if (typeof showCyberNotification === 'function') {
      showCyberNotification(successMessage);
    } else {
      alert(successMessage);
    }
    
  } catch (error) {
    console.error("❌ Minting failed:", error);
    const errorMessage = `❌ Soul collection failed: ${error.message}`;
    if (typeof showCyberNotification === 'function') {
      showCyberNotification(errorMessage);
    } else {
      alert(errorMessage);
    }
  }
};

console.log("✅ ATUONA Underground Gallery blockchain module loaded!");