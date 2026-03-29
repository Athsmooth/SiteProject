const fs = require('fs');
const path = require('path');

// 1. ADDED './swf' TO THE SCAN LIST
const foldersToScan = ['./html5', './krecak-games', './swf']; 
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
        } else {
            // 2. NOW ACCEPTS BOTH .HTML AND .SWF
            if (file.endsWith('.html') || file.endsWith('.swf')) {
                res.push(fullPath);
            }
        }
    });
    return res;
};

let allFiles = [];
foldersToScan.forEach(folder => {
    allFiles = allFiles.concat(getAllFiles(folder));
});

const gameData = allFiles.map(filePath => {
    const normalizedPath = filePath.replace(/\\/g, '/').replace(/^\.\//, '');
    const pathParts = normalizedPath.split('/');
    const extension = path.extname(filePath).toLowerCase();
    
    const isKrecak = pathParts[0] === 'krecak-games';
    const isFlash = pathParts[0] === 'swf' || extension === '.swf';
    
    let gameSlug = path.basename(filePath, extension);

    // --- FLASH HANDLING ---
    let finalLink = '/' + normalizedPath;
    if (isFlash) {
        // Redirect Flash files to your Ruffle Player
        finalLink = `/ruffleplayer.html?game=${path.basename(filePath)}`;
    } else {
        // --- AUTO INJECTION (HTML ONLY) ---
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
    }

    return {
        name: gameSlug,
        file: finalLink,
        thumb: fs.existsSync(path.join(thumbDir, `${gameSlug}.jpg`)) ? `/assets/thumbnails/${gameSlug}.jpg` : (fs.existsSync(path.join(thumbDir, `${gameSlug}.png`)) ? `/assets/thumbnails/${gameSlug}.png` : placeholderPath),
        isKrecak: isKrecak,
        isFlash: isFlash // Added flag for future filtering
    };
});

fs.writeFileSync(outputFile, JSON.stringify(gameData, null, 2));
console.log(`\n✅ SYNC SUCCESS: Scanned ${allFiles.length} games across all directories.`);