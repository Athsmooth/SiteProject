import puppeteer from 'puppeteer';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Concurrency
const HTML5_CONCURRENCY = 10;
const SWF_CONCURRENCY = 5;
const GBA_CONCURRENCY = 3;

// Utility to recursively get files by extension
function getFilesByExt(dir, exts, array = []) {
    const files = fs.readdirSync(dir);
    files.forEach(file => {
        const fullPath = path.join(dir, file);
        if (fs.statSync(fullPath).isDirectory()) {
            getFilesByExt(fullPath, exts, array);
        } else if (exts.some(e => file.toLowerCase().endsWith(e))) {
            array.push(fullPath);
        }
    });
    return array;
}

// ---------------- HTML5 ----------------
async function captureHtml5(browser, filePath, gamesDir, thumbDir) {
    const relativePath = path.relative(gamesDir, filePath);
    const gameName = relativePath.includes(path.sep) 
        ? relativePath.split(path.sep)[0] 
        : path.basename(filePath, path.extname(filePath));
    const thumbPath = path.join(thumbDir, `${gameName}.jpg`);

    if (fs.existsSync(thumbPath)) return `⏭️  Skipping existing HTML5: ${gameName}`;

    let page;
    try {
        page = await browser.newPage();
        await page.setViewport({ width: 400, height: 225 });

        await Promise.race([
            (async () => {
                await page.goto(`file://${filePath}`, { waitUntil: 'domcontentloaded', timeout: 10000 });
                await new Promise(r => setTimeout(r, 2000));
                await page.screenshot({ path: thumbPath, type: 'jpeg', quality: 50 });
            })(),
            new Promise((_, reject) => setTimeout(() => reject(new Error('TIMEOUT')), 12000))
        ]);

        return `✅ HTML5: ${gameName}`;
    } catch (e) {
        return `❌ HTML5: ${gameName} | ${e.message}`;
    } finally {
        if (page) await page.close().catch(() => {});
    }
}

// ---------------- SWF ----------------
async function captureSwf(browser, swfPath, thumbDir, playerHtmlPath) {
    const fileName = path.basename(swfPath, '.swf');
    const thumbPath = path.join(thumbDir, `${fileName}.jpg`);

    if (fs.existsSync(thumbPath)) return `⏭️  Skipping existing SWF: ${fileName}`;

    let page;
    try {
        page = await browser.newPage();
        await page.setViewport({ width: 800, height: 600 });

        const targetUrl = `file://${playerHtmlPath}?game=${encodeURIComponent(swfPath)}`;
        await page.goto(targetUrl, { waitUntil: 'networkidle2', timeout: 15000 });
        await new Promise(r => setTimeout(r, 4000));

        await page.screenshot({ 
            path: thumbPath, 
            type: 'jpeg', 
            quality: 70,
            clip: { x: 0, y: 60, width: 800, height: 540 }
        });

        return `✅ SWF: ${fileName}`;
    } catch (e) {
        return `❌ SWF: ${fileName} | ${e.message}`;
    } finally {
        if (page) await page.close().catch(() => {});
    }
}

// ---------------- GBA ----------------
async function captureGba(browser, romPath, thumbDir, playerHtmlPath) {
    const fileName = path.basename(romPath, path.extname(romPath));
    const thumbPath = path.join(thumbDir, `${fileName}.jpg`);

    if (fs.existsSync(thumbPath)) return `⏭️  Skipping existing GBA: ${fileName}`;

    let page;
    try {
        page = await browser.newPage();
        await page.setViewport({ width: 240, height: 160 });

        const targetUrl = `file://${playerHtmlPath}?game=${encodeURIComponent(romPath)}`;
        await page.goto(targetUrl, { waitUntil: 'networkidle2', timeout: 15000 });
        await new Promise(r => setTimeout(r, 4000));

        await page.screenshot({ path: thumbPath, type: 'jpeg', quality: 70 });
        return `✅ GBA: ${fileName}`;
    } catch (e) {
        return `❌ GBA: ${fileName} | ${e.message}`;
    } finally {
        if (page) await page.close().catch(() => {});
    }
}

// ---------------- Main ----------------
(async () => {
    const thumbDir = path.join(__dirname, 'assets', 'thumbnails');
    if (!fs.existsSync(thumbDir)) fs.mkdirSync(thumbDir, { recursive: true });

    const html5Dir = path.join(__dirname, 'html5');
    const swfDir = path.join(__dirname, 'swf');
    const gbaDir = path.join(__dirname, 'gba');

    const ruffleHtml = path.join(__dirname, 'ruffleplayer.html');
    const gbaHtml = path.join(__dirname, 'gba-player.html');

    const html5Files = getFilesByExt(html5Dir, ['.html', '.htm']);
    const swfFiles = getFilesByExt(swfDir, ['.swf']);
    const gbaFiles = getFilesByExt(gbaDir, ['.gba']);

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

    console.log(`🚀 HTML5 Tasks: ${html5Files.length}`);
    const html5Work = [...html5Files];
    const html5Workers = Array(HTML5_CONCURRENCY).fill(0).map(async () => {
        while (html5Work.length > 0) {
            const file = html5Work.pop();
            console.log(await captureHtml5(browser, file, html5Dir, thumbDir));
        }
    });
    await Promise.all(html5Workers);

    console.log(`🚀 SWF Tasks: ${swfFiles.length}`);
    const swfWork = [...swfFiles];
    const swfWorkers = Array(SWF_CONCURRENCY).fill(0).map(async () => {
        while (swfWork.length > 0) {
            const file = swfWork.pop();
            console.log(await captureSwf(browser, file, thumbDir, ruffleHtml));
        }
    });
    await Promise.all(swfWorkers);

    console.log(`🚀 GBA Tasks: ${gbaFiles.length}`);
    const gbaWork = [...gbaFiles];
    const gbaWorkers = Array(GBA_CONCURRENCY).fill(0).map(async () => {
        while (gbaWork.length > 0) {
            const file = gbaWork.pop();
            console.log(await captureGba(browser, file, thumbDir, gbaHtml));
        }
    });
    await Promise.all(gbaWorkers);

    await browser.close();
    console.log('✨ All thumbnails done (existing files skipped).');
    process.exit(0);
})();