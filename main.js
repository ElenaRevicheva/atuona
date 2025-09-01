// ATUONA Gallery of Moments - FINAL WORKING Solution
console.log("🔥 ATUONA Blockchain module loading...");

// Simple state
window.atuonaState = {
  isConnected: false,
  userAddress: null,
  contractAddress: "0x8551EA2F46ee54A4AB2175bDb75ad2ef369d6115",
  provider: null
};

// WORKING wallet connection for MetaMask and Phantom
window.handleWalletConnection = async function() {
  console.log("🔗 Wallet connection clicked!");
  
  try {
    let provider;
    let walletName;
    
    // Detect available wallets
    if (typeof window.phantom !== 'undefined' && window.phantom.ethereum) {
      const choice = confirm("Choose wallet:\nOK = Phantom\nCancel = MetaMask");
      if (choice) {
        provider = window.phantom.ethereum;
        walletName = "Phantom";
        console.log("👻 Using Phantom wallet");
      } else {
        provider = window.ethereum;
        walletName = "MetaMask";
        console.log("🦊 Using MetaMask");
      }
    } else if (typeof window.ethereum !== 'undefined') {
      provider = window.ethereum;
      walletName = "MetaMask";
      console.log("🦊 Using MetaMask");
    } else {
      throw new Error("No wallet found. Please install MetaMask or Phantom.");
    }
    
    if (typeof showCyberNotification === 'function') {
      showCyberNotification(`🔗 Connecting to ${walletName}...`);
    } else {
      alert(`🔗 Connecting to ${walletName}...`);
    }
    
    // Connect wallet
    const accounts = await provider.request({ method: 'eth_requestAccounts' });
    const userAddress = accounts[0];
    
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
    
    // Save state
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

// WORKING minting function
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
    
    // Simple transaction to contract
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