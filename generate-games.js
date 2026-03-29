const fs = require('fs');
const path = require('path');

const scanConfigs = [
    { dir: 'swf', type: 'flash' },
    { dir: 'swf/games', type: 'flash' },
    { dir: 'html5', type: 'html5' }
];

let gameList = [];

scanConfigs.forEach(config => {
    if (!fs.existsSync(config.dir)) return;
    const files = fs.readdirSync(config.dir);
    
    files.forEach(file => {
        const ext = path.extname(file).toLowerCase();
        const fullPath = path.join(config.dir, file).replace(/\\/g, '/');

        // NEW RULE: If we are in a 'flash' folder, ONLY accept .swf files.
        if (config.type === 'flash' && ext !== '.swf') return;
        
        // For HTML5 folder, only accept .html
        if (config.type === 'html5' && ext !== '.html') return;

        // Skip system files
        if (['index.html', 'ruffleplayer.html', 'html5player.html', '404.html'].includes(file.toLowerCase())) return;

        let playerPage = (ext === '.swf') ? 'ruffleplayer.html' : 'html5player.html';

        gameList.push({
            name: file.replace(ext, '').replace(/[-_]/g, ' '),
            file: `${playerPage}?game=${encodeURIComponent(fullPath)}`,
            thumb: `assets/thumbnails/${file.split('.')[0]}.jpg`,
            category: config.type
        });
    });
});

fs.writeFileSync('games-list.json', JSON.stringify(gameList, null, 2));
console.log("✅ Cleaned Index: SWF folders now only provide .swf files.");