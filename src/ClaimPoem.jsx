// src/ClaimPoem.jsx - thirdweb's EXACT working example
import { createThirdwebClient } from "thirdweb";
import { ConnectButton, ClaimButton } from "thirdweb/react";
import { polygon } from "thirdweb/chains";

// Create the client ONCE at the top level
const client = createThirdwebClient({
  clientId: "602cfa7b8c0b862d35f7cfa61c961a38", // Your actual clientId
});

export default function ClaimPoem() {
  return (
    <div
      style={{
        maxWidth: 400,
        margin: "2rem auto",
        textAlign: "center",
      }}
    >
      <h2>Claim Your Poetry NFT</h2>
      {/* Wallet Connect Button */}
      <ConnectButton client={client} />

      {/* NFT Claim Button */}
      <ClaimButton
        client={client}
        contract={{
          address:
            "0x9cD95Ad5e6A6DAdF206545E90895A2AEF11Ee4D8", // Your NFT Drop contract address
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
        style={{ marginTop: "2rem" }}
      />
    </div>
  );
}