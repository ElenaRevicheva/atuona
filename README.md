# 🎭 ATUONA Underground NFT Gallery

**Revolutionary Digital Art • Blockchain Poetry • Soul Fragments**

A beautiful underground aesthetic website where users can claim free NFT poems directly from your deployed thirdweb NFT Drop contract.

## 🚀 Quick Start

### 1. Configure Environment
Copy `.env` and add your thirdweb secret key:
```bash
# Get secret key from: https://thirdweb.com/dashboard/settings/api-keys
THIRDWEB_SECRET_KEY=your_secret_key_here
```

### 2. Setup NFT Contract
```bash
npm install
npm run setup-nfts
```

### 3. Deploy Website
```bash
npm run build
```

## 🎯 Features

- ✅ **Free NFT claiming** (users only pay gas fees)
- ✅ **Real blockchain transactions** on Polygon
- ✅ **MetaMask wallet integration**
- ✅ **Beautiful underground aesthetic**
- ✅ **45 unique poetry NFTs**
- ✅ **1 NFT per wallet limit**

## 📋 Contract Details

- **Network**: Polygon
- **Contract**: `0x9cD95Ad5e6A6DAdF206545E90895A2AEF11Ee4D8`
- **Type**: ERC721 Drop (thirdweb)
- **Supply**: 45 Underground Poetry NFTs

## 🎭 User Experience

1. **Visit website** → Underground aesthetic loads
2. **Connect wallet** → MetaMask integration
3. **Navigate to MINT** → 6 poetry slots displayed
4. **Click "CLAIM NFT"** → Real blockchain transaction
5. **Get NFT in wallet** → Free (only gas fees)

## 🛠️ Technical Stack

- **Frontend**: Vite + React + Vanilla JS
- **Blockchain**: Polygon network
- **NFT Standard**: ERC721 Drop
- **Wallet**: thirdweb SDK + MetaMask
- **Deployment**: Fleek.xyz
- **Styling**: Custom CSS (underground aesthetic)

## 🔧 Development

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Setup NFT contract (one-time)
npm run setup-nfts
```

## 📁 Project Structure

```
├── src/
│   ├── main.js          # Main wallet & claiming logic
│   ├── main.jsx         # React app entry point
│   ├── App.jsx          # React app wrapper
│   └── ClaimPoem.jsx    # NFT claiming component
├── index.html           # Main website with gallery
├── automated-lazy-mint.js # NFT setup script
├── .env                 # Environment configuration
└── package.json         # Dependencies & scripts
```

## 🎉 Result

A fully functional underground poetry NFT gallery where any user with any wallet can claim free NFT poems through real blockchain transactions.

---

**Built with 🎭 for the underground poetry community**