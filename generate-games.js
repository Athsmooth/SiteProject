const fs = require('fs');
const path = require('path');

const scanConfigs = [
    { dir: 'swf', type: 'flash' },
    { dir: 'html5', type: 'html5' },
    { dir: 'roms', type: 'gba' } // Added your ROMs folder
];

let gameList = [];

scanConfigs.forEach(config => {
    if (!fs.existsSync(config.dir)) return;
    const files = fs.readdirSync(config.dir);
    
    files.forEach(file => {
        const ext = path.extname(file).toLowerCase();
        const fullPath = path.join(config.dir, file).replace(/\\/g, '/');

        // Logic for different file types
        if (config.type === 'flash' && ext !== '.swf') return;
        if (config.type === 'html5' && ext !== '.html') return;
        
        // NEW RULE: Accept GBA, GBC, and GB files in the 'roms' folder
        const isNintendo = ['.gba', '.gbc', '.gb'].includes(ext);
        if (config.type === 'gba' && !isNintendo) return;

        // Skip system files
        if (['index.html', 'ruffleplayer.html', 'html5player.html', '404.html'].includes(file.toLowerCase())) return;

        // Determine which player page to use
        let playerPage = 'html5player.html'; // Default
        if (ext === '.swf') {
            playerPage = 'ruffleplayer.html';
        } else if (isNintendo) {
            playerPage = 'gba/player.html'; // Points to the new subfolder
        }

        gameList.push({
            name: file.replace(ext, '').replace(/[-_]/g, ' '),
            file: `${playerPage}?game=${encodeURIComponent(fullPath)}`,
            thumb: `assets/thumbnails/${file.split('.')[0]}.jpg`,
            category: config.type
        });
    });
});

fs.writeFileSync('games-list.json', JSON.stringify(gameList, null, 2));
console.log("✅ Index Updated: Flash, HTML5, and GBA/GBC games categorized.");