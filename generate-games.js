const fs = require('fs');
const path = require('path');

const gamesDir = './html5';
const thumbDir = './assets/thumbnails';
const outputFile = './games-list.json';
const placeholderPath = "assets/thumbnails/placeholder.jpg";

// The tags we want to ensure are in EVERY HTML file
const injectionTags = `
    <link rel="stylesheet" href="/style.css">
    <script src="/global.js" defer></script>
`;

const getAllFiles = (dir) => {
    let res = [];
    if (!fs.existsSync(dir)) return res;
    fs.readdirSync(dir).forEach(file => {
        const fullPath = path.join(dir, file);
        if (fs.statSync(fullPath).isDirectory()) {
            res = res.concat(getAllFiles(fullPath));
        } else if (file.endsWith('.html')) {
            res.push(fullPath);
        }
    });
    return res;
};

const htmlFiles = getAllFiles(gamesDir);

const gameData = htmlFiles.map(filePath => {
    const relativePath = path.relative(gamesDir, filePath);
    const pathParts = relativePath.split(path.sep);
    const isKrecak = pathParts.includes('krecak-games');
    
    let gameSlug = pathParts.length > 1 ? pathParts[pathParts.length - 2] : path.basename(filePath, '.html');
    if (gameSlug === 'krecak-games') gameSlug = path.basename(filePath, '.html');

    // --- AUTOMATIC INJECTION LOGIC ---
    let content = fs.readFileSync(filePath, 'utf8');
    // If the file doesn't already have our global script, add it before </head>
    if (!content.includes('global.js')) {
        content = content.replace('</head>', `${injectionTags}\n</head>`);
        fs.writeFileSync(filePath, content);
        console.log(`- Injected scripts into: ${relativePath}`);
    }

    return {
        name: gameSlug,
        file: filePath.replace(/\\/g, '/'),
        thumb: fs.existsSync(path.join(thumbDir, `${gameSlug}.jpg`)) ? `assets/thumbnails/${gameSlug}.jpg` : placeholderPath,
        isKrecak: isKrecak
    };
});

fs.writeFileSync(outputFile, JSON.stringify(gameData, null, 2));
console.log(`\n✅ SYNC COMPLETE: ${gameData.length} games updated and scripts injected.`);