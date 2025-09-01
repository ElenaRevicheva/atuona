// ATUONA Gallery of Moments - WORKING Multi-Wallet Solution (No Complex Dependencies)
console.log("🔥 ATUONA Blockchain module loading...");

// Simple working state
window.atuonaState = {
  isConnected: false,
  userAddress: null,
  contractAddress: "0x8551EA2F46ee54A4AB2175bDb75ad2ef369d6115",
  provider: null,
  walletType: null
};

// Multi-wallet connection that works with any Node version
window.handleWalletConnection = async function() {
  console.log("🔗 Wallet connection clicked!");
  
  try {
    // Detect available wallets
    const availableWallets = [];
    let walletOptions = "Choose your wallet:\n";
    
    // Check MetaMask
    if (typeof window.ethereum !== 'undefined' && window.ethereum.isMetaMask) {
      availableWallets.push({ id: "1", name: "MetaMask", provider: window.ethereum });
      walletOptions += "1 = MetaMask\n";
    }
    
    // Check Phantom
    if (typeof window.phantom !== 'undefined' && window.phantom.ethereum) {
      availableWallets.push({ id: "2", name: "Phantom", provider: window.phantom.ethereum });
      walletOptions += "2 = Phantom\n";
    }
    
    // Check Coinbase
    if (typeof window.ethereum !== 'undefined' && window.ethereum.isCoinbaseWallet) {
      availableWallets.push({ id: "3", name: "Coinbase", provider: window.ethereum });
      walletOptions += "3 = Coinbase Wallet\n";
    }
    
    // Always offer WalletConnect for mobile
    availableWallets.push({ id: "9", name: "WalletConnect", provider: null });
    walletOptions += "9 = WalletConnect (Mobile wallets: Trust, Rainbow, etc.)";
    
    if (availableWallets.length === 1) {
      // Only WalletConnect available
      walletOptions = "No desktop wallets detected.\nPress OK for WalletConnect (mobile wallets)";
    }
    
    const choice = prompt(walletOptions, "1");
    const selectedWallet = availableWallets.find(w => w.id === choice);
    
    if (!selectedWallet) {
      throw new Error("Invalid wallet selection");
    }
    
    let provider;
    let accounts;
    let walletName = selectedWallet.name;
    
    if (selectedWallet.id === "9") {
      // WalletConnect for mobile wallets
      if (typeof showCyberNotification === 'function') {
        showCyberNotification("📱 Opening WalletConnect - scan QR code with your mobile wallet...");
      } else {
        alert("📱 Opening WalletConnect - scan QR code with your mobile wallet...");
      }
      
      // Simple WalletConnect without complex imports
      const wcProvider = new (await import('https://unpkg.com/@walletconnect/web3-provider@1.8.0/dist/umd/index.min.js')).default({
        rpc: { 137: "https://polygon-rpc.com/" },
        chainId: 137,
        qrcode: true,
      });
      
      await wcProvider.enable();
      provider = wcProvider;
      accounts = wcProvider.accounts;
    } else {
      // Desktop wallet (MetaMask, Phantom, Coinbase)
      provider = selectedWallet.provider;
      
      if (typeof showCyberNotification === 'function') {
        showCyberNotification(`🔗 Connecting to ${walletName}...`);
      } else {
        alert(`🔗 Connecting to ${walletName}...`);
      }
      
      accounts = await provider.request({ method: 'eth_requestAccounts' });
      
      // Switch to Polygon
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
    
    const userAddress = accounts[0];
    
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