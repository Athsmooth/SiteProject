const fs = require('fs');
const path = require('path');

// Make sure these match your folder names EXACTLY (case-sensitive)
const scanConfigs = [
    { dir: 'gba', type: 'gba' },
    { dir: 'swf', type: 'flash' }
];

let gameList = [];

scanConfigs.forEach(config => {
    const fullPath = path.join(__dirname, config.dir);
    console.log(`Checking folder: ${fullPath}`); // This tells you if the script sees the folder

    if (fs.existsSync(fullPath)) {
        const files = fs.readdirSync(fullPath);
        console.log(`Found ${files.length} files in ${config.dir}`);

        files.forEach(file => {
            const ext = path.extname(file).toLowerCase();
            if (['.gba', '.gbc', '.gb'].includes(ext)) {
                gameList.push({
                    name: path.parse(file).name.split('(')[0].trim(),
                    // This creates the link the player needs
                    file: `gbaplayer.html?game=${config.dir}/${encodeURIComponent(file)}`,
                    category: 'gba'
                });
            }
        });
    } else {
        console.log(`❌ Folder NOT found: ${config.dir}`);
    }
});

fs.writeFileSync('games-list.json', JSON.stringify(gameList, null, 2));
console.log(`✅ Done! Created games-list.json with ${gameList.length} games.`);