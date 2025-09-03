// ATUONA Gallery - React Entry Point (thirdweb's exact pattern)
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';

console.log("🔥 ATUONA React + thirdweb Loading...");

ReactDOM.createRoot(document.getElementById('react-nft-app')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

console.log("✅ ATUONA React + thirdweb Ready!");