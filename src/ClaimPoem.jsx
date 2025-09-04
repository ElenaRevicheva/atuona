// src/ClaimPoem.jsx - thirdweb's EXACT working example
import { createThirdwebClient } from "thirdweb";
import { ConnectButton, ClaimButton } from "thirdweb/react";
import { polygon } from "thirdweb/chains";

// Create the client ONCE at the top level
const client = createThirdwebClient({
  clientId: import.meta.env.VITE_THIRDWEB_CLIENT_ID || "602cfa7b8c0b862d35f7cfa61c961a38",
});

// Contract address as constant (thirdweb's exact pattern)
const CONTRACT_ADDRESS = import.meta.env.VITE_CONTRACT_ADDRESS || "0x9cD95Ad5e6A6DAdF206545E90895A2AEF11Ee4D8";

export default function ClaimPoem() {
  // Validate contract address
  const isValidAddress = typeof CONTRACT_ADDRESS === 'string' && 
                        CONTRACT_ADDRESS !== "undefined" && 
                        /^0x[a-fA-F0-9]{40}$/.test(CONTRACT_ADDRESS);
  
  // Log contract info for debugging
  console.log("🎭 ClaimPoem - Contract Address:", CONTRACT_ADDRESS);
  console.log("🎭 ClaimPoem - Is Valid:", isValidAddress);

  return (
    <div
      style={{
        position: 'fixed',
        bottom: '20px',
        right: '20px',
        background: 'rgba(0,0,0,0.9)',
        border: '2px solid #ff0066',
        borderRadius: '10px',
        padding: '15px',
        color: 'white',
        fontFamily: 'JetBrains Mono, monospace',
        fontSize: '12px',
        maxWidth: '300px',
        zIndex: 10000,
        textAlign: "center",
      }}
    >
      <h3 style={{ margin: '0 0 10px 0', fontSize: '14px' }}>🎭 REAL NFT CLAIMING</h3>
      {/* Wallet Connect Button */}
      <ConnectButton client={client} />

      {/* NFT Claim Button */}
      {isValidAddress ? (
        <ClaimButton
          client={client}
          contract={{
            address: CONTRACT_ADDRESS,
            chain: polygon,
          }}
          quantity={1}
          onClaimed={(result) => {
            alert(
              `NFT claimed! Tx hash: ${result.transactionHash}`,
            );
          }}
          onError={(error) => {
            alert(`Claim failed: ${error.message}`);
          }}
          style={{ marginTop: "10px", fontSize: "12px" }}
        />
      ) : (
        <div style={{ marginTop: "10px", fontSize: "12px", color: "#ff6666" }}>
          Contract address not configured. Please set VITE_CONTRACT_ADDRESS.
        </div>
      )}
    </div>
  );
}