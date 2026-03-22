import puppeteer from 'puppeteer';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// With 28 threads, 20 is the "Sweet Spot"
const CONCURRENCY = 20; 

const getAllHtmlFiles = (dirPath, arrayOfFiles) => {
    const files = fs.readdirSync(dirPath);
    arrayOfFiles = arrayOfFiles || [];
    files.forEach((file) => {
        const fullPath = path.join(dirPath, file);
        if (fs.statSync(fullPath).isDirectory()) {
            arrayOfFiles = getAllHtmlFiles(fullPath, arrayOfFiles);
        } else if (file.toLowerCase().endsWith('.html') || file.toLowerCase().endsWith('.htm')) {
            arrayOfFiles.push(fullPath);
        }
    });
    return arrayOfFiles;
};

async function captureGame(browser, filePath, gamesDir, thumbDir) {
    const relativePath = path.relative(gamesDir, filePath);
    let gameName = relativePath.includes(path.sep) 
        ? relativePath.split(path.sep)[0] 
        : path.basename(filePath, path.extname(filePath));

    const thumbPath = path.join(thumbDir, `${gameName}.jpg`);
    if (fs.existsSync(thumbPath)) return `⏭️  Skipped: ${gameName}`;

    const page = await browser.newPage();
    await page.setViewport({ width: 480, height: 270 });
    
    // Kill the individual tab if it hangs for more than 10 seconds
    const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Tab Hang')), 10000)
    );

    try {
        await Promise.race([
            (async () => {
                // Use 'load' for local files on high-thread machines
                await page.goto(`file://${filePath}`, { waitUntil: 'load', timeout: 8000 });
                await new Promise(r => setTimeout(r, 2000)); 
                await page.screenshot({ path: thumbPath, type: 'jpeg', quality: 50 });
            })(),
            timeoutPromise
        ]);
        return `✅ ${gameName}`;
    } catch (e) {
        return `❌ ${gameName}: ${e.message}`;
    } finally {
        await page.close().catch(() => {});
    }
}

(async () => {
    const gamesDir = path.join(__dirname, 'html5');
    const thumbDir = path.join(__dirname, 'assets', 'thumbnails');

    if (!fs.existsSync(thumbDir)) fs.mkdirSync(thumbDir, { recursive: true });

    const allPaths = getAllHtmlFiles(gamesDir);
    console.log(`🔥 28-Thread Mode Engaged. Processing ${allPaths.length} games...`);

    const browser = await puppeteer.launch({ 
        headless: "new",
        args: [
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-dev-shm-usage', // STOP THE HANGING
            '--disable-gpu',           // Don't use the 4070 for this (faster)
            '--allow-file-access-from-files',
            '--disable-web-security'
        ] 
    });

    const work = [...allPaths];
    const workers = Array(CONCURRENCY).fill(0).map(async () => {
        while (work.length > 0) {
            const filePath = work.pop();
            console.log(await captureGame(browser, filePath, gamesDir, thumbDir));
        }
    });

    await Promise.all(workers);
    await browser.close();
    console.log('✨ DONE.');
})();