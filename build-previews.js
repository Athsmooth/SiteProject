const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

const gamesDir = path.join(__dirname, 'html5');
const thumbDir = path.join(__dirname, 'assets/thumbnails');
const outputFile = path.join(__dirname, 'games-list.json');

(async () => {
    // 1. Setup Folders
    if (!fs.existsSync(thumbDir)) fs.mkdirSync(thumbDir, { recursive: true });
    if (!fs.existsSync(gamesDir)) {
        console.error("❌ Folder 'html5' not found!");
        process.exit(1);
    }

    // 2. Launch Browser
    const browser = await puppeteer.launch({
        args: ['--allow-file-access-from-files', '--disable-web-security']
    });
    const page = await browser.newPage();
    await page.setViewport({ width: 800, height: 450 });

    const files = fs.readdirSync(gamesDir).filter(f => f.endsWith('.html') || f.endsWith('.htm'));
    const gameData = [];

    console.log(`🔍 Checking ${files.length} games...`);

    for (const file of files) {
        const fileName = file.split('.')[0];
        const thumbName = `${fileName}.png`;
        const thumbPath = path.join(thumbDir, thumbName);
        const relativeThumbPath = `assets/thumbnails/${thumbName}`;

        // Only take screenshot if it doesn't exist
        if (!fs.existsSync(thumbPath)) {
            console.log(`📸 Generating preview for: ${file}`);
            try {
                // Using path.resolve for absolute file system paths
                await page.goto(`file://${path.resolve(gamesDir, file)}`, { 
                    waitUntil: 'networkidle2', 
                    timeout: 8000 
                });
                // Brief pause for the game's intro animations to finish
                await new Promise(r => setTimeout(r, 1500)); 
                await page.screenshot({ path: thumbPath });
            } catch (e) {
                console.log(`⚠️ Failed to capture ${file}.`);
            }
        }

        // Add to the JSON list
        gameData.push({
            file: `html5/${file}`,
            thumb: fs.existsSync(thumbPath) ? relativeThumbPath : "assets/default-icon.png"
        });
    }

    // 3. Save Final JSON
    fs.writeFileSync(outputFile, JSON.stringify(gameData, null, 2));
    
    await browser.close();
    console.log(`\n✅ Success! Updated ${outputFile}`);
})();