const fs = require('fs');
const path = require('path');

const config = [
    { dir: './swf', cat: 'flash' },
    { dir: './swf/games', cat: 'flash' },
    { dir: './html5', cat: 'html5' },
    { dir: './krecak-games', cat: 'html5' }
];

let gameList = [];
const seen = new Set();

config.forEach(folder => {
    if (!fs.existsSync(folder.dir)) return;
    
    const files = fs.readdirSync(folder.dir);
    files.forEach(file => {
        const ext = path.extname(file).toLowerCase();
        if (!['.swf', '.html'].includes(ext)) return;
        if (['index.html', 'ruffleplayer.html', '404.html'].includes(file.toLowerCase())) return;
        if (seen.has(file)) return;

        seen.add(file);
        const isFlash = ext === '.swf';
        
        gameList.push({
            name: file.replace(ext, '').replace(/[-_]/g, ' '),
            file: isFlash ? `ruffleplayer.html?game=${encodeURIComponent(file)}` : path.join(folder.dir, file).replace(/\\/g, '/'),
            thumb: `./assets/thumbnails/${file.split('.')[0]}.jpg`,
            category: isFlash ? 'flash' : 'html5'
        });
    });
});

fs.writeFileSync('./games-list.json', JSON.stringify(gameList, null, 2));
console.log(`Successfully indexed ${gameList.length} games.`); 