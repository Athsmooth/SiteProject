const fs = require('fs');
const path = require('path');

const gamesDir = './html5';
const quarantineDir = './too-large-for-cloudflare';
const MAX_SIZE_BYTES = 25 * 1024 * 1024; // 25 MiB

if (!fs.existsSync(quarantineDir)) fs.mkdirSync(quarantineDir);

function scan(dir) {
    const items = fs.readdirSync(dir);
    
    items.forEach(item => {
        const fullPath = path.join(dir, item);
        const stats = fs.statSync(fullPath);

        if (stats.isDirectory()) {
            scan(fullPath);
        } else {
            // Check Size
            if (stats.size > MAX_SIZE_BYTES) {
                const sizeMB = (stats.size / (1024 * 1024)).toFixed(2);
                console.log(`⚠️ TOO LARGE: ${item} (${sizeMB} MB)`);
                
                // Move the whole game folder to quarantine so it doesn't break the build
                const gameFolder = fullPath.split(path.sep)[1]; // gets the folder inside html5
                const sourceFolder = path.join(gamesDir, gameFolder);
                const destFolder = path.join(quarantineDir, gameFolder);

                if (fs.existsSync(sourceFolder) && !fs.existsSync(destFolder)) {
                    console.log(`🚀 Moving ${gameFolder} to quarantine...`);
                    fs.renameSync(sourceFolder, destFolder);
                }
            }
        }
    });
}

console.log("Searching for files > 25MB...");
scan(gamesDir);
console.log("Done. Check the 'too-large-for-cloudflare' folder.");