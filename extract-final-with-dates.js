// Extract all 45 poems with Russian text, English descriptions, AND publication dates

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

// Extract publication dates
const dateRegex = /принято к публикации ([0-9]{2}-[0-9]{2}-[0-9]{4})/g;
const dates = [];
let dateMatch;
while ((dateMatch = dateRegex.exec(htmlContent)) !== null) {
  dates.push(dateMatch[1]);
}

console.log(`Found ${titles.length} titles, ${verses.length} verses, ${descriptions.length} descriptions, ${dates.length} dates`);

// Create complete NFT metadata with dates
const nftMetadata = [];

for (let i = 0; i < Math.min(titles.length, verses.length, descriptions.length, dates.length); i++) {
  const id = (i + 1).toString().padStart(3, '0');
  const title = titles[i];
  const verse = verses[i];
  const description = descriptions[i];
  const date = dates[i];
  
  nftMetadata.push({
    name: `${title} #${id}`,
    description: `ATUONA Gallery of Moments - Underground Poem ${id}. "${title}" - ${description} Published: ${date}`,
    image: `https://fast-yottabyte-noisy.on-fleek.app/images/poem-${id}.png`,
    attributes: [
      {"trait_type": "Title", "value": title},
      {"trait_type": "ID", "value": id},
      {"trait_type": "Collection", "value": "GALLERY OF MOMENTS"},
      {"trait_type": "Type", "value": "Free Underground Poetry"},
      {"trait_type": "Language", "value": "Russian"},
      {"trait_type": "Publication Date", "value": date},
      {"trait_type": "Year", "value": date.split('-')[2]},
      {"trait_type": "Theme", "value": "Underground Culture"},
      {"trait_type": "Poem Text", "value": verse},
      {"trait_type": "English Analysis", "value": description}
    ]
  });
}

// Write the complete JSON with dates
fs.writeFileSync('atuona-complete-with-dates.json', JSON.stringify(nftMetadata, null, 2));

console.log(`✅ Created FINAL metadata with dates for ${nftMetadata.length} poems`);
console.log('📄 File: atuona-complete-with-dates.json');
console.log('🎭 Includes Russian text + English descriptions + Publication dates!');

// Show example with date
console.log('\n📝 Example poem with date:');
const example = nftMetadata[0];
console.log('Title:', example.name);
console.log('Date:', example.attributes.find(attr => attr.trait_type === 'Publication Date').value);
console.log('Description preview:', example.description.substring(0, 150) + '...');

// Show date range
const years = dates.map(d => d.split('-')[2]).sort();
console.log(`\n📅 Date range: ${years[0]} - ${years[years.length - 1]}`);
console.log('📊 Chronological poetry collection spanning 6+ years!');