// Generate all 45 gallery slots with claim buttons using real poem titles

import fs from 'fs';

// Read the complete metadata
const metadata = JSON.parse(fs.readFileSync('atuona-complete-with-dates.json', 'utf8'));

// Generate HTML for all 45 gallery slots
let galleryHTML = '                    <div class="gallery-grid">\n';

metadata.forEach((poem, index) => {
  const id = (index + 1).toString().padStart(3, '0');
  const title = poem.attributes.find(attr => attr.trait_type === 'Title').value;
  const year = poem.attributes.find(attr => attr.trait_type === 'Year').value;
  
  galleryHTML += `                        <div class="gallery-slot" onclick="claimPoem(${index + 1}, '${title}')">
                            <div class="slot-content">
                                <div class="slot-id">${id}</div>
                                <div class="slot-label">${title}</div>
                                <div class="slot-year">${year}</div>
                                <div class="claim-button">CLAIM NFT</div>
                            </div>
                        </div>\n`;
});

galleryHTML += '                    </div>';

console.log('Generated HTML for all 45 gallery slots:');
console.log(galleryHTML);

// Write to file for easy copying
fs.writeFileSync('gallery-slots-all-45.html', galleryHTML);
console.log('\n✅ Saved to gallery-slots-all-45.html');
console.log(`📊 Generated ${metadata.length} claim buttons for all poems!`);