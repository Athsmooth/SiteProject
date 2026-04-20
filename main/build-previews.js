const fs = require('fs');
const path = require('path');

// --- 1. SETTINGS ---
const TARGET_FOLDER_NAME = 'swf'; // The name of your folder
const QUARANTINE_FOLDER_NAME = 'too-large-for-cloudflare';
const LIMIT_MB = 25;
const LIMIT_BYTES = LIMIT_MB * 1024 * 1024;

// --- 2. DYNAMIC PATH RESOLVING ---
// This finds the folder based on where THIS script is saved
const scriptDir = __dirname;
const swfPath = path.join(scriptDir, TARGET_FOLDER_NAME);
const destPath = path.join(scriptDir, QUARANTINE_FOLDER_NAME);

console.log("--- DEBUG INFO ---");
console.log("Script Location:", scriptDir);
console.log("Looking for SWF folder at:", swfPath);

if (!fs.existsSync(swfPath)) {
    console.log("❌ ERROR: The folder '/swf' was not found at that location!");
    console.log("Make sure this script is in the same folder as your 'swf' directory.");
    process.exit();
}

if (!fs.existsSync(destPath)) fs.mkdirSync(destPath, { recursive: true });

// --- 3. THE SCANNER ---
function scan(currentDir) {
    const files = fs.readdirSync(currentDir);
    
    if (files.length === 0) {
        console.log(`(Folder ${path.basename(currentDir)} is empty)`);
        return;
    }

    files.forEach(file => {
        const fullPath = path.join(currentDir, file);
        const stat = fs.statSync(fullPath);

        if (stat.isDirectory()) {
            scan(fullPath); // Keep diving
        } else {
            const sizeMB = (stat.size / (1024 * 1024)).toFixed(2);
            
            if (stat.size > LIMIT_BYTES) {
                console.log(`⚠️ MATCH: ${file} is ${sizeMB} MB. MOVING...`);
                const finalDest = path.join(destPath, file);
                
                try {
                    fs.renameSync(fullPath, finalDest);
                    console.log(`✅ Success: Moved ${file}`);
                } catch (e) {
                    // Fallback for Windows "File in use" errors
                    fs.copyFileSync(fullPath, finalDest);
                    fs.unlinkSync(fullPath);
                    console.log(`✅ Success (via Copy): Moved ${file}`);
                }
            } else {
                console.log(`- Skipping: ${file} (${sizeMB} MB)`);
            }
        }
    });
}

console.log("\n--- STARTING SCAN ---");
scan(swfPath);
console.log("\nDone!");