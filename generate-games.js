const fs = require('fs');
const path = require('path');

const gamesDir = './html5';
const thumbDir = './assets/thumbnails';
const outputFile = './games-list.json';
const placeholderPath = "assets/thumbnails/placeholder.jpg";

if (!fs.existsSync(gamesDir)) {
    console.error("❌ html5 folder not found!");
    process.exit(1);
}

// 1. Get all HTML files (including those deep in folders)
const getAllFiles = (dir, ext) => {
    let res = [];
    fs.readdirSync(dir).forEach(file => {
        const fullPath = path.join(dir, file);
        if (fs.statSync(fullPath).isDirectory()) {
            res = res.concat(getAllFiles(fullPath, ext));
        } else if (file.endsWith(ext)) {
            res.push(fullPath);
        }
    });
    return res;
};

const htmlFiles = getAllFiles(gamesDir, '.html');

const gameData = htmlFiles.map(filePath => {
    // Match the logic from screenshot.js:
    // If it's html5/dadish/index.html -> gameName is "dadish"
    // If it's html5/single-game.html -> gameName is "single-game"
    const relativePath = path.relative(gamesDir, filePath);
    let gameName;
    
    if (relativePath.includes(path.sep)) {
        gameName = relativePath.split(path.sep)[0];
    } else {
        gameName = path.basename(filePath, path.extname(filePath));
    }

    const thumbName = `${gameName}.jpg`;
    const fullThumbPath = path.join(thumbDir, thumbName);
    const hasThumb = fs.existsSync(fullThumbPath);

    return {
        name: gameName.replace(/-/g, ' '), // Optional: Prettify "death-run" to "death run"
        file: filePath.replace(/\\/g, '/'), // Ensure web-friendly slashes
        thumb: hasThumb ? `assets/thumbnails/${thumbName}` : placeholderPath
    };
});

// 2. Write the JSON
fs.writeFileSync(outputFile, JSON.stringify(gameData, null, 2));
console.log(`✅ Ready for Cloudflare: Synced ${gameData.length} games to ${outputFile}`);