const fs = require('fs');
const path = require('path');

// --- CONFIGURATION ---
const swfFolders = ['./swf', './swf/games'];
const html5Folder = './html5';
const reportDir = './duplicates_report';
const reportFile = path.join(reportDir, 'master_hitlist.txt');
const SIMILARITY_THRESHOLD = 0.8; 

// --- HELPER FUNCTIONS ---
function normalize(str) {
    return str.toLowerCase().replace('.swf', '').replace('.html', '').replace(/[-_ ]/g, '');
}

// Extracts all numbers from a string as an array (e.g., "ducklife4" -> ["4"])
function getNumbers(str) {
    const matches = str.match(/\d+/g);
    return matches ? matches.join('') : '';
}

function getFileSize(filePath) {
    try {
        const stats = fs.statSync(filePath);
        return stats.size;
    } catch { return 0; }
}

function calculateSimilarity(s1, s2) {
    let longer = s1.length > s2.length ? s1 : s2;
    let shorter = s1.length > s2.length ? s2 : s1;
    if (longer.length === 0) return 1.0;
    return (longer.length - editDistance(longer, shorter)) / parseFloat(longer.length);
}

function editDistance(s1, s2) {
    let costs = [];
    for (let i = 0; i <= s1.length; i++) {
        let lastValue = i;
        for (let j = 0; j <= s2.length; j++) {
            if (i === 0) costs[j] = j;
            else if (j > 0) {
                let newValue = costs[j - 1];
                if (s1.charAt(i - 1) !== s2.charAt(j - 1))
                    newValue = Math.min(Math.min(newValue, lastValue), costs[j]) + 1;
                costs[j - 1] = lastValue;
                lastValue = newValue;
            }
        }
        if (i > 0) costs[s2.length] = lastValue;
    }
    return costs[s2.length];
}

// --- EXECUTION ---
console.log("🚀 Starting Series-Aware Audit...");

if (!fs.existsSync(reportDir)) fs.mkdirSync(reportDir);

const swfs = [];
swfFolders.forEach(folder => {
    if (fs.existsSync(folder)) {
        fs.readdirSync(folder).forEach(file => {
            if (file.toLowerCase().endsWith('.swf')) {
                const fullPath = path.join(folder, file);
                swfs.push({
                    name: file,
                    norm: normalize(file),
                    nums: getNumbers(file), // Store the version number
                    size: getFileSize(fullPath),
                    path: fullPath
                });
            }
        });
    }
});

let report = `GAME AUDIT REPORT - ${new Date().toLocaleString()}\n`;
report += `Rules: Exact matches prioritized. Fuzzy matches ignored if version numbers differ.\n`;
report += `--------------------------------------------------------------------------------\n\n`;

let foundCount = 0;

if (fs.existsSync(html5Folder)) {
    const htmls = fs.readdirSync(html5Folder).filter(f => 
        !['index.html', 'ruffleplayer.html', 'html5player.html', '404.html'].includes(f.toLowerCase())
    );

    htmls.forEach(hFolder => {
        const hPath = path.join(html5Folder, hFolder);
        const hNorm = normalize(hFolder);
        const hNums = getNumbers(hFolder);

        swfs.forEach(s => {
            // 1. Check if version numbers exist and if they match
            // If one is "ducklife2" and other is "ducklife4", this mismatch stops the flag.
            if (hNums !== s.nums) return; 

            const score = calculateSimilarity(hNorm, s.norm);
            
            if (score >= SIMILARITY_THRESHOLD) {
                foundCount++;
                const isExact = score === 1.0;
                
                report += `[${isExact ? "EXACT MATCH" : "FUZZY MATCH " + Math.round(score*100) + "%"}]\n`;
                report += `KEEP  (Flash): ${s.path}\n`;
                report += `TRASH (HTML5): ${hPath}\n`;
                
                if (!isExact && s.size > 0) {
                    // Directory size check is omitted for speed, but SWF size is shown for reference
                    report += `Note: Flash file size is ${(s.size / 1024 / 1024).toFixed(2)} MB\n`;
                }
                report += `\n`;
            }
        });
    });
}

fs.writeFileSync(reportFile, report);

console.log(`\n✅ Audit Complete!`);
console.log(`📊 Found ${foundCount} true duplicates.`);
console.log(`📂 Report saved to: ${reportFile}`);