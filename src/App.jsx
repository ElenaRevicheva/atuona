// ATUONA Gallery - React App with thirdweb's Exact ClaimButton Pattern
import { ThirdwebProvider, ConnectButton, useActiveAccount } from "thirdweb/react";
import { createThirdwebClient, getContract } from "thirdweb";
import { ClaimButton } from "thirdweb/react";
import { polygon } from "thirdweb/chains";

// Initialize client with clientId (thirdweb's exact pattern)
const client = createThirdwebClient({
  clientId: "602cfa7b8c0b862d35f7cfa61c961a38",
});

// Contract configuration (thirdweb's exact pattern)
const contract = getContract({
  client,
  address: "0x9cD95Ad5e6A6DAdF206545E90895A2AEF11Ee4D8",
  chain: polygon,
});

// Individual poem claiming component (thirdweb's exact pattern)
function PoemClaimButton({ poemId, poemTitle }) {
  const account = useActiveAccount();
  
  return (
    <div className="poem-claim-container">
      <h3>{poemTitle} (#{poemId})</h3>
      {account ? (
        <ClaimButton
          contract={contract}
          quantity={1n}
          onTransactionSent={(result) => {
            console.log("✅ Real transaction sent:", result.transactionHash);
            alert(`🎭 Soul Fragment claimed!\n\nPoem: ${poemTitle}\nTransaction: ${result.transactionHash}\n\nCheck your wallet!`);
          }}
          onTransactionConfirmed={(receipt) => {
            console.log("✅ Transaction confirmed:", receipt.transactionHash);
          }}
        >
          COLLECT SOUL
        </ClaimButton>
      ) : (
        <ConnectButton client={client} chain={polygon} />
      )}
    </div>
  );
}

// Main app component (thirdweb's exact pattern)
function App() {
  const account = useActiveAccount();
  
  return (
    <div className="react-nft-overlay">
      <div className="wallet-section">
        <h2>🎭 ATUONA Underground Gallery</h2>
        <ConnectButton client={client} chain={polygon} />
        {account && (
          <p>✅ Connected: {account.address.slice(0, 6)}...{account.address.slice(-4)}</p>
        )}
      </div>
      
      <div className="nft-claiming-section">
        <h3>🔥 Claim Your Poetry NFTs (FREE)</h3>
        <div className="poems-grid">
          <PoemClaimButton poemId="001" poemTitle="На память" />
          <PoemClaimButton poemId="002" poemTitle="To Beautrix" />
          <PoemClaimButton poemId="003" poemTitle="Atuona" />
          {/* Add more poems as needed */}
        </div>
      </div>
      
      <div className="contract-info">
        <p>📋 Contract: 0x9cD95Ad5e6A6DAdF206545E90895A2AEF11Ee4D8</p>
        <p>🔗 Network: Polygon</p>
        <p>💎 45 NFTs ready for claiming</p>
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