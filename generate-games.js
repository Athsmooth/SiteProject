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
        // Skip system files and non-game files
        if (!['.swf', '.html'].includes(ext)) return;
        if (['index.html', 'ruffleplayer.html', '404.html'].includes(file.toLowerCase())) return;
        if (seen.has(file)) return;

        seen.add(file);
        
        // Determine the link based on file type
        const isFlash = ext === '.swf';
        const gamePath = path.join(folder.dir, file).replace(/\\/g, '/');
        
        gameList.push({
            name: file.replace(ext, '').replace(/[-_]/g, ' '),
            file: isFlash ? `ruffleplayer.html?game=${encodeURIComponent(file)}` : gamePath,
            thumb: `./assets/thumbnails/${file.split('.')[0]}.jpg`,
            category: isFlash ? 'flash' : 'html5',
            timestamp: fs.statSync(gamePath).mtimeMs // For sorting by newest
        });
    });
});

// Sort by Category (Flash first), then by Newest
gameList.sort((a, b) => {
    if (a.category !== b.category) return a.category === 'flash' ? -1 : 1;
    return b.timestamp - a.timestamp;
});

fs.writeFileSync('./games-list.json', JSON.stringify(gameList, null, 2));
console.log(`✅ Success: ${gameList.length} games categorized and saved.`);