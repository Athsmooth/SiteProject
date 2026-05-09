const fs = require('fs');
const path = require('path');

// --- 1. CONFIGURATION ---
const GAME_FILES_DIR = path.join(__dirname, '../gameFiles');
const OUTPUT_FILE = path.join(__dirname, '../games-list.json');
const PLAYERS_DIR = 'players'; // Folder where players are kept

console.log("--- AUTOMATED SCANNER STARTING ---");
console.log("Scanning Directory:", GAME_FILES_DIR);

if (!fs.existsSync(GAME_FILES_DIR)) {
    console.log("❌ ERROR: gameFiles folder not found at:", GAME_FILES_DIR);
    process.exit(1);
}

// --- 2. THE SCANNER ---
function generateLibrary() {
    const gamesList = [];
    
    // Get top-level folders (swf, html5, gb, etc.)
    const categories = fs.readdirSync(GAME_FILES_DIR).filter(file => {
        return fs.statSync(path.join(GAME_FILES_DIR, file)).isDirectory();
    });

    categories.forEach(category => {
        const categoryPath = path.join(GAME_FILES_DIR, category);
        const files = fs.readdirSync(categoryPath);

        console.log(`Processing category: [${category}]`);

        files.forEach(file => {
            const fullPath = path.join(categoryPath, file);
            const stat = fs.statSync(fullPath);

            // Only process files (skip subfolders)
            if (stat.isFile()) {
                const ext = path.extname(file).toLowerCase();
                const fileNameNoExt = path.parse(file).name;
                
                // Clean up the name (replace dashes/underscores with spaces)
                const niceName = fileNameNoExt.replace(/[_-]/g, ' ');

                // AUTOMATION LOGIC:
                // 1. Category is the folder name
                // 2. Player is <foldername>player.html (e.g., swfplayer.html)
                // 3. File path is gameFiles/<category>/<file>
                const entry = {
                    name: niceName,
                    category: category,
                    // Points to: players/swfplayer.html?game=gameFiles/swf/game.swf
                    file: `${PLAYERS_DIR}/${category}player.html?game=gameFiles/${category}/${file}`,
                    thumb: `assets/thumbnails/${fileNameNoExt}.jpg` // Assumes standard thumb path
                };

                gamesList.push(entry);
                console.log(`  + Added: ${niceName}`);
            }
        });
    });

    // --- 3. SAVE RESULTS ---
    try {
        fs.writeFileSync(OUTPUT_FILE, JSON.stringify(gamesList, null, 4));
        console.log(`\n✅ SUCCESS: Generated ${gamesList.length} games in ${OUTPUT_FILE}`);
    } catch (err) {
        console.log("❌ ERROR Writing File:", err);
    }
}

generateLibrary();