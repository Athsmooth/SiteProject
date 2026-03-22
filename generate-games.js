const fs = require('fs');
const path = require('path');

const gamesDir = './html5';
const thumbDir = './assets/thumbnails';
const outputFile = './games-list.json';

// 1. Check if games folder exists
if (!fs.existsSync(gamesDir)) {
    console.error("❌ html5 folder not found!");
    process.exit(1);
}

// 2. Ensure thumbnails folder exists
if (!fs.existsSync(thumbDir)) {
    fs.mkdirSync(thumbDir, { recursive: true });
}

// 3. Read the games
const files = fs.readdirSync(gamesDir).filter(f => f.endsWith('.html') || f.endsWith('.htm'));

const gameData = files.map(file => {
    const fileName = file.split('.')[0]; 
    const thumbName = `${fileName}.jpg`;
    const thumbPath = path.join(thumbDir, thumbName);

    // If the thumbnail was uploaded to assets/thumbnails, use it.
    // Otherwise, use a default icon.
    const hasThumb = fs.existsSync(thumbPath);

    return {
        file: `html5/${file}`,
        thumb: hasThumb ? `assets/thumbnails/${thumbName}` : "assets/default-icon.png"
    };
});

// 4. Create the JSON file automatically
fs.writeFileSync(outputFile, JSON.stringify(gameData, null, 2));
console.log(`✅ Automated: Synced ${gameData.length} games to ${outputFile}`);