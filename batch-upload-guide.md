# 📤 BATCH UPLOAD GUIDE FOR NFT DROP

## 🎯 AFTER YOU DEPLOY NFT DROP CONTRACT

### 1. 📋 PREPARE FOR BATCH UPLOAD

**You'll have:**
- ✅ New NFT Drop contract address
- ✅ 45 metadata JSON files in `/metadata` folder
- ✅ thirdweb CLI ready

### 2. 🚀 BATCH UPLOAD COMMANDS

**Install thirdweb CLI (if not installed):**
```bash
npm install -g @thirdweb-dev/cli
```

**Upload all metadata to IPFS:**
```bash
npx thirdweb upload ./metadata
```

**This will return:**
- Array of IPFS URIs for each poem
- Upload hash for the entire collection

### 3. 🎭 LAZY MINT ALL 45 NFTS

**In thirdweb dashboard:**
1. Go to your new NFT Drop contract
2. Click "Lazy Mint" tab
3. Paste the IPFS URIs from step 2
4. Confirm lazy minting (creates 45 claimable NFTs)

### 4. ⚙️ SET CLAIM CONDITIONS

**Configure FREE claiming:**
```
Price: 0 POL (FREE)
Max per wallet: 1 (or unlimited)
Start: Immediate  
End: Never
Allowlist: None (public)
```

### 5. 🔄 UPDATE WEBSITE

**Replace in `/src/main.js`:**
```javascript
const NFT_DROP_CONTRACT = "YOUR_NEW_CONTRACT_ADDRESS"; // Update this line
```

### 6. 🧪 TEST CLAIMING

**Expected flow:**
1. User connects wallet
2. User clicks "COLLECT SOUL" 
3. Claims specific poem NFT for FREE
4. NFT appears in their wallet

## 🎯 ADVANTAGES OF NFT DROP

- ✅ **True public claiming** - No AccessControl restrictions
- ✅ **FREE minting** - Set price to 0
- ✅ **Lazy minting** - Upload once, users claim individually
- ✅ **Built for drops** - Designed exactly for this use case
- ✅ **Easy management** - Dashboard controls everything

## 🔥 RESULT

**Perfect underground poetry gallery with bulletproof FREE claiming!** 🎭