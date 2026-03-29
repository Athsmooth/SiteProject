const fs = require('fs');
const path = require('path');

const sourceFolders = [
    { dir: './swf', type: 'flash' },
    { dir: './swf/games', type: 'flash' },
    { dir: './html5', type: 'html5' }
];

let gameList = [];
// We use a Set to track "Path + Name" to allow same names in different folders
const seenPaths = new Set();

sourceFolders.forEach(folder => {
    if (!fs.existsSync(folder.dir)) return;
    
    const files = fs.readdirSync(folder.dir);
    files.forEach(file => {
        const ext = path.extname(file).toLowerCase();
        const fullPath = path.join(folder.dir, file).replace(/\\/g, '/');
        
        // Skip directories and system files
        if (fs.lstatSync(fullPath).isDirectory()) return;
        if (['index.html', 'ruffleplayer.html', 'htmlplayer.html', '404.html'].includes(file.toLowerCase())) return;
        if (!['.swf', '.html'].includes(ext)) return;

        // Check for duplicates based on the FULL PATH, not just the filename
        if (seenPaths.has(fullPath)) return;
        seenPaths.add(fullPath);

        let playerLink;
        if (folder.type === 'flash') {
            // Flash: ruffleplayer.html needs the filename and it looks in /swf/
            playerLink = `ruffleplayer.html?game=${encodeURIComponent(file)}`;
        } else {
            // HTML5: htmlplayer.html needs the specific path (e.g., html5/2048.html)
            playerLink = `htmlplayer.html?game=${encodeURIComponent(fullPath)}`;
        }

        gameList.push({
            // Append format to name if you want to distinguish them (Optional)
            // Example: "2048 (Flash)" vs "2048 (HTML5)"
            name: file.replace(ext, '').replace(/[-_]/g, ' '),
            file: playerLink,
            thumb: `./assets/thumbnails/${file.split('.')[0]}.jpg`,
            category: folder.type // 'flash' or 'html5'
        });
    });
});

// Sort them so Flash and HTML5 are grouped separately in the UI
gameList.sort((a, b) => (a.category > b.category) ? 1 : -1);

fs.writeFileSync('./games-list.json', JSON.stringify(gameList, null, 2));
console.log(`✅ Success! Generated ${gameList.length} games. Identical names in different folders are now supported.`);