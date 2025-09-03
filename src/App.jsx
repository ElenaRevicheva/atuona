// src/App.jsx - thirdweb's EXACT working example with ThirdwebProvider
import { ThirdwebProvider } from "thirdweb/react";
import ClaimPoem from "./ClaimPoem";

function App() {
  return (
    <div>
      <h1>ATUONA Underground Poetry Gallery</h1>
      <ClaimPoem />
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