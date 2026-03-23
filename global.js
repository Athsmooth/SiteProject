const fs = require('fs');
const path = require('path');

// root folders to scan
const foldersToScan = ['./html5', './krecak-games'];
const thumbDir = './assets/thumbnails';
const outputFile = './games-list.json';
const placeholderPath = "/assets/thumbnails/placeholder.jpg";

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

let allHtmlFiles = [];
foldersToScan.forEach(folder => {
    allHtmlFiles = allHtmlFiles.concat(getAllFiles(folder));
});

const gameData = allHtmlFiles.map(filePath => {
    const normalizedPath = filePath.replace(/\\/g, '/').replace(/^\.\//, '');
    const pathParts = normalizedPath.split('/');
    
    // Check if it's a Krecak game based on the root folder name
    const isKrecak = pathParts[0] === 'krecak-games';
    
    // Get game name from the folder it sits in
    let gameSlug = pathParts.length > 1 ? pathParts[pathParts.length - 2] : path.basename(filePath, '.html');
    
    // Handle edge case where html is directly in the root of the category folder
    if (gameSlug === 'html5' || gameSlug === 'krecak-games') {
        gameSlug = path.basename(filePath, '.html');
    }

    // --- AUTO INJECTION ---
    try {
        let content = fs.readFileSync(filePath, 'utf8');
        if (!content.includes('global.js')) {
            if (content.includes('</head>')) {
                content = content.replace('</head>', `${injectionTags}\n</head>`);
            } else {
                content = injectionTags + content;
            }
            fs.writeFileSync(filePath, content);
            console.log(`- Auto-Injected: ${normalizedPath}`);
        }
    } catch (e) {
        console.log(`- Error updating ${filePath}`);
    }

    return {
        name: gameSlug,
        file: '/' + normalizedPath,
        thumb: fs.existsSync(path.join(thumbDir, `${gameSlug}.jpg`)) ? `/assets/thumbnails/${gameSlug}.jpg` : placeholderPath,
        isKrecak: isKrecak
    };
});

fs.writeFileSync(outputFile, JSON.stringify(gameData, null, 2));
console.log(`\n✅ SYNC SUCCESS: Scanned ${allHtmlFiles.length} games across html5/ and krecak-games/`);