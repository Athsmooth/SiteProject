const fs = require('fs');
const path = require('path');

const romDir = './roms'; 
const thumbDir = './assets/thumbnails';

// Helper to clean names: "Game Name (USA) (En).gbc" -> "Game Name"
function cleanName(name) {
    return name.split('(')[0].split('-image')[0].trim();
}

[romDir, thumbDir].forEach(dir => {
    if (!fs.existsSync(dir)) return console.log(`Folder ${dir} not found.`);

    const files = fs.readdirSync(dir);

    files.forEach(file => {
        const ext = path.extname(file).toLowerCase();
        // Only process game files and images
        if (!['.gbc', '.gba', '.gb', '.png', '.jpg'].includes(ext)) return;

        const oldPath = path.join(dir, file);
        const nameWithoutExt = file.replace(ext, '');
        const cleaned = cleanName(nameWithoutExt);
        const newPath = path.join(dir, cleaned + ext);

        if (oldPath !== newPath) {
            // Check if a file with the clean name already exists to avoid overwriting
            if (!fs.existsSync(newPath)) {
                fs.renameSync(oldPath, newPath);
                console.log(`Renamed: ${file} -> ${cleaned}${ext}`);
            }
        }
    });
});

console.log("✅ All ROMs and Thumbnails are now cleaned and matching!");