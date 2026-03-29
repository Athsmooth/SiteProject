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
        if (ext !== '.swf' && ext !== '.html') return;

        // Skip the player files themselves
        if (['index.html', 'ruffleplayer.html', 'html5player.html', '404.html'].includes(file.toLowerCase())) return;

        const fullPath = path.join(config.dir, file).replace(/\\/g, '/');
        let playerPage;

        // SMART ROUTING BASED ON EXTENSION
        if (ext === '.swf') {
            playerPage = 'ruffleplayer.html';
        } else if (ext === '.html') {
            playerPage = 'html5player.html';
        }

        gameList.push({
            name: file.replace(ext, '').replace(/[-_]/g, ' ') + (ext === '.swf' ? " (Flash)" : " (HTML5)"),
            file: `${playerPage}?game=${encodeURIComponent(fullPath)}`,
            thumb: `assets/thumbnails/${file.split('.')[0]}.jpg`,
            category: config.type
        });
    });
});

fs.writeFileSync('games-list.json', JSON.stringify(gameList, null, 2));
console.log("✅ Routes corrected! SWF -> Ruffle, HTML -> HTML5Player.");