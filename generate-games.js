const fs = require('fs');
const path = require('path');

const scanConfigs = [
    { dir: 'swf', type: 'flash' },
    { dir: 'html5', type: 'html5' },
    { dir: 'gba', type: 'gba' }
];

let gameList = [];

scanConfigs.forEach(config => {
    const fullPath = path.join(__dirname, config.dir);
    if (!fs.existsSync(fullPath)) return;

    const files = fs.readdirSync(fullPath);
    
    files.forEach(file => {
        // 1. Get extension and clean it
        const ext = path.extname(file).toLowerCase().trim();
        const baseName = path.parse(file).name;

        // 2. Identify Nintendo files (GB, GBC, GBA)
        const isNintendo = ['.gbc', '.gba', '.gb'].includes(ext);

        // DEBUG: Only log for the gba folder to see what's happening
        if (config.dir === 'gba') {
            console.log(`Checking: "${file}" | Ext detected: "${ext}" | Match: ${isNintendo}`);
        }

        // 3. Filtering Logic
        if (config.type === 'gba' && !isNintendo) return;
        if (config.type === 'flash' && ext !== '.swf') return;
        if (config.type === 'html5' && ext !== '.html' && ext !== '.htm') return;

        // Skip players/index
        if (['index.html', '404.html', 'gbaplayer.html', 'ruffleplayer.html', 'html5player.html'].includes(file.toLowerCase())) return;

        // 4. Determine Player
        let playerPage = 'html5player.html';
        if (ext === '.swf') playerPage = 'ruffleplayer.html';
        if (isNintendo) playerPage = 'gbaplayer.html';

        gameList.push({
            name: baseName.split('(')[0].replace(/[-_]/g, ' ').trim(),
            file: `${playerPage}?game=${encodeURIComponent(file)}`,
            thumb: `assets/thumbnails/${baseName}.png`, 
            category: config.type
        });
    });
});

fs.writeFileSync('games-list.json', JSON.stringify(gameList, null, 2));
console.log(`\n✅ Done! Total games in JSON: ${gameList.length}`);