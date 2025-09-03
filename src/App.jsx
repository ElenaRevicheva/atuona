// src/App.jsx - thirdweb's EXACT working example with ThirdwebProvider
import { ThirdwebProvider } from "thirdweb/react";
import ClaimPoem from "./ClaimPoem";

function App() {
  return (
    <div>
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