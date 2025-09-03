# 🎭 ATUONA NFT DROP SETUP GUIDE

## 🎯 GOAL
Deploy NFT Drop contract for **45 unique poetry NFTs** with **FREE public minting** directly from atuona.xyz

## 📋 STEP-BY-STEP PROCESS

### 1. 🎨 DEPLOY NFT DROP CONTRACT
**🔗 Go to:** https://thirdweb.com/explore/pre-built-contracts/nft-drop

**Contract Details:**
```
Name: GALLERY OF MOMENTS
Symbol: ATUONA  
Description: ATUONA Gallery of Moments - Underground Verse Vault

A rebellion against the sterile. An underground sanctuary where authentic human moments are immortalized on blockchain - not as commodities, but as eternal fragments of consciousness.

This collection preserves 45 raw, unfiltered poems spanning 2019-2025: addiction recovery, family trauma, spiritual rebellion, sexual passion, and the brutal machinery of existence.

We are the underground. We are the rebels who refuse to let authentic poetry die. We infiltrate crypto culture with real art, proving that blockchain can preserve human souls, not just speculation.

Collect moments, not profits. Acquire spirits, not investments.
Underground • Uncompromising • Unforgettable

Network: Polygon
Max Supply: 45
```

### 2. 📤 BATCH UPLOAD METADATA

**Install thirdweb CLI:**
```bash
npm install -g @thirdweb-dev/cli
```

**Upload all metadata:**
```bash
npx thirdweb upload ./metadata
```

### 3. 🎯 LAZY MINT ALL 45 NFTS

**In thirdweb dashboard:**
1. Go to your NFT Drop contract
2. Click "Lazy Mint" 
3. Upload the metadata URIs from step 2
4. Mint all 45 NFTs (they won't be claimed yet)

### 4. ⚙️ SET CLAIM CONDITIONS

**Configure FREE minting:**
```
Price: 0 (FREE)
Currency: Native (POL)
Max Claimable: 1 per wallet (or unlimited)
Start Date: Immediate
End Date: Never
Allowlist: None (public)
```

### 5. 🔗 UPDATE WEBSITE CODE

**Replace contract address with new NFT Drop address**
**Use `claim` function instead of `mintTo`**

## 🎭 EXPECTED RESULT

Users visit atuona.xyz → Connect wallet → Click "COLLECT SOUL" → Mint NFT for FREE (gas only) → Receive unique poetry NFT in wallet

## 🔥 ADVANTAGES OF NFT DROP

- ✅ **True public minting** - No role restrictions
- ✅ **FREE minting** - Set price to 0
- ✅ **Lazy minting** - Upload once, users claim individually  
- ✅ **Built for drops** - Exactly your use case
- ✅ **Claim conditions** - Full control over who can mint when
- ✅ **Website integration** - Easy claim buttons

This is the **definitive solution** for your underground poetry gallery!