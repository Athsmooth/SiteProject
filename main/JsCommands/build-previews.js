const fs = require('fs');
const path = require('path');
const readline = require('readline');

// UPDATED: Points to your new folder name
const MAIN_FILES_DIR = path.join(__dirname, '../mainFiles'); 
const PLAYERS_DIR = path.join(__dirname, '../players');
const OUTPUT_FILE = path.join(__dirname, '../games-list.json');

const rl = readline.createInterface({ input: process.stdin, output: process.stdout });

const PLAYER_TEMPLATES = {
    flash: `<!DOCTYPE html><html><head>
        <link rel="stylesheet" href="../style.css">
        <link rel="stylesheet" href="../embedstyle.css">
        <script src="../navbar.js"></script>
        <script src="https://unpkg.com/@ruffle-rs/ruffle"></script>
    </head><body><div id="navbar-container"></div><div id="ruffle-container" class="game-content"></div><script>
        const urlParams = new URLSearchParams(window.location.search);
        let g = urlParams.get('game'); 
        // Ensure path starts with /main/
        if(g && !g.startsWith('/main/')) g = '/main/'+g;
        window.RufflePlayer = window.RufflePlayer || {};
        const ruffle = window.RufflePlayer.newest(); const player = ruffle.createPlayer();
        document.getElementById("ruffle-container").appendChild(player); player.load(g);
    </script></body></html>`,
    
    retro: `<!DOCTYPE html><html><head>
        <link rel="stylesheet" href="../style.css">
        <link rel="stylesheet" href="../embedstyle.css">
        <script src="../navbar.js"></script>
    </head><body><div id="navbar-container"></div><div id="game-container" class="game-content"></div><script src="/main/emulators/emulatorjs/emulator.js"></script><script>
        const urlParams = new URLSearchParams(window.location.search);
        let g = urlParams.get('game');
        if(g && !g.startsWith('/main/')) g = '/main/'+g;
        new EmulatorJS("game-container", { system: urlParams.get('system'), rom: g, path: "/main/emulators/emulatorjs/data/", autoplay: true });
    </script></body></html>`,
    
    html5: `<!DOCTYPE html><html><head>
        <link rel="stylesheet" href="../style.css">
        <link rel="stylesheet" href="../embedstyle.css">
        <script src="../navbar.js"></script>
    </head><body><div id="navbar-container"></div><iframe id="game" class="game-content" src=""></iframe><script>
        const urlParams = new URLSearchParams(window.location.search);
        let g = urlParams.get('game');
        if(g && !g.startsWith('/main/')) g = '/main/'+g;
        document.getElementById('game').src = g;
    </script></body></html>`
};

function generate(overwrite) {
    if (!fs.existsSync(MAIN_FILES_DIR)) {
        console.error("❌ ERROR: Folder 'mainFiles' not found at: " + MAIN_FILES_DIR);
        process.exit(1);
    }

    if (!fs.existsSync(PLAYERS_DIR)) fs.mkdirSync(PLAYERS_DIR, { recursive: true });

    const games = [];
    const cats = fs.readdirSync(MAIN_FILES_DIR).filter(f => fs.statSync(path.join(MAIN_FILES_DIR, f)).isDirectory());

    cats.forEach(cat => {
        const pName = `${cat}player.html`;
        const playerPath = path.join(PLAYERS_DIR, pName);
        let tKey = (cat === 'flash' || cat === 'swf') ? 'flash' : (['gb', 'gba', 'nes', 'snes', 'genesis'].includes(cat) ? 'retro' : 'html5');

        if (!fs.existsSync(playerPath) || overwrite) {
            fs.writeFileSync(playerPath, PLAYER_TEMPLATES[tKey]);
        }

        const catPath = path.join(MAIN_FILES_DIR, cat);
        fs.readdirSync(catPath).forEach(file => {
            games.push({
                name: path.parse(file).name.replace(/[_-]/g, ' '),
                category: cat,
                badgeClass: cat, // This makes the orange/blue borders work
                // UPDATED: Points to mainFiles instead of gameFiles
                file: `players/${pName}?game=mainFiles/${cat}/${file}&system=${cat}`,
                thumb: `assets/thumbnails/${path.parse(file).name}.jpg`
            });
        });
    });

    fs.writeFileSync(OUTPUT_FILE, JSON.stringify(games, null, 4));
    console.log(`✅ Done! Processed ${games.length} games from mainFiles.`);
    process.exit(0);
}

rl.question('1. Overwrite Players | 2. Update Games List Only: ', (choice) => { generate(choice === '1'); });