const fs = require('fs');
const path = require('path');

const scanConfigs = [
    { dir: 'gba', type: 'gba' },
    { dir: 'swf', type: 'flash' },
    { dir: 'html5', type: 'html5' }
];

let gameList = [];

scanConfigs.forEach(config => {
    const fullPath = path.join(__dirname, config.dir);
    if (!fs.existsSync(fullPath)) {
        console.log(`⚠️ Folder not found: ${config.dir}`);
        return;
    }

    const files = fs.readdirSync(fullPath);
    console.log(`📂 Scanning ${config.dir}... found ${files.length} files.`);

    files.forEach(file => {
        const ext = path.extname(file).toLowerCase();
        const isNintendo = ['.gba', '.gbc', '.gb'].includes(ext);
        
        // Filter logic
        if (config.type === 'gba' && !isNintendo) return;
        if (config.type === 'flash' && ext !== '.swf') return;

        const baseName = path.parse(file).name;
        
        // Decide which player page to use
        let playerPage = 'html5player.html';
        if (ext === '.swf') playerPage = 'ruffleplayer.html';
        if (isNintendo) playerPage = 'gbaplayer.html';

        gameList.push({
            name: baseName.split('(')[0].replace(/[-_]/g, ' ').trim(),
            // CRITICAL: This formats the link for your navbar.js to use
            file: `${playerPage}?game=${config.dir}/${encodeURIComponent(file)}`,
            thumb: `assets/thumbnails/${baseName}.png`, 
            category: config.type
        });
    });
});

fs.writeFileSync('games-list.json', JSON.stringify(gameList, null, 2));
console.log(`✅ Success! games-list.json updated with ${gameList.length} total games.`);