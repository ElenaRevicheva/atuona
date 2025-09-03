// Script to create all 45 metadata files from your HTML content
const fs = require('fs');
const path = require('path');

// Extract poem data from your HTML (I'll manually create the first 10, then you can extend)
const poems = [
  {
    id: "001",
    title: "На память",
    description: "Underground poetry capturing memory, loss, and the brutal machinery of existence.",
    language: "Russian"
  },
  {
    id: "002", 
    title: "To Beautrix",
    description: "A passionate dedication exploring love, desire, and human connection in the digital age.",
    language: "English"
  },
  {
    id: "003",
    title: "Atuona", 
    description: "Named after the remote village where Gauguin found his final inspiration, exploring artistic exile and creative rebellion.",
    language: "Mixed"
  },
  {
    id: "004",
    title: "Vesenneye",
    description: "Spring awakening and renewal, written with underground intensity and raw emotion.",
    language: "Russian"
  },
  {
    id: "005",
    title: "Digital Despair",
    description: "Exploring the intersection of technology and human emotion in the modern age.",
    language: "English"
  },
  // Add more poems here...
];

// Create metadata directory if it doesn't exist
if (!fs.existsSync('./metadata')) {
  fs.mkdirSync('./metadata');
}

// Generate metadata files
poems.forEach(poem => {
  const metadata = {
    name: `${poem.title} #${poem.id}`,
    description: `ATUONA Gallery of Moments - ${poem.title}. Underground poetry preserved on blockchain. Free collection - true to underground values. ${poem.description}`,
    image: `https://atuona.xyz/images/poem-${poem.id}.png`,
    attributes: [
      {
        trait_type: "Poem",
        value: poem.title
      },
      {
        trait_type: "ID",
        value: poem.id
      },
      {
        trait_type: "Collection",
        value: "GALLERY OF MOMENTS"
      },
      {
        trait_type: "Type", 
        value: "Free Underground Poetry"
      },
      {
        trait_type: "Language",
        value: poem.language
      },
      {
        trait_type: "Year",
        value: "2019-2025"
      }
    ]
  };
  
  const filePath = path.join('./metadata', `${poem.id}.json`);
  fs.writeFileSync(filePath, JSON.stringify(metadata, null, 2));
  console.log(`✅ Created ${filePath}`);
});

console.log(`🎭 Created ${poems.length} metadata files for ATUONA Gallery!`);