# Poem Management System for ATUONA Gallery

## Overview
This guide shows you how to efficiently manage and display your 20-30 poems in the NFT gallery format.

## Current Status
✅ **First poem updated**: "Silver Screen Twilight" is now live in NFT #001

## Method 1: Direct HTML Editing (Current Approach)
Replace each NFT card manually in `index.html` around lines 890-950.

### NFT Card Structure:
```html
<div class="nft-card">
    <div class="nft-header">
        <div class="nft-id">#001</div>
        <div class="nft-status live">LIVE</div> <!-- or "MINTING" or "SOON" -->
    </div>
    <div class="nft-content">
        <h2 class="nft-title">Your Poem Title</h2>
        <div class="nft-verse">
            Your poem lines here<br>
            with line breaks<br>
            for proper formatting<br>
            of your verses...
        </div>
        <p class="nft-description">
            Description of your poem, its themes, inspiration, or meaning.
        </p>
        <div class="nft-meta">
            <div class="nft-price">0.5 ETH</div>
            <button class="nft-action">COLLECT SOUL</button>
        </div>
    </div>
</div>
```

## Method 2: JavaScript-Based Poem System (Recommended)
Create a poem database and dynamically generate NFT cards.

### Step 1: Create Poem Database
Add this JavaScript object before the glitch animation code:

```javascript
// Poem Database
const poemDatabase = [
    {
        id: "001",
        title: "Silver Screen Twilight",
        verse: `В серебряных сумерках экранов,<br>
                где память тает, как снег на руке,<br>
                я собираю осколки стихов<br>
                в цифровом петербургском тоске...`,
        description: "An original poem exploring the melancholic beauty of digital memories and the fragments of verse that linger in our technological twilight.",
        price: "0.5 ETH",
        status: "live" // "live", "minting", "soon"
    },
    {
        id: "002",
        title: "Your Second Poem Title",
        verse: `Your second poem<br>
                line by line<br>
                with proper breaks...`,
        description: "Description of your second poem.",
        price: "0.3 ETH",
        status: "minting"
    }
    // Add more poems here...
];
```

### Step 2: Dynamic Generation Function
```javascript
function generateNFTCards() {
    const nftGrid = document.querySelector('.nft-grid');
    if (!nftGrid) return;
    
    // Clear existing cards
    nftGrid.innerHTML = '';
    
    poemDatabase.forEach(poem => {
        const statusClass = poem.status === 'live' ? 'live' : 
                           poem.status === 'minting' ? 'coming' : 'coming';
        const statusText = poem.status === 'live' ? 'LIVE' : 
                          poem.status === 'minting' ? 'MINTING' : 'SOON';
        const actionText = poem.status === 'live' ? 'COLLECT SOUL' : 
                          poem.status === 'minting' ? 'RESERVE NOW' : 'COMING SOON';
        
        const cardHTML = `
            <div class="nft-card">
                <div class="nft-header">
                    <div class="nft-id">#${poem.id}</div>
                    <div class="nft-status ${statusClass}">${statusText}</div>
                </div>
                <div class="nft-content">
                    <h2 class="nft-title">${poem.title}</h2>
                    <div class="nft-verse">${poem.verse}</div>
                    <p class="nft-description">${poem.description}</p>
                    <div class="nft-meta">
                        <div class="nft-price">${poem.price}</div>
                        <button class="nft-action">${actionText}</button>
                    </div>
                </div>
            </div>
        `;
        
        nftGrid.innerHTML += cardHTML;
    });
}

// Generate cards on page load
document.addEventListener('DOMContentLoaded', function() {
    generateNFTCards();
    // ... rest of your existing code
});
```

## Adding New Poems

### Method 1 (Direct HTML):
1. Copy an existing NFT card structure
2. Change the ID number (#002, #003, etc.)
3. Replace title, verse, and description
4. Adjust price and status as needed

### Method 2 (JavaScript Database):
1. Add new poem object to `poemDatabase` array
2. The cards will auto-generate on page refresh

## Poem Formatting Tips

### Russian Text:
- Use `<br>` tags for line breaks
- Maintain original formatting and spacing
- Consider adding English translations in descriptions

### Titles:
- Keep titles evocative and artistic
- Consider bilingual titles (Russian/English)
- Match the underground aesthetic

### Descriptions:
- Explain the poem's themes or inspiration
- Keep the mysterious, artistic tone
- Mention if it's from a specific collection or period

### Pricing Strategy:
- Vary prices based on poem significance
- Consider: 0.1-0.3 ETH for shorter pieces
- 0.5-0.8 ETH for major works
- 1.0+ ETH for masterpieces

### Status Options:
- `live`: Ready to purchase
- `minting`: Currently being processed
- `soon`: Coming soon

## Next Steps
1. ✅ First poem is updated
2. Choose your preferred method (Direct HTML or JavaScript)
3. Prepare your 20-30 poems with titles and descriptions
4. Implement remaining poems
5. Test the gallery functionality
6. Prepare for thirdweb integration

## File Locations
- Main HTML: `/workspace/index.html` (lines 890-950 for NFT cards)
- JavaScript: Add poem database around line 1400+

Would you like me to implement the JavaScript-based system or continue with direct HTML editing?