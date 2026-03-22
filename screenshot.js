const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

(async () => {
    const browser = await puppeteer.launch({ args: ['--allow-file-access-from-files'] });
    const page = await browser.newPage();
    
    // Lower resolution saves a lot of space (400x225 is perfect for cards)
    await page.setViewport({ width: 400, height: 225 });

    const gamesDir = path.join(__dirname, 'html5');
    const thumbDir = path.join(__dirname, 'assets/thumbnails');

    if (!fs.existsSync(thumbDir)) fs.mkdirSync(thumbDir, { recursive: true });

    const files = fs.readdirSync(gamesDir).filter(f => f.endsWith('.html') || f.endsWith('.htm'));

    for (const file of files) {
        // Change extension to .jpg here
        const thumbName = file.replace(/\.html|\.htm/, '.jpg');
        const thumbPath = path.join(thumbDir, thumbName);

        if (fs.existsSync(thumbPath)) continue; 

        console.log(`📸 Capturing: ${file}`);
        try {
            await page.goto(`file://${path.join(gamesDir, file)}`, { waitUntil: 'networkidle2', timeout: 5000 });
            await new Promise(r => setTimeout(r, 1500)); 
            
            // --- NEW SCREENSHOT CODE START ---
            await page.screenshot({ 
                path: thumbPath, 
                type: 'jpeg', 
                quality: 70 
            });
            // --- NEW SCREENSHOT CODE END ---
            
        } catch (e) {
            console.log(`❌ Failed to capture ${file}`);
        }
    }

    await browser.close();
    console.log('✅ All JPG thumbnails generated!');
})();