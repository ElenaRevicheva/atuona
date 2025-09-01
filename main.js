// ATUONA Gallery of Moments - WORKING Multi-Wallet Solution
console.log("🔥 ATUONA Blockchain module loading...");

// Simple working state
window.atuonaState = {
  isConnected: false,
  userAddress: null,
  contractAddress: "0x8551EA2F46ee54A4AB2175bDb75ad2ef369d6115",
  provider: null,
  walletType: null
};

// Universal wallet connection that actually works
window.handleWalletConnection = async function() {
  console.log("🔗 Wallet connection clicked!");
  
  try {
    // Show wallet options
    const walletChoice = prompt(
      "Choose your wallet:\n" +
      "1 = MetaMask (Desktop)\n" +
      "2 = Phantom (Desktop)\n" +
      "3 = Mobile Wallets (Trust, Rainbow, Coinbase Mobile, etc.)\n" +
      "4 = Coinbase Extension",
      "1"
    );
    
    let provider;
    let accounts;
    let walletName;
    
    if (walletChoice === "1") {
      // MetaMask
      if (typeof window.ethereum !== 'undefined' && window.ethereum.isMetaMask) {
        provider = window.ethereum;
        walletName = "MetaMask";
        console.log("🦊 Using MetaMask");
      } else {
        throw new Error("MetaMask not found. Please install MetaMask extension.");
      }
    } else if (walletChoice === "2") {
      // Phantom
      if (typeof window.phantom !== 'undefined' && window.phantom.ethereum) {
        provider = window.phantom.ethereum;
        walletName = "Phantom";
        console.log("👻 Using Phantom");
      } else {
        throw new Error("Phantom not found. Please install Phantom extension.");
      }
    } else if (walletChoice === "3") {
      // Mobile wallets via WalletConnect
      if (typeof showCyberNotification === 'function') {
        showCyberNotification("📱 Opening WalletConnect for mobile wallets...");
      }
      
      // Simple WalletConnect implementation
      const WalletConnectProvider = (await import('https://unpkg.com/@walletconnect/web3-provider@1.8.0/dist/umd/index.min.js')).default;
      
      provider = new WalletConnectProvider({
        rpc: {
          137: "https://polygon-rpc.com/",
        },
        chainId: 137,
        qrcode: true,
      });
      
      await provider.enable();
      accounts = provider.accounts;
      walletName = "WalletConnect";
      console.log("📱 Using WalletConnect");
    } else if (walletChoice === "4") {
      // Coinbase Wallet
      if (typeof window.ethereum !== 'undefined' && window.ethereum.isCoinbaseWallet) {
        provider = window.ethereum;
        walletName = "Coinbase Wallet";
        console.log("🔵 Using Coinbase Wallet");
      } else {
        throw new Error("Coinbase Wallet not found. Please install Coinbase Wallet extension.");
      }
    } else {
      throw new Error("Invalid wallet selection.");
    }
    
    if (typeof showCyberNotification === 'function') {
      showCyberNotification(`🔗 Connecting ${walletName}...`);
    } else {
      alert(`🔗 Connecting ${walletName}...`);
    }
    
    // Get accounts (if not already set by WalletConnect)
    if (!accounts) {
      accounts = await provider.request({ method: 'eth_requestAccounts' });
    }
    
    const userAddress = accounts[0];
    
    // Switch to Polygon network (for injected wallets)
    if (walletChoice === "1" || walletChoice === "2" || walletChoice === "4") {
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
    
    // Save state
    window.atuonaState.isConnected = true;
    window.atuonaState.userAddress = userAddress;
    window.atuonaState.provider = provider;
    window.atuonaState.walletType = walletName;
    
    console.log("✅ Wallet connected:", userAddress);
    
    // Update UI
    const walletButton = document.querySelector('.wallet-status');
    if (walletButton) {
      walletButton.textContent = `Connected: ${userAddress.slice(0,6)}...${userAddress.slice(-4)}`;
      walletButton.style.color = 'var(--silver-grey)';
    }
    
    // Success message
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

// Working minting function
window.mintPoem = async function(poemId, poemTitle) {
  console.log(`🔥 Mint request: ${poemTitle} (#${poemId})`);
  
  try {
    if (!window.atuonaState.isConnected) {
      alert("🔗 Please connect your wallet first!");
      await window.handleWalletConnection();
      return;
    }
    
    if (typeof showCyberNotification === 'function') {
      showCyberNotification(`🔥 Minting "${poemTitle}" - Soul Fragment #${poemId}... Transaction in progress.`);
    } else {
      alert(`🔥 Minting "${poemTitle}"...`);
    }
    
    // Direct transaction to contract with minimal fee
    const txHash = await window.atuonaState.provider.request({
      method: 'eth_sendTransaction',
      params: [{
        to: window.atuonaState.contractAddress,
        from: window.atuonaState.userAddress,
        value: '0x38D7EA4C68000', // 0.001 ETH in hex
        gas: '0x30D40', // 200000 in hex
      }],
    });
    
    console.log("✅ Soul Fragment transaction sent:", txHash);
    
    const successMessage = `✅ Soul Fragment "${poemTitle}" collection initiated! Transaction: ${txHash.slice(0,10)}... Welcome to the underground.`;
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