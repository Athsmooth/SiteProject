const fs = require('fs');
const path = require('path');

// Your specific folder setup
const sourceConfigs = [
    { dir: './swf', type: 'flash' },
    { dir: './swf/games', type: 'flash' },
    { dir: './html5', type: 'html5' }
];

let games = [];
const seen = new Set();

sourceConfigs.forEach(config => {
    if (!fs.existsSync(config.dir)) return;

    const items = fs.readdirSync(config.dir);
    items.forEach(item => {
        const fullPath = path.join(config.dir, item).replace(/\\/g, '/');
        
        // Skip if it's a directory (like 'games' inside 'swf') or a system file
        if (fs.lstatSync(fullPath).isDirectory()) return;
        const ignore = ['index.html', 'ruffleplayer.html', 'htmlplayer.html', '404.html'];
        if (ignore.includes(item.toLowerCase())) return;

        // Prevent duplicates (e.g., if the same game is in /swf and /swf/games)
        if (seen.has(item)) return;
        seen.add(item);

        let playerLink;
        if (config.type === 'flash') {
            // FLASH RULE: Use the filename. Ruffle player handles the path logic.
            playerLink = `ruffleplayer.html?game=${encodeURIComponent(item)}`;
        } else {
            // HTML5 RULE: Use the full relative path to the file.
            playerLink = `htmlplayer.html?game=${encodeURIComponent(fullPath)}`;
        }

        games.push({
            name: item.split('.')[0].replace(/[-_]/g, ' '),
            file: playerLink,
            thumb: `./assets/thumbnails/${item.split('.')[0]}.jpg`,
            category: config.type
        });
    });
});

fs.writeFileSync('./games-list.json', JSON.stringify(games, null, 2));
console.log(`✅ Hierarchy Synced: ${games.length} games indexed from swf, swf/games, and html5.`);