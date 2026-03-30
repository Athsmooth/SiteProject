const fs = require('fs');
const path = require('path');

const scanConfigs = [
    { dir: 'swf', type: 'flash' },
    { dir: 'html5', type: 'html5' },
    { dir: 'gba', type: 'gba' } 
];

let gameList = [];

console.log("--- 🔍 STARTING FOLDER SCAN ---");

scanConfigs.forEach(config => {
    const fullFolderPath = path.join(__dirname, config.dir);
    
    if (!fs.existsSync(fullFolderPath)) {
        console.log(`❌ FOLDER MISSING: Looking for "${config.dir}" at: ${fullFolderPath}`);
        return;
    }

    const files = fs.readdirSync(fullFolderPath);
    console.log(`📁 Found folder "${config.dir}" with ${files.length} files.`);
    
    files.forEach(file => {
        const ext = path.extname(file).toLowerCase();
        const baseName = path.parse(file).name;
        
        const isNintendo = ['.gba', '.gbc', '.gb'].includes(ext);
        
        // This log helps us see if the script is even LOOKING at your GBA files
        if (config.type === 'gba') {
            console.log(`   checking: ${file} | Ext: ${ext} | isNintendo: ${isNintendo}`);
        }

        if (config.type === 'gba' && !isNintendo) return;
        if (config.type === 'flash' && ext !== '.swf') return;
        if (config.type === 'html5' && ext !== '.html') return;

        if (['index.html', '404.html', 'gbaplayer.html'].includes(file.toLowerCase())) return;

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

console.log(`\n--- ✨ FINAL STATS ---`);
console.log(`Total Games Found: ${gameList.length}`);

fs.writeFileSync('games-list.json', JSON.stringify(gameList, null, 2));
console.log(`✅ games-list.json has been written to the root.`);