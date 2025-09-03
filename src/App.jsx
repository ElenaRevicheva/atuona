// ATUONA Gallery - React App with thirdweb's Exact ClaimButton Pattern
import { ThirdwebProvider, ConnectButton, useActiveAccount } from "thirdweb/react";
import { createThirdwebClient } from "thirdweb";
import { ClaimButton } from "thirdweb/react";
import { polygon } from "thirdweb/chains";

// Initialize client with clientId (thirdweb's exact pattern)
const client = createThirdwebClient({
  clientId: "602cfa7b8c0b862d35f7cfa61c961a38",
});

// Main app component (thirdweb's exact pattern)
function App() {
  const account = useActiveAccount();
  
  return (
    <div style={{ padding: '10px', fontSize: '14px' }}>
      <h3 style={{ margin: '0 0 15px 0', color: '#ff0066' }}>🎭 REAL NFT CLAIMING</h3>
      
      <div style={{ marginBottom: '15px' }}>
        <ConnectButton client={client} chain={polygon} />
      </div>
      
      {account && (
        <div style={{ marginBottom: '15px', fontSize: '12px' }}>
          ✅ Connected: {account.address.slice(0, 6)}...{account.address.slice(-4)}
        </div>
      )}
      
      <div style={{ marginBottom: '10px' }}>
        <ClaimButton
          client={client}
          contract={{
            address: "0x9cD95Ad5e6A6DAdF206545E90895A2AEF11Ee4D8",
            chain: polygon,
          }}
          quantity={1n}
          onTransactionSent={(result) => {
            console.log("✅ REAL transaction sent:", result.transactionHash);
            alert(`🎭 REAL Soul Fragment claimed!\n\nTransaction: ${result.transactionHash}\n\nCheck your wallet!`);
          }}
          onTransactionConfirmed={(receipt) => {
            console.log("✅ Transaction confirmed:", receipt.transactionHash);
          }}
          onError={(error) => {
            console.error("❌ Claim failed:", error);
            alert(`Claiming failed: ${error.message}`);
          }}
        >
          🔥 CLAIM REAL NFT
        </ClaimButton>
      </div>
      
      <div style={{ fontSize: '11px', opacity: 0.8 }}>
        <div>📋 45 NFTs ready</div>
        <div>🔗 Polygon Network</div>
        <div>💎 FREE (gas only)</div>
      </div>
    </div>
  );
}

// App with ThirdwebProvider (thirdweb's exact pattern)
export default function WrappedApp() {
  return (
    <ThirdwebProvider>
      <App />
    </ThirdwebProvider>
  );
}