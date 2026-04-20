const fs = require('fs');
const path = require('path');

const gamesDir = './swf';
const quarantineDir = './too-large-for-cloudflare';
const MAX_SIZE_BYTES = 25 * 1024 * 1024; // 25 MiB

// Ensure quarantine directory exists
if (!fs.existsSync(quarantineDir)) fs.mkdirSync(quarantineDir, { recursive: true });

function scan(dir) {
    const items = fs.readdirSync(dir);
    
    items.forEach(item => {
        const fullPath = path.join(dir, item);
        const stats = fs.statSync(fullPath);

        if (stats.isDirectory()) {
            // Recursively scan within the directory
            scan(fullPath);
        } else {
            // Check Size of the individual file
            if (stats.size > MAX_SIZE_BYTES) {
                const sizeMB = (stats.size / (1024 * 1024)).toFixed(2);
                
                // Only move if it's a file you care about (e.g., .zip, .swf, .exe)
                const ext = path.extname(item).toLowerCase();
                const targetExtensions = ['.zip', '.swf', '.rar', '.7z', '.dat'];

                if (targetExtensions.includes(ext)) {
                    console.log(`⚠️ TOO LARGE: ${item} (${sizeMB} MB)`);

                    // Move ONLY the file, not the parent folder
                    const destPath = path.join(quarantineDir, item);

                    try {
                        console.log(`🚀 Moving file ${item} to quarantine...`);
                        fs.renameSync(fullPath, destPath);
                    } catch (err) {
                        console.error(`❌ Error moving ${item}:`, err.message);
                    }
                }
            }
        }
    });
}

console.log("Searching for files > 25MB inside /swf...");
scan(gamesDir);
console.log("Done. Check the 'too-large-for-cloudflare' folder.");