const fs = require('fs');
const path = require('path');

const scanConfigs = [
    { dir: 'swf', type: 'flash' },
    { dir: 'html5', type: 'html5' },
    { dir: 'gba', type: 'gba' }
];

let gameList = [];

console.log("--- 🕵️ DEBUG START ---");

scanConfigs.forEach(config => {
    const folderPath = path.join(__dirname, config.dir);
    
    if (!fs.existsSync(folderPath)) {
        console.log(`❌ ERROR: Folder "${config.dir}" NOT FOUND at ${folderPath}`);
        return;
    }

    const files = fs.readdirSync(folderPath);
    console.log(`\n📁 Checking Folder: ${config.dir} (${files.length} files found)`);

    files.forEach(file => {
        const ext = path.extname(file).toLowerCase();
        
        // LOG EVERY FILE IN GBA FOLDER TO SEE WHY IT'S FAILING
        if (config.dir === 'gba') {
            console.log(`  > Found file: "${file}" | Ext: "${ext}"`);
        }

        // The "Is it a Nintendo game?" check
        const isGBC = ext === '.gbc';
        const isGBA = ext === '.gba';
        const isGB = ext === '.gb';
        const isNintendo = isGBC || isGBA || isGB;

        // Filtering
        if (config.type === 'gba' && !isNintendo) return;
        if (config.type === 'flash' && ext !== '.swf') return;
        if (config.type === 'html5' && ext !== '.html' && ext !== '.htm') return;

        // Skip System Files
        if (['index.html', '404.html', 'gbaplayer.html'].includes(file.toLowerCase())) return;

        const baseName = path.parse(file).name;
        let playerPage = 'html5player.html';
        if (ext === '.swf') playerPage = 'ruffleplayer.html';
        if (isNintendo) playerPage = 'gbaplayer.html';

        gameList.push({
            name: baseName.split('(')[0].replace(/[-_]/g, ' ').trim(),
            file: `${playerPage}?game=${encodeURIComponent(file)}`,
            thumb: `assets/thumbnails/${baseName}.png`,
            category: config.type
        });
    });
});

fs.writeFileSync('games-list.json', JSON.stringify(gameList, null, 2));

console.log(`\n--- 📊 FINAL REPORT ---`);
console.log(`GBA/GBC Games Added: ${gameList.filter(g => g.category === 'gba').length}`);
console.log(`Total Games in JSON: ${gameList.length}`);