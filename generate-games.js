const fs = require('fs');
const path = require('path');

const scanConfigs = [
    { dir: 'main/exclusive', web: 'exclusive' },
    { dir: 'main/swf', web: 'swf' },
    { dir: 'main/html5', web: 'html5' },
    { dir: 'main/gb', web: 'gb' } // Updated to match your gb/ folder
];

let gameList = [];

scanConfigs.forEach(config => {
    const p = path.join(__dirname, config.dir);
    if (!fs.existsSync(p)) {
        console.log(`⚠️ Folder not found: ${config.dir}`);
        return;
    }

    fs.readdirSync(p).forEach(file => {
        const ext = path.extname(file).toLowerCase();
        const base = path.parse(file).name;
        
        let player = 'html5player.html';
        let link = `${config.web}/${encodeURIComponent(file)}`;

        // GameBoy Logic
        if (['.gba', '.gbc', '.gb'].includes(ext)) {
            player = 'gbaplayer.html';
            link = `${config.web}/${encodeURIComponent(file)}&type=${ext.slice(1)}`;
        } else if (ext === '.swf') {
            player = 'ruffleplayer.html';
        }

        gameList.push({
            name: base.replace(/[-_]/g, ' '),
            file: `${player}?game=${link}`,
            thumb: `assets/thumbnails/${base}.jpg`,
            category: config.web === 'gb' ? 'gameboy' : config.web // Keep 'gameboy' as the UI label
        });
    });
});

const outputPath = path.join(__dirname, 'main/games-list.json');
fs.writeFileSync(outputPath, JSON.stringify(gameList, null, 2));
console.log(`✅ Success! Generated ${gameList.length} games.`);