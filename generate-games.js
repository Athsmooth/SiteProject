const fs = require('fs');
const path = require('path');

// Folders to scan
const foldersToScan = [
    { dir: './html5', type: 'standard' },
    { dir: './krecak-games', type: 'krecak' },
    { dir: './swf', type: 'flash' },
    { dir: './swf/games', type: 'flash' }
];

const gameFiles = [];

console.log("🚀 Starting Game List Generation...");

foldersToScan.forEach(folder => {
    if (!fs.existsSync(folder.dir)) {
        console.log(`⚠️ Folder not found, skipping: ${folder.dir}`);
        return;
    }

    const items = fs.readdirSync(folder.dir);
    
    items.forEach(item => {
        const fullPath = path.join(folder.dir, item);
        const stats = fs.statSync(fullPath);

        // Only process files, skip sub-directories to avoid duplicates
        if (stats.isDirectory()) return;

        const ext = path.extname(item).toLowerCase();
        
        // Base object
        let gameData = {
            name: item,
            thumb: `./assets/thumbnails/${item.split('.')[0]}.jpg`,
            isKrecak: folder.type === 'krecak',
            isFlash: false
        };

        if (ext === '.swf') {
            // FLASH: Points to the player with the filename as a parameter
            gameData.file = `ruffleplayer.html?game=${encodeURIComponent(item)}`;
            gameData.isFlash = true;
            gameFiles.push(gameData);
            console.log(`+ Added Flash: ${item}`);
        } 
        else if (ext === '.html' && item !== 'index.html' && item !== 'ruffleplayer.html' && item !== '404.html') {
            // HTML5: Points directly to the file
            gameData.file = fullPath.replace(/\\/g, '/'); // Fix Windows slashes
            gameFiles.push(gameData);
            console.log(`+ Added HTML5: ${item}`);
        }
    });
});

// Save the JSON
fs.writeFileSync('./games-list.json', JSON.stringify(gameFiles, null, 2));
console.log(`\n✅ Done! Found ${gameFiles.length} games. games-list.json has been updated.`);