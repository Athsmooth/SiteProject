const fs = require('fs');
const path = require('path');

const folders = [
    { dir: './swf', type: 'flash' },
    { dir: './swf/games', type: 'flash' },
    { dir: './html5', type: 'html5' }
];

let gameList = [];
const seenPaths = new Set();

folders.forEach(folder => {
    if (!fs.existsSync(folder.dir)) return;
    
    const files = fs.readdirSync(folder.dir);
    files.forEach(file => {
        const fullPath = path.join(folder.dir, file).replace(/\\/g, '/');
        const ext = path.extname(file).toLowerCase();
        
        if (fs.lstatSync(fullPath).isDirectory()) return;
        if (['index.html', 'ruffleplayer.html', 'html5player.html', '404.html'].includes(file.toLowerCase())) return;
        if (ext !== '.swf' && ext !== '.html') return;

        if (seenPaths.has(fullPath)) return;
        seenPaths.add(fullPath);

        let link;
        let name = file.replace(ext, '').replace(/[-_]/g, ' ');

        if (folder.type === 'flash') {
            link = `ruffleplayer.html?game=${encodeURIComponent(file)}`;
            name += " (Flash)";
        } else {
            // UPDATED TO YOUR FILENAME: html5player.html
            const cleanPath = fullPath.startsWith('./') ? fullPath.substring(2) : fullPath;
            link = `html5player.html?game=${encodeURIComponent(cleanPath)}`;
            name += " (HTML5)";
        }

        gameList.push({
            name: name,
            file: link,
            thumb: `./assets/thumbnails/${file.split('.')[0]}.jpg`,
            category: folder.type
        });
    });
});

fs.writeFileSync('./games-list.json', JSON.stringify(gameList, null, 2));
console.log(`✅ Success! HTML5 games are now routing to html5player.html`);