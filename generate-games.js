const fs = require('fs');
const path = require('path');

// Update these to match your folder names exactly
const foldersToScan = [
    { dir: './html5', type: 'standard' },
    { dir: './krecak-games', type: 'krecak' },
    { dir: './swf', type: 'flash' },
    { dir: './swf/games', type: 'flash' } // Scanning the subfolder from your screenshot
];

const gameFiles = [];

foldersToScan.forEach(folder => {
    if (!fs.existsSync(folder.dir)) return;

    const files = fs.readdirSync(folder.dir);
    
    files.forEach(file => {
        const ext = path.extname(file).toLowerCase();
        const filePath = path.join(folder.dir, file);
        
        // Skip directories and system files
        if (fs.statSync(filePath).isDirectory()) return;

        let gameData = {
            name: file,
            thumb: `./assets/thumbnails/${file.split('.')[0]}.jpg`, // Assumes jpg thumbs
            isKrecak: folder.type === 'krecak',
            isFlash: false
        };

        if (ext === '.swf') {
            // FLASH GAMES: Route through the ruffleplayer
            gameData.file = `ruffleplayer.html?game=${encodeURIComponent(file)}`;
            gameData.isFlash = true;
            gameFiles.push(gameData);
        } else if (ext === '.html' && file !== 'index.html' && file !== '404.html') {
            // HTML5 GAMES: Link directly to the file
            gameData.file = filePath; 
            gameFiles.push(gameData);
        }
    });
});

fs.writeFileSync('./games-list.json', JSON.stringify(gameFiles, null, 2));
console.log(`✅ Success! Generated list with ${gameFiles.length} games.`);