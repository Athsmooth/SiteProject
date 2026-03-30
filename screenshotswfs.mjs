import puppeteer from 'puppeteer';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const CONCURRENCY = 5; // Lowered slightly because Ruffle/WASM is CPU heavy

const getAllSwfFiles = (dirPath, arrayOfFiles = []) => {
    const files = fs.readdirSync(dirPath);
    files.forEach((file) => {
        const fullPath = path.join(dirPath, file);
        if (fs.statSync(fullPath).isDirectory()) {
            getAllSwfFiles(fullPath, arrayOfFiles);
        } else if (file.toLowerCase().endsWith('.swf')) {
            arrayOfFiles.push(fullPath);
        }
    });
    return arrayOfFiles;
};

async function captureSwf(browser, swfPath, swfDir, thumbDir, playerHtmlPath) {
    const fileName = path.basename(swfPath, '.swf');
    const thumbPath = path.join(thumbDir, `${fileName}.jpg`);

    if (fs.existsSync(thumbPath)) return `⏭️  Skipping ${fileName}`;

    let page;
    try {
        page = await browser.newPage();
        // Set a standard game aspect ratio
        await page.setViewport({ width: 800, height: 600 });

        // Construct the local URL to your ruffleplayer.html with the game param
        // We use encodeURIComponent to handle spaces/special chars in filenames
        const targetUrl = `file://${playerHtmlPath}?game=${encodeURIComponent(swfPath)}`;

        await page.goto(targetUrl, { waitUntil: 'networkidle2', timeout: 15000 });

        // Wait 4 seconds to let Ruffle initialize and the game load the first screen
        await new Promise(r => setTimeout(r, 4000));

        await page.screenshot({ 
            path: thumbPath, 
            type: 'jpeg', 
            quality: 70,
            clip: { x: 0, y: 60, width: 800, height: 540 } // Clips your 60px navbar if needed
        });

        return `✅ Generated: ${fileName}`;
    } catch (e) {
        return `❌ Error ${fileName}: ${e.message}`;
    } finally {
        if (page) await page.close().catch(() => {});
    }
}

(async () => {
    // ADJUST THESE PATHS to match your folder structure
    const swfDir = path.join(__dirname, 'swf'); 
    const thumbDir = path.join(__dirname, 'assets', 'thumbnails');
    const playerHtmlPath = path.join(__dirname, 'ruffleplayer.html');

    if (!fs.existsSync(thumbDir)) fs.mkdirSync(thumbDir, { recursive: true });

    const allPaths = getAllSwfFiles(swfDir);
    console.log(`🚀 SWF Mode | Tasks: ${allPaths.length} | Concurrency: ${CONCURRENCY}`);

    const browser = await puppeteer.launch({
        headless: "new",
        args: [
            '--no-sandbox',
            '--allow-file-access-from-files',
            '--disable-web-security'
        ]
    });

    const work = [...allPaths];
    const workers = Array(CONCURRENCY).fill(0).map(async () => {
        while (work.length > 0) {
            const filePath = work.pop();
            console.log(await captureSwf(browser, filePath, swfDir, thumbDir, playerHtmlPath));
        }
    });

    await Promise.all(workers);
    await browser.close();
    console.log('✨ SWF Thumbnails Done.');
    process.exit(0);
})();