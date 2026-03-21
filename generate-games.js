const fs = require('fs');
const path = require('path');

const gamesDir = './html5';
const assetsDir = './assets';
const outputFile = './games-list.json';

// Ensure the folder exists
if (!fs.existsSync(gamesDir)) {
    console.error("Folder 'html5' not found!");
    process.exit(1);
}

const files = fs.readdirSync(gamesDir).filter(f => f.endsWith('.html') || f.endsWith('.htm'));

const gameData = files.map(file => {
    const fileName = file.split('.')[0]; 
    
    // Looks for any image in assets that includes the game filename
    const thumb = fs.readdirSync(assetsDir).find(a => 
        a.toLowerCase().includes(fileName.toLowerCase())
    ) || "";

    return {
        file: `html5/${file}`,
        thumb: thumb ? `assets/${thumb}` : ""
    };
});

fs.writeFileSync(outputFile, JSON.stringify(gameData, null, 2));
console.log(`Indexed ${gameData.length} games.`);