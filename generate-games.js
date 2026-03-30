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
        const ext = path.extname(file).toLowerCase().trim();
        const isNintendo = ['.gbc', '.gba', '.gb'].includes(ext);

        if (config.type === 'gba' && !isNintendo) return;
        if (config.type === 'flash' && ext !== '.swf') return;
        if (config.type === 'html5' && ext !== '.html' && ext !== '.htm') return;

        // Skip players/system files
        if (['index.html', '404.html', 'gbaplayer.html', 'ruffleplayer.html', 'html5player.html'].includes(file.toLowerCase())) return;

        const baseName = path.parse(file).name;
        let playerPage = 'html5player.html';
        if (ext === '.swf') playerPage = 'ruffleplayer.html';
        if (isNintendo) playerPage = 'gbaplayer.html';

        gameList.push({
            name: baseName.split('(')[0].replace(/[-_]/g, ' ').trim(),
            // We include 'gba/' in the path so the player knows where to look
            file: `${playerPage}?game=gba/${encodeURIComponent(file)}`,
            thumb: `assets/thumbnails/${baseName}.png`, 
            category: config.type
        });
    });
});

fs.writeFileSync('games-list.json', JSON.stringify(gameList, null, 2));
console.log(`✅ Success! JSON updated with ${gameList.length} games.`);