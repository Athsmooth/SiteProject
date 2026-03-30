const fs = require('fs');
const path = require('path');

// ONLY these three locations are allowed
const scanConfigs = [
    { dir: 'swf', type: 'flash' },
    { dir: 'html5', type: 'html5' },
    { dir: 'gba', type: 'gba' } 
];

let gameList = [];

scanConfigs.forEach(config => {
    const fullFolderPath = path.join(__dirname, config.dir);
    
    // Check if the folder actually exists
    if (!fs.existsSync(fullFolderPath)) {
        console.log(`⚠️ Folder not found: ${config.dir}`);
        return;
    }

    const files = fs.readdirSync(fullFolderPath);
    console.log(`Scanning ${config.dir}... found ${files.length} files.`);

    files.forEach(file => {
        const ext = path.extname(file).toLowerCase().trim();
        const baseName = path.parse(file).name;

        // Nintendo Check (Handles .gbc, .gba, .gb)
        const isNintendo = ['.gba', '.gbc', '.gb'].includes(ext);

        // 1. Logic for GBA Folder (ONLY allows Nintendo extensions)
        if (config.type === 'gba' && !isNintendo) return;

        // 2. Logic for SWF Folder
        if (config.type === 'flash' && ext !== '.swf') return;

        // 3. Logic for HTML5 Folder
        if (config.type === 'html5' && ext !== '.html' && ext !== '.htm') return;

        // Skip the player/index files if they are accidentally in these folders
        if (['index.html', '404.html', 'gbaplayer.html', 'ruffleplayer.html', 'html5player.html'].includes(file.toLowerCase())) return;

        let playerPage = 'html5player.html';
        if (ext === '.swf') playerPage = 'ruffleplayer.html';
        if (isNintendo) playerPage = 'gbaplayer.html';

        gameList.push({
            name: baseName.split('(')[0].replace(/[-_]/g, ' ').trim(),
            file: `${playerPage}?game=${encodeURIComponent(file)}`,
            // Clean thumbnail name (no -image)
            thumb: `assets/thumbnails/${baseName}.png`, 
            category: config.type
        });
    });
});

fs.writeFileSync('games-list.json', JSON.stringify(gameList, null, 2));

console.log(`\n--- FINAL GENERATION ---`);
console.log(`Total Games added to JSON: ${gameList.length}`);
console.log(`Check your games-list.json now!`);