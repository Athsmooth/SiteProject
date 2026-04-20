const fs = require('fs');
const path = require('path');

// We keep the scanConfigs but we will treat them differently
const scanConfigs = [
    { dir: 'exclusive', type: 'exclusive' },
    { dir: 'swf', type: 'flash' },
    { dir: 'html5', type: 'html5' }
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
        
        // Skip flash files that aren't .swf
        if (config.type === 'flash' && ext !== '.swf') return;

        const baseName = path.parse(file).name;
        let playerPage = 'html5player.html';
        let finalFileLink = `${config.dir}/${encodeURIComponent(file)}`;

        // LOGIC FOR NINTENDO GAMES (LEGAL MODE)
        if (isNintendo) {
            playerPage = 'gbaplayer.html';
            // We DON'T pass the actual file path anymore because it's deleted.
            // We only pass the type so the emulator picks the right console.
            const consoleType = (ext === '.gba') ? 'gba' : 'gbc';
            finalFileLink = `type=${consoleType}`; 
        } else if (ext === '.swf') {
            playerPage = 'ruffleplayer.html';
        }

        const gameData = {
            name: baseName.split('(')[0].replace(/[-_]/g, ' ').trim(),
            // If it's Nintendo, the link looks like: gbaplayer.html?type=gba
            // If it's HTML5, it looks like: html5player.html?game=html5/gamename.html
            file: isNintendo ? `${playerPage}?${finalFileLink}` : `${playerPage}?game=${finalFileLink}`,
            thumb: `assets/thumbnails/${baseName}.jpg`, 
            category: config.type
        };

        // EXCLUSIVE LOGIC: Add to the start of the array to show at the top
        if (config.type === 'exclusive') {
            gameList.unshift(gameData);
        } else {
            gameList.push(gameData);
        }
    });
});

fs.writeFileSync('games-list.json', JSON.stringify(gameList, null, 2));
console.log(`✅ Success! games-list.json updated with ${gameList.length} total games.`);
