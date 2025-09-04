// Extract all 45 poems from index.html and create complete NFT metadata JSON

import fs from 'fs';

// Read the HTML file
const htmlContent = fs.readFileSync('index.html', 'utf8');

// Extract poem titles
const titleRegex = /<h2 class="nft-title">([^<]+)<\/h2>/g;
const titles = [];
let titleMatch;
while ((titleMatch = titleRegex.exec(htmlContent)) !== null) {
  titles.push(titleMatch[1]);
}

// Extract poem verses
const verseRegex = /<div class="nft-verse">([\s\S]*?)<\/div>/g;
const verses = [];
let verseMatch;
while ((verseMatch = verseRegex.exec(htmlContent)) !== null) {
  // Clean up the HTML and convert to plain text
  const cleanText = verseMatch[1]
    .replace(/<br>/g, '\n')
    .replace(/\s+/g, ' ')
    .trim()
    .replace(/\n /g, '\n');
  verses.push(cleanText);
}

console.log(`Found ${titles.length} titles and ${verses.length} verses`);

// Create complete NFT metadata
const nftMetadata = [];

for (let i = 0; i < Math.min(titles.length, verses.length); i++) {
  const id = (i + 1).toString().padStart(3, '0');
  const title = titles[i];
  const verse = verses[i];
  
  nftMetadata.push({
    name: `${title} #${id}`,
    description: `ATUONA Gallery of Moments - Underground Poem ${id}. "${title}" - Raw, unfiltered poetry preserved on blockchain. Free collection - true to underground values.`,
    image: `https://fast-yottabyte-noisy.on-fleek.app/images/poem-${id}.png`,
    attributes: [
      {"trait_type": "Title", "value": title},
      {"trait_type": "ID", "value": id},
      {"trait_type": "Collection", "value": "GALLERY OF MOMENTS"},
      {"trait_type": "Type", "value": "Free Underground Poetry"},
      {"trait_type": "Language", "value": "Russian"},
      {"trait_type": "Theme", "value": "Underground Culture"},
      {"trait_type": "Poem Text", "value": verse}
    ]
  });
}

// Write the complete JSON
fs.writeFileSync('atuona-complete-45-poems.json', JSON.stringify(nftMetadata, null, 2));

console.log(`✅ Created complete metadata for ${nftMetadata.length} poems`);
console.log('📄 File: atuona-complete-45-poems.json');
console.log('🎭 Ready for thirdweb dashboard batch upload!');

// Show first poem as example
console.log('\n📝 Example poem:');
console.log('Title:', nftMetadata[0].name);
console.log('Verse preview:', nftMetadata[0].attributes.find(attr => attr.trait_type === 'Poem Text').value.substring(0, 100) + '...');