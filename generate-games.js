const fs = require('fs');
const path = require('path');

const gamesDir = './html5';
const thumbDir = './assets/thumbnails';
const outputFile = './games-list.json';

function generateList() {
    if (!fs.existsSync(gamesDir)) {
        console.error("❌ Error: 'html5' folder not found!");
        return;
    }

    const files = fs.readdirSync(gamesDir).filter(f => f.endsWith('.html') || f.endsWith('.htm'));

    const gameData = files.map(file => {
        const fileName = file.split('.')[0]; 
        const thumbName = `${fileName}.png`;
        const thumbPath = path.join(thumbDir, thumbName);

        return {
            file: `html5/${file}`,
            // This is the "path" the website will use to find the image
            thumb: fs.existsSync(thumbPath) ? `assets/thumbnails/${thumbName}` : "assets/default-icon.png"
        };
    });

    fs.writeFileSync(outputFile, JSON.stringify(gameData, null, 2));
    console.log(`✅ Success: ${gameData.length} games added to the catalog.`);
}

// Run the function immediately
generateList();