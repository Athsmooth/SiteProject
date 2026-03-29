const fs = require('fs');
const path = require('path');

const foldersToScan = [
    { dir: './html5', defaultCategory: 'html5' },
    { dir: './krecak-games', defaultCategory: 'html5' },
    { dir: './swf', defaultCategory: 'flash' },
    { dir: './swf/games', defaultCategory: 'flash' }
];

const gameList = [];
const seenFiles = new Set();

console.log("🗂️ Sorting games into categories...");

foldersToScan.forEach(folder => {
    if (!fs.existsSync(folder.dir)) return;

    const items = fs.readdirSync(folder.dir);
    
    items.forEach(item => {
        const ext = path.extname(item).toLowerCase();
        if (ext !== '.swf' && ext !== '.html') return;
        if (['index.html', 'ruffleplayer.html', '404.html'].includes(item.toLowerCase())) return;
        if (seenFiles.has(item)) return;

        seenFiles.add(item);

        // Logic to determine category and link type
        let category = (ext === '.swf') ? 'flash' : 'html5';
        let finalLink = "";

        if (category === 'flash') {
            finalLink = `ruffleplayer.html?game=${encodeURIComponent(item)}`;
        } else {
            // Construct path for HTML5 games
            finalLink = path.join(folder.dir, item).replace(/\\/g, '/');
        }

        gameList.push({
            name: item.replace(ext, '').replace(/[-_]/g, ' '),
            filename: item,
            file: finalLink,
            thumb: `./assets/thumbnails/${item.split('.')[0]}.jpg`,
            category: category
        });

        console.log(`[${category.toUpperCase()}] Sorted: ${item}`);
    });
});

fs.writeFileSync('./games-list.json', JSON.stringify(gameList, null, 2));
console.log(`\n✅ Done! Indexed ${gameList.length} total games.`);