const fs = require('fs');
const path = require('path');

const scanConfigs = [
    { dir: 'swf', type: 'flash' },
    { dir: 'html5', type: 'html5' },
    { dir: 'gba', type: 'gba' } // Changed to 'gba' to match your folder
];

let gameList = [];

scanConfigs.forEach(config => {
    if (!fs.existsSync(config.dir)) return;
    const files = fs.readdirSync(config.dir);
    
    files.forEach(file => {
        const ext = path.extname(file).toLowerCase();
        const baseName = path.parse(file).name; // Properly gets name without extension
        const fullPath = path.join(config.dir, file).replace(/\\/g, '/');

        // Filter files
        const isNintendo = ['.gba', '.gbc', '.gb'].includes(ext);
        if (config.type === 'gba' && !isNintendo) return;
        if (config.type === 'flash' && ext !== '.swf') return;
        if (config.type === 'html5' && ext !== '.html') return;

        if (['index.html', 'ruffleplayer.html', 'html5player.html', '404.html'].includes(file.toLowerCase())) return;

        // Player routing
        let playerPage = 'html5player.html';
        if (ext === '.swf') playerPage = 'ruffleplayer.html';
        // This points to your GBAPlayer.html in the root
        if (isNintendo) playerPage = 'gbaplayer.html'; 

        gameList.push({
            // Clean up the name for the label: removes (USA) and replaces dashes
            name: baseName.split('(')[0].replace(/[-_]/g, ' ').trim(),
            // The full original filename encoded for the URL
            file: `${playerPage}?game=${encodeURIComponent(file)}`,
            // Matches your "Game Name-image.png" files
            thumb: `assets/thumbnails/${baseName}-image.png`,
            category: config.type
        });
    });
});

fs.writeFileSync('games-list.json', JSON.stringify(gameList, null, 2));
console.log(`✅ Success! Processed ${gameList.length} games.`);