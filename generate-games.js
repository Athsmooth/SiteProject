const fs = require('fs');
const path = require('path');

// We scan the main folders. We don't need to scan /swf/games separately 
// if we use a recursive scanner, but let's keep it simple and explicit.
const foldersToScan = [
    { dir: './html5', isFlash: false },
    { dir: './krecak-games', isFlash: false },
    { dir: './swf', isFlash: true },
    { dir: './swf/games', isFlash: true }
];

const gameList = [];
const seenFiles = new Set(); // Prevents adding the same game twice

console.log("🔍 Scanning for games...");

foldersToScan.forEach(folder => {
    if (!fs.existsSync(folder.dir)) return;

    const files = fs.readdirSync(folder.dir);

    files.forEach(file => {
        const ext = path.extname(file).toLowerCase();
        
        // Only process .swf and .html files
        if (ext !== '.swf' && ext !== '.html') return;
        
        // Skip system/index files
        if (['index.html', 'ruffleplayer.html', '404.html', 'navbar.html'].includes(file.toLowerCase())) return;

        // Prevent duplicates (if a file exists in /swf AND /swf/games)
        if (seenFiles.has(file)) return;
        seenFiles.add(file);

        let gameData = {
            name: file,
            thumb: `./assets/thumbnails/${file.split('.')[0]}.jpg`,
            isFlash: folder.isFlash,
            file: folder.isFlash 
                ? `ruffleplayer.html?game=${encodeURIComponent(file)}` 
                : path.join(folder.dir, file).replace(/\\/g, '/')
        };

        gameList.push(gameData);
        console.log(`✅ Added: ${file}`);
    });
});

fs.writeFileSync('./games-list.json', JSON.stringify(gameList, null, 2));
console.log(`\n✨ Successfully indexed ${gameList.length} games.`);