# 🎭 Manual NFT Setup Guide

Since the automated lazy-mint script requires additional wallet setup, here's how to manually populate your contract with NFTs using the thirdweb dashboard:

## 🚀 Option 1: Thirdweb Dashboard (Recommended)

### Step 1: Go to Your Contract
1. Visit [thirdweb dashboard](https://thirdweb.com/dashboard)
2. Navigate to your contract: `0x9cD95Ad5e6A6DAdF206545E90895A2AEF11Ee4D8`

### Step 2: Lazy Mint NFTs
1. Click **"NFTs"** tab
2. Click **"Lazy Mint"** 
3. Upload metadata for your 45 poems or use batch upload
4. Set quantity to 45
5. Click **"Lazy Mint NFTs"**

### Step 3: Set Claim Conditions
1. Click **"Claim Conditions"** tab
2. Click **"Add Phase"**
3. Set:
   - **Price**: 0 (FREE)
   - **Max per wallet**: 1
   - **Start time**: Now
4. Click **"Save Claim Conditions"**

## 🚀 Option 2: Use Direct Script (Advanced)

If you want to use the automated script, you need your wallet's private key:

### Step 1: Get Your Private Key
⚠️ **SECURITY WARNING**: Never share or commit private keys!

1. Open MetaMask
2. Go to Account Details → Export Private Key
3. Copy the private key

### Step 2: Add to Environment
```bash
# Add to .env (DO NOT COMMIT THIS!)
ADMIN_PRIVATE_KEY=your_private_key_here
```

### Step 3: Run Direct Script
```bash
node direct-lazy-mint.js
```

## 🎯 Verification

After either method:
1. Check your contract in thirdweb dashboard
2. You should see 45 NFTs available for claiming
3. Claim conditions should show "FREE" with 1 per wallet limit

## 🎭 Result

Users can then visit your website and claim NFT poems for free (only gas fees)!

---

**For security, we recommend using the thirdweb dashboard method.** 🔒