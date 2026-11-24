// src/App.jsx - thirdweb's EXACT working example with ThirdwebProvider
import { ThirdwebProvider } from "thirdweb/react";
import ClaimPoem from "./ClaimPoem";

// The floating "REAL NFT CLAIMING" box. Its ClaimButton was wired with props this
// thirdweb version does not read (contract={{address}} instead of contractAddress +
// chain + claimParams), so it threw "getContract ... invalid address: undefined" on
// every load and never rendered. Fixed 24 Nov 2026; kept OFF by Elena's choice -
// minting runs through each fragment's claim button and CONNECT WALLET (src/main.js).
// Set to true to show the box.
const SHOW_CLAIM_PANEL = false;

function App() {
  return (
    <div>
      {SHOW_CLAIM_PANEL && <ClaimPoem />}
    </div>
  );
}

export default function WrappedApp() {
  return (
    <ThirdwebProvider>
      <App />
    </ThirdwebProvider>
  );
}