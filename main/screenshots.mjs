import puppeteer from 'puppeteer';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Configuration
const ROM_DIR = path.join(__dirname, 'gb');
const THUMB_DIR = path.join(__dirname, 'assets', 'thumbnails');
const PLAYER_FILE = path.join(__dirname, 'gbplayer.html');

async function captureGba(browser, romPath) {
    const fileName = path.basename(romPath, path.extname(romPath));
    const thumbPath = path.join(THUMB_DIR, `${fileName}.jpg`);

    const page = await browser.newPage();
    
    try {
        await page.setViewport({ width: 480, height: 320 });

        // Use a relative path for the query string if absolute file:// fails
        // Many emulators expect the path relative to the HTML file
        const relativeRomPath = path.relative(__dirname, romPath);
        const targetUrl = `file://${PLAYER_FILE}?game=${encodeURIComponent(relativeRomPath)}`;

        console.log(`🔍 Loading: ${fileName}`);
        
        // Go to the player
        await page.goto(targetUrl, { waitUntil: 'load', timeout: 30000 });

        // 1. CLICK THE SCREEN (Bypasses "User Gesture" blocks)
        await page.mouse.click(240, 160); 
        
        // 2. WAIT FOR BOOT (Increased to 8s to ensure game is visible)
        await new Promise(r => setTimeout(r, 8000)); 

        // 3. CHECK FOR CRASH (Optional but helpful)
        const dimensions = await page.evaluate(() => {
            return { width: window.innerWidth, height: window.innerHeight };
        });

        await page.screenshot({ path: thumbPath, type: 'jpeg', quality: 70 });
        return `✅ Success: ${fileName}`;
    } catch (e) {
        return `❌ Error: ${fileName} | ${e.message}`;
    } finally {
        await page.close().catch(() => {});
    }
}

(async () => {
    console.log("🛠️ Starting Thumbnailer...");
    
    if (!fs.existsSync(THUMB_DIR)) fs.mkdirSync(THUMB_DIR, { recursive: true });

    const browser = await puppeteer.launch({
        headless: "new",
        args: [
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--allow-file-access-from-files', // CRITICAL
            '--disable-web-security',           // CRITICAL
            '--disable-features=IsolateOrigins,site-per-process'
        ]
    });

    const files = fs.readdirSync(ROM_DIR)
        .filter(f => ['.gba', '.gbc', '.gb'].includes(path.extname(f).toLowerCase()))
        .map(f => path.join(ROM_DIR, f));

    console.log(`🚀 Found ${files.length} ROMs. Starting...`);

    for (const file of files) {
        console.log(await captureGba(browser, file));
    }

    await browser.close();
    console.log("✨ Done.");
    process.exit(0);
})();