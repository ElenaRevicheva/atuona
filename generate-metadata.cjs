// Generate all 45 metadata files for ATUONA Gallery
const fs = require('fs');
const path = require('path');

// First 10 poems extracted from your HTML
const poems = [
  { id: "001", title: "На память", lang: "Russian", desc: "Memory, loss, and the brutal machinery of existence" },
  { id: "002", title: "To Beautrix", lang: "English", desc: "Passionate dedication exploring love, desire, and human connection" },
  { id: "003", title: "Atuona", lang: "Mixed", desc: "Artistic exile and creative rebellion, named after Gauguin's final village" },
  { id: "004", title: "Vesenneye", lang: "Russian", desc: "Spring awakening and renewal with underground intensity" },
  { id: "005", title: "Маме", lang: "Russian", desc: "Tribute to maternal love and family bonds" },
  { id: "006", title: "Первоснежье", lang: "Russian", desc: "First snow and winter's embrace" },
  { id: "007", title: "Папе", lang: "Russian", desc: "Paternal relationship and generational understanding" },
  { id: "008", title: "Фасады", lang: "Russian", desc: "Facades and hidden truths behind appearances" },
  { id: "009", title: "Pan Nuestro", lang: "Spanish", desc: "Our bread - spiritual nourishment and sustenance" },
  { id: "010", title: "Underground Manifesto", lang: "English", desc: "The core philosophy of underground poetry resistance" }
];

// Create metadata directory
if (!fs.existsSync('./metadata')) {
  fs.mkdirSync('./metadata');
}

// Generate metadata for first 10 poems
poems.forEach(poem => {
  const metadata = {
    name: `${poem.title} #${poem.id}`,
    description: `ATUONA Gallery of Moments - ${poem.title}. Underground poetry preserved on blockchain. Free collection - true to underground values. ${poem.desc}`,
    image: `https://atuona.xyz/images/poem-${poem.id}.png`,
    attributes: [
      { trait_type: "Poem", value: poem.title },
      { trait_type: "ID", value: poem.id },
      { trait_type: "Collection", value: "GALLERY OF MOMENTS" },
      { trait_type: "Type", value: "Free Underground Poetry" },
      { trait_type: "Language", value: poem.lang },
      { trait_type: "Year", value: "2019-2025" }
    ]
  };
  
  const filePath = path.join('./metadata', `${poem.id}.json`);
  fs.writeFileSync(filePath, JSON.stringify(metadata, null, 2));
  console.log(`✅ Created ${filePath}`);
});

// Generate placeholder metadata for remaining poems (011-045)
for (let i = 11; i <= 45; i++) {
  const id = i.toString().padStart(3, '0');
  const metadata = {
    name: `Underground Poem #${id}`,
    description: `ATUONA Gallery of Moments - Underground Poem ${id}. Raw, unfiltered poetry preserved on blockchain. Free collection - true to underground values. Part of the 45-piece collection spanning addiction recovery, family trauma, spiritual rebellion, and human consciousness.`,
    image: `https://atuona.xyz/images/poem-${id}.png`,
    attributes: [
      { trait_type: "Poem", value: `Underground Poem ${id}` },
      { trait_type: "ID", value: id },
      { trait_type: "Collection", value: "GALLERY OF MOMENTS" },
      { trait_type: "Type", value: "Free Underground Poetry" },
      { trait_type: "Language", value: "Mixed" },
      { trait_type: "Year", value: "2019-2025" }
    ]
  };
  
  const filePath = path.join('./metadata', `${id}.json`);
  fs.writeFileSync(filePath, JSON.stringify(metadata, null, 2));
  console.log(`✅ Created ${filePath}`);
}

console.log(`🎭 Created 45 metadata files for ATUONA NFT Drop!`);