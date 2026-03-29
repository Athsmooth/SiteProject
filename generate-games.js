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
        if (!['.swf', '.html'].includes(ext)) return;
        
        // Ignore system files
        if (['index.html', 'ruffleplayer.html', 'html5player.html', '404.html'].includes(file.toLowerCase())) return;

        const fullPath = path.join(config.dir, file).replace(/\\/g, '/');
        
        let playerPage;
        let displayName = file.replace(ext, '').replace(/[-_]/g, ' ');

        if (config.type === 'flash') {
            playerPage = 'ruffleplayer.html';
            displayName += " (Flash)";
        } else {
            playerPage = 'html5player.html';
            displayName += " (HTML5)";
        }

        gameList.push({
            name: displayName,
            // The magic is here: it passes the exact path like "swf/games/game.swf"
            file: `${playerPage}?game=${encodeURIComponent(fullPath)}`,
            thumb: `assets/thumbnails/${file.split('.')[0]}.jpg`,
            category: config.type
        });
    });
});

fs.writeFileSync('games-list.json', JSON.stringify(gameList, null, 2));
console.log(`✅ Successfully indexed ${gameList.length} games.`);