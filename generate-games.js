const fs = require('fs');
const path = require('path');

const folders = ['gba', 'swf'];
let games = [];

folders.forEach(folder => {
    const dirPath = path.join(__dirname, folder);
    if (fs.existsSync(dirPath)) {
        const files = fs.readdirSync(dirPath);
        files.forEach(file => {
            const ext = path.extname(file).toLowerCase();
            if (['.gba', '.gbc', '.gb', '.swf'].includes(ext)) {
                // Determine which player to use
                const player = ext === '.swf' ? 'ruffleplayer.html' : 'gbaplayer.html';
                
                games.push({
                    name: path.parse(file).name.split('(')[0].trim(),
                    file: `${player}?game=${folder}/${encodeURIComponent(file)}`,
                    category: folder
                });
            }
        });
    }
});

fs.writeFileSync('games-list.json', JSON.stringify(games, null, 2));
console.log(`Successfully mapped ${games.length} games to games-list.json`);