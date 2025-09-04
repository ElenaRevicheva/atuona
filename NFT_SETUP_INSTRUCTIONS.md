# 🎭 ATUONA NFT Gallery - Complete Setup Instructions

## 🔥 Critical Fixes Applied

All thirdweb guidance has been implemented to fix the core issues:

### ✅ Issues Fixed
1. **getContract validation error - invalid address: undefined** → Fixed with strict validation
2. **TransactionError: Error - !Tokens** → Fixed with automated lazy-mint script  
3. **401 Unauthorized** → Fixed with proper client ID validation
4. **Transaction simulation** → Fixed with real sendTransaction implementation

## 🚀 Setup Steps

### Step 1: Get Your Thirdweb Secret Key
1. Go to [thirdweb dashboard](https://thirdweb.com/dashboard)
2. Navigate to **Settings** → **API Keys**
3. Create or copy your **Secret Key**

### Step 2: Configure Environment Variables
Edit `.env` file:
```bash
# Thirdweb Configuration
VITE_THIRDWEB_CLIENT_ID=602cfa7b8c0b862d35f7cfa61c961a38
VITE_CONTRACT_ADDRESS=0x9cD95Ad5e6A6DAdF206545E90895A2AEF11Ee4D8

# Backend Configuration (for lazy-minting script)
THIRDWEB_SECRET_KEY=your_actual_secret_key_here  # ← Replace this!
```

### Step 3: Install Dependencies
```bash
npm install
```

### Step 4: Run Automated Lazy-Mint Setup
```bash
npm run setup-nfts
```

This will:
- ✅ Lazy-mint 45 NFT poems to your contract
- ✅ Set FREE claim conditions (1 per wallet)
- ✅ Make NFTs immediately claimable by users

### Step 5: Deploy & Test
```bash
npm run build
```

## 🎭 What Users Will Experience

After setup completion:

1. **Visit website** → Beautiful underground design
2. **Click "Connect Wallet"** → MetaMask connection
3. **Navigate to "MINT"** → 6 poetry slots with claim buttons
4. **Click "CLAIM NFT"** → Real blockchain transaction
5. **Get NFT in wallet** → Free claiming (only gas fees)

## 📋 Contract Details

- **Network**: Polygon
- **Contract**: `0x9cD95Ad5e6A6DAdF206545E90895A2AEF11Ee4D8`
- **Type**: ERC721 Drop
- **Supply**: 45 Underground Poetry NFTs
- **Cost**: FREE (users only pay gas fees)
- **Limit**: 1 NFT per wallet

## 🔧 Technical Implementation

### Contract Address Validation
```javascript
const NFT_DROP_ADDRESS = import.meta.env.VITE_CONTRACT_ADDRESS || "0x9cD95Ad5e6A6DAdF206545E90895A2AEF11Ee4D8";

if (!NFT_DROP_ADDRESS || NFT_DROP_ADDRESS === "undefined") {
  throw new Error("Contract address is undefined!");
}
```

### Real Transaction Sending
```javascript
// Prepare transaction
const preparedTransaction = claimTo({
  contract,
  to: currentAccount.address,
  quantity: 1n,
});

// Send to blockchain
const result = await sendTransaction({
  transaction: preparedTransaction,
  account: currentAccount,
});
```

### Automated Lazy-Minting
```javascript
const lazyMintResult = await lazyMint({
  contract,
  metadatas: nftMetadatas, // 45 poems
});

const claimConditionsResult = await setClaimConditions({
  contract,
  phases: [{
    price: 0n, // FREE
    maxClaimablePerWallet: 1n,
    maxClaimableSupply: 45n,
    startTime: new Date(),
  }],
});
```

## 🎉 Result

Your underground poetry NFT gallery will be fully functional with real blockchain NFT claiming!

---

**Ready for real-world NFT claiming! 🎭🔥**