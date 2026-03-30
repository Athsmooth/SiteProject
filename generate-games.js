const fs = require('fs');
const path = require('path');

const scanConfigs = [
    { dir: 'swf', type: 'flash' },
    { dir: 'html5', type: 'html5' },
    { dir: 'gba', type: 'gba' } 
];

let gameList = [];

scanConfigs.forEach(config => {
    if (!fs.existsSync(config.dir)) return;
    const files = fs.readdirSync(config.dir);
    
    files.forEach(file => {
        const ext = path.extname(file).toLowerCase();
        const baseName = path.parse(file).name; 
        
        const isNintendo = ['.gba', '.gbc', '.gb'].includes(ext);
        if (config.type === 'gba' && !isNintendo) return;
        if (config.type === 'flash' && ext !== '.swf') return;
        if (config.type === 'html5' && ext !== '.html') return;

        if (['index.html', 'ruffleplayer.html', 'html5player.html', '404.html', 'gbaplayer.html'].includes(file.toLowerCase())) return;

        let playerPage = 'html5player.html';
        if (ext === '.swf') playerPage = 'ruffleplayer.html';
        if (isNintendo) playerPage = 'gbaplayer.html'; 

        gameList.push({
            name: baseName.split('(')[0].replace(/[-_]/g, ' ').trim(),
            file: `${playerPage}?game=${encodeURIComponent(file)}`,
            // FIXED: Removed "-image" and changed to .png (adjust if they are .jpg)
            thumb: `assets/thumbnails/${baseName}.png`, 
            category: config.type
        });
    });
});

fs.writeFileSync('games-list.json', JSON.stringify(gameList, null, 2));
console.log(`✅ Success! Processed ${gameList.length} games with clean thumbnail links.`);