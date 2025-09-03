// ATUONA Gallery - thirdweb's EXACT ClaimButton Implementation
import { ClaimButton } from "thirdweb/react";
import { polygon } from "thirdweb/chains";

// thirdweb's exact ClaimButton pattern
export function ClaimPoem({ poemId, poemTitle }) {
  return (
    <div className="claim-container">
      <h3>🎭 {poemTitle} #{poemId}</h3>
      <ClaimButton
        contract={{
          address: "0x9cD95Ad5e6A6DAdF206545E90895A2AEF11Ee4D8",
          chain: polygon,
        }}
        quantity={1}
        style={{
          background: '#4CAF50',
          color: 'white',
          border: 'none',
          padding: '10px 20px',
          borderRadius: '5px',
          cursor: 'pointer',
          fontFamily: 'monospace'
        }}
      >
        COLLECT SOUL
      </ClaimButton>
    </div>
  );
}