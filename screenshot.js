const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

(async () => {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.setViewport({ width: 800, height: 450 });

    const gamesDir = path.join(__dirname, 'html5');
    const thumbDir = path.join(__dirname, 'assets/thumbnails');

    if (!fs.existsSync(thumbDir)) fs.mkdirSync(thumbDir, { recursive: true });

    const files = fs.readdirSync(gamesDir).filter(f => f.endsWith('.html'));

    for (const file of files) {
        const thumbName = file.replace('.html', '.png');
        const thumbPath = path.join(thumbDir, thumbName);

        if (fs.existsSync(thumbPath)) continue; // Skip if already exists

        console.log(`📸 Capturing: ${file}`);
        try {
            await page.goto(`file://${path.join(gamesDir, file)}`, { waitUntil: 'networkidle2', timeout: 5000 });
            await page.screenshot({ path: thumbPath });
        } catch (e) {
            console.log(`❌ Failed to capture ${file}`);
        }
    }

    await browser.close();
    console.log('✅ All thumbnails generated!');
})();