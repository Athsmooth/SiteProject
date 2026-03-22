import puppeteer from 'puppeteer';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const CONCURRENCY = 10; // Back to 10 for stability

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
    let gameName = relativePath.includes(path.sep) ? relativePath.split(path.sep)[0] : path.basename(filePath, path.extname(filePath));
    const thumbPath = path.join(thumbDir, `${gameName}.jpg`);

    if (fs.existsSync(thumbPath)) return `⏭️  Skipping ${gameName}`;

    let page;
    try {
        page = await browser.newPage();
        await page.setViewport({ width: 400, height: 225 });

        // HARD 12-SECOND LIMIT FOR THE ENTIRE LOGIC
        await Promise.race([
            (async () => {
                await page.goto(`file://${filePath}`, { waitUntil: 'domcontentloaded', timeout: 7000 });
                await new Promise(r => setTimeout(r, 2000));
                await page.screenshot({ path: thumbPath, type: 'jpeg', quality: 50 });
            })(),
            new Promise((_, reject) => setTimeout(() => reject(new Error('TIMEOUT')), 12000))
        ]);

        return `✅ ${gameName}`;
    } catch (e) {
        return `❌ ${gameName}: ${e.message}`;
    } finally {
        if (page) await page.close().catch(() => {});
    }
}

(async () => {
    const gamesDir = path.join(__dirname, 'html5');
    const thumbDir = path.join(__dirname, 'assets', 'thumbnails');
    if (!fs.existsSync(thumbDir)) fs.mkdirSync(thumbDir, { recursive: true });

    const allPaths = getAllHtmlFiles(gamesDir);
    console.log(`🚀 Threads: 28 | GPU: 4070 | Mode: Aggressive | Tasks: ${allPaths.length}`);

    const browser = await puppeteer.launch({
        headless: "new",
        args: [
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-dev-shm-usage', 
            '--disable-gpu',
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
    console.log('✨ Done.');
    process.exit(0); // Force the script to exit
})();