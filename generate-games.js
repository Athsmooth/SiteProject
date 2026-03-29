const fs = require('fs');
const path = require('path');

// THE CORE LOCATIONS
const scanConfigs = [
    { dir: './swf', type: 'flash' },
    { dir: './swf/games', type: 'flash' },
    { dir: './html5', type: 'html5' }
];

let gameList = [];

console.log("🔍 STARTING FILE SCAN...");

scanConfigs.forEach(config => {
    if (!fs.existsSync(config.dir)) {
        console.warn(`⚠️ Folder missing: ${config.dir}`);
        return;
    }
    
    const files = fs.readdirSync(config.dir);
    
    files.forEach(file => {
        const fullPath = path.join(config.dir, file).replace(/\\/g, '/');
        const ext = path.extname(file).toLowerCase();

        // Check if it's a valid game file
        if (!['.swf', '.html'].includes(ext)) return;
        if (fs.lstatSync(fullPath).isDirectory()) return;
        
        // Ignore system files
        const systemFiles = ['index.html', 'ruffleplayer.html', 'html5player.html', '404.html'];
        if (systemFiles.includes(file.toLowerCase())) return;

        // Clean path for URL (remove leading ./)
        const cleanPath = fullPath.startsWith('./') ? fullPath.substring(2) : fullPath;
        
        let playerPage = (config.type === 'flash') ? 'ruffleplayer.html' : 'html5player.html';
        
        // Build the final object
        const gameEntry = {
            name: file.replace(ext, '').replace(/[-_]/g, ' '),
            file: `${playerPage}?game=${encodeURIComponent(cleanPath)}`,
            category: config.type,
            full_path_debug: cleanPath // This tells us EXACTLY where the file is
        };

        gameList.push(gameEntry);
        console.log(`✅ Found ${config.type.toUpperCase()}: ${cleanPath}`);
    });
});

fs.writeFileSync('./games-list.json', JSON.stringify(gameList, null, 2));
console.log(`\n🚀 SCAN COMPLETE: ${gameList.length} games indexed.`);