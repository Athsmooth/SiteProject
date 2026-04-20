const fs = require('fs');
const path = require('path');

const scanConfigs = [
    { dir: 'main/exclusive', type: 'exclusive', webDir: 'exclusive' },
    { dir: 'main/swf', type: 'flash', webDir: 'swf' },
    { dir: 'main/html5', type: 'html5', webDir: 'html5' }
];

let gameList = [];

scanConfigs.forEach(config => {
    const fullPath = path.join(__dirname, config.dir);
    if (!fs.existsSync(fullPath)) {
        console.log(`⚠️ Folder not found: ${config.dir}`);
        return;
    }

    const files = fs.readdirSync(fullPath);
    console.log(`📂 Scanning ${config.dir}... found ${files.length} files.`);

    files.forEach(file => {
        const ext = path.extname(file).toLowerCase();
        const isNintendo = ['.gba', '.gbc', '.gb'].includes(ext);
        
        if (config.type === 'flash' && ext !== '.swf') return;

        const baseName = path.parse(file).name;
        let playerPage = 'html5player.html';
        
        // FIX: Use webDir so the link is "exclusive/file.html", NOT "main/exclusive/file.html"
        let finalFileLink = `${config.webDir}/${encodeURIComponent(file)}`;

        if (isNintendo) {
            playerPage = 'gbaplayer.html';
            const consoleType = (ext === '.gba') ? 'gba' : 'gbc';
            finalFileLink = `type=${consoleType}`; 
        } else if (ext === '.swf') {
            playerPage = 'ruffleplayer.html';
        }

        const gameData = {
            name: baseName.split('(')[0].replace(/[-_]/g, ' ').trim(),
            file: isNintendo ? `${playerPage}?${finalFileLink}` : `${playerPage}?game=${finalFileLink}`,
            // Assuming your assets folder is also inside the 'main' folder
            thumb: `assets/thumbnails/${baseName}.jpg`, 
            category: config.type
        };

        if (config.type === 'exclusive') {
            gameList.unshift(gameData);
        } else {
            gameList.push(gameData);
        }
    });
});

// Save specifically to the main folder
fs.writeFileSync(path.join(__dirname, 'main/games-list.json'), JSON.stringify(gameList, null, 2));
console.log(`✅ Success! main/games-list.json updated with ${gameList.length} total games.`);