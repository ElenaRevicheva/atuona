// Extract all 45 poems with BOTH Russian text AND English descriptions

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

// Extract poem verses (Russian text)
const verseRegex = /<div class="nft-verse">([\s\S]*?)<\/div>/g;
const verses = [];
let verseMatch;
while ((verseMatch = verseRegex.exec(htmlContent)) !== null) {
  const cleanText = verseMatch[1]
    .replace(/<br>/g, '\n')
    .replace(/\s+/g, ' ')
    .trim()
    .replace(/\n /g, '\n');
  verses.push(cleanText);
}

// Extract English descriptions
const descRegex = /<p class="nft-description">\s*([\s\S]*?)\s*<\/p>/g;
const descriptions = [];
let descMatch;
while ((descMatch = descRegex.exec(htmlContent)) !== null) {
  const cleanDesc = descMatch[1]
    .replace(/\s+/g, ' ')
    .trim();
  descriptions.push(cleanDesc);
}

console.log(`Found ${titles.length} titles, ${verses.length} verses, ${descriptions.length} descriptions`);

// Create complete NFT metadata with REAL descriptions
const nftMetadata = [];

for (let i = 0; i < Math.min(titles.length, verses.length, descriptions.length); i++) {
  const id = (i + 1).toString().padStart(3, '0');
  const title = titles[i];
  const verse = verses[i];
  const description = descriptions[i];
  
  nftMetadata.push({
    name: `${title} #${id}`,
    description: `ATUONA Gallery of Moments - Underground Poem ${id}. "${title}" - ${description}`,
    image: `https://fast-yottabyte-noisy.on-fleek.app/images/poem-${id}.png`,
    attributes: [
      {"trait_type": "Title", "value": title},
      {"trait_type": "ID", "value": id},
      {"trait_type": "Collection", "value": "GALLERY OF MOMENTS"},
      {"trait_type": "Type", "value": "Free Underground Poetry"},
      {"trait_type": "Language", "value": "Russian"},
      {"trait_type": "Theme", "value": "Underground Culture"},
      {"trait_type": "Poem Text", "value": verse},
      {"trait_type": "English Analysis", "value": description}
    ]
  });
}

// Write the complete JSON
fs.writeFileSync('atuona-final-45-poems.json', JSON.stringify(nftMetadata, null, 2));

console.log(`✅ Created FINAL metadata for ${nftMetadata.length} poems`);
console.log('📄 File: atuona-final-45-poems.json');
console.log('🎭 Includes Russian text + English descriptions!');

// Show example
console.log('\n📝 Example poem:');
console.log('Title:', nftMetadata[0].name);
console.log('Description:', nftMetadata[0].description.substring(0, 150) + '...');
console.log('Russian text:', nftMetadata[0].attributes.find(attr => attr.trait_type === 'Poem Text').value.substring(0, 100) + '...');
console.log('English analysis:', nftMetadata[0].attributes.find(attr => attr.trait_type === 'English Analysis').value.substring(0, 100) + '...');