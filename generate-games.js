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
        
        // System files to ignore
        const ignore = ['index.html', 'ruffleplayer.html', 'htmlplayer.html', '404.html'];
        if (!['.swf', '.html'].includes(ext) || ignore.includes(file.toLowerCase())) return;
        if (seen.has(file)) return;

        seen.add(file);
        const isFlash = ext === '.swf';
        const rawPath = path.join(folder.dir, file).replace(/\\/g, '/');
        
        gameList.push({
            name: file.replace(ext, '').replace(/[-_]/g, ' '),
            // This is the magic part: route through the correct player
            file: isFlash 
                ? `ruffleplayer.html?game=${encodeURIComponent(file)}` 
                : `htmlplayer.html?game=${encodeURIComponent(rawPath)}`,
            thumb: `./assets/thumbnails/${file.split('.')[0]}.jpg`,
            category: isFlash ? 'flash' : 'html5'
        });
    });
});

fs.writeFileSync('./games-list.json', JSON.stringify(gameList, null, 2));
console.log(`✅ Success: ${gameList.length} games updated with custom players.`);