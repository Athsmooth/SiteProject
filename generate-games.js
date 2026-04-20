const fs = require('fs');
const path = require('path');

const scanConfigs = [
    { dir: 'main/exclusive', web: 'exclusive' },
    { dir: 'main/swf', web: 'swf' },
    { dir: 'main/html5', web: 'html5' }
];

let gameList = [];

scanConfigs.forEach(config => {
    const p = path.join(__dirname, config.dir);
    if (!fs.existsSync(p)) return;

    fs.readdirSync(p).forEach(file => {
        const ext = path.extname(file).toLowerCase();
        const base = path.parse(file).name;
        
        let player = 'html5player.html';
        let link = `${config.web}/${encodeURIComponent(file)}`;

        if (['.gba', '.gbc', '.gb'].includes(ext)) {
            player = 'gbaplayer.html';
            link = `type=${ext.slice(1)}`;
        } else if (ext === '.swf') {
            player = 'ruffleplayer.html';
        }

        gameList.push({
            name: base.replace(/[-_]/g, ' '),
            // REMOVED the leading slash. 
            // This makes the path "html5player.html" instead of "/html5player.html"
            file: `${player}?game=${link}`,
            thumb: `assets/thumbnails/${base}.jpg`,
            category: config.web
        });
    });
});

fs.writeFileSync('main/games-list.json', JSON.stringify(gameList, null, 2));
console.log("✅ Fixed games-list.json generated in /main/");