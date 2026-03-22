document.addEventListener("DOMContentLoaded", async () => {
    // --- 1. CONFIGURATION & DATA FETCH ---
    let gameFiles = [];
    const BATCH_SIZE = 24;
    let currentIndex = 0;
    let filteredGames = [];

    try {
        const response = await fetch('./games-list.json');
        if (!response.ok) throw new Error("JSON not found");
        gameFiles = await response.json();
    } catch (err) {
        console.warn("Automation: games-list.json not found. Make sure to run generate-games.js.");
    }

    // --- 2. DYNAMIC STYLES ---
    const style = document.createElement('style');
    style.textContent = `
        :root { 
            --accent: #ff9800; 
            --bg: #090412; 
            --panel: #1a1a2e; 
            --text: #ffffff;
        }
        
        body { 
            margin: 0; padding: 0; background: var(--bg); color: var(--text); 
            font-family: 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
            min-height: 100vh; overflow-y: scroll;
        }

        /* Navbar Styling */
        .my-nav { 
            background: rgba(9, 4, 18, 0.95); 
            backdrop-filter: blur(10px);
            padding: 10px 20px; 
            display: flex; flex-wrap: wrap; justify-content: space-between; align-items: center; 
            border-bottom: 1px solid #333; 
            position: sticky; top: 0; z-index: 10000; gap: 15px;
        }

        .nav-left { display: flex; align-items: center; gap: 20px; }
        .nav-logo { color: white; text-decoration: none; font-weight: bold; font-size: 1.4rem; letter-spacing: 1px; }
        
        .search-container { position: relative; flex-grow: 1; max-width: 400px; }
        .search-input { 
            width: 100%; background: #16121e; border: 1px solid #444; 
            padding: 12px 20px; border-radius: 30px; color: white; outline: none;
            transition: border-color 0.3s;
        }
        .search-input:focus { border-color: var(--accent); }

        .nav-right { display: flex; gap: 10px; }
        .nav-btn { background: #2a2a4a; color: white; border: none; padding: 10px 18px; border-radius: 8px; cursor: pointer; font-weight: 600; transition: 0.2s; }
        .nav-btn:hover { background: #3a3a6a; }
        .panic-btn { background: #ff4444; }
        .panic-btn:hover { background: #cc0000; }

        /* Grid Layout */
        .projects-placeholder { padding-bottom: 100px; }
        .projects-grid { 
            display: grid; 
            grid-template-columns: repeat(auto-fill, minmax(240px, 1fr)); 
            gap: 20px; padding: 40px 20px; max-width: 1400px; margin: 0 auto; 
        }
        
        /* Game Card Styling */
        .game-link { text-decoration: none; color: inherit; display: block; }
        .game-card { 
            position: relative; border-radius: 12px; overflow: hidden; 
            background: #000; border: 1px solid #222; aspect-ratio: 16 / 9;
            transition: transform 0.3s, box-shadow 0.3s;
        }
        .game-card:hover { 
            transform: translateY(-5px); 
            box-shadow: 0 10px 20px rgba(0,0,0,0.5);
            border-color: var(--accent); 
        }

        .game-thumbnail { 
            width: 100%; height: 100%; object-fit: cover; display: block; 
            transition: opacity 0.3s;
        }

        .game-label { 
            position: absolute; bottom: 0; width: 100%; 
            background: linear-gradient(transparent, rgba(0,0,0,0.85)); 
            color: white; font-size: 14px; padding: 20px 10px 10px 10px; 
            text-align: center; font-weight: 500;
            box-sizing: border-box;
        }
    `;
    document.head.appendChild(style);

    // --- 3. INJECT NAVBAR HTML ---
    const navHTML = `
        <nav class="my-nav">
            <div class="nav-left">
                <a href="/" class="nav-logo">KRECAK</a>
                <div class="search-container">
                    <input type="text" id="gameSearch" class="search-input" placeholder="Search 300+ games...">
                </div>
            </div>
            <div class="nav-right">
                <button class="nav-btn" id="randomBtn">Random</button>
                <button class="nav-btn panic-btn" id="panicButton">PANIC</button>
            </div>
        </nav>`;
    document.body.insertAdjacentHTML('afterbegin', navHTML);

    // --- 4. RENDER LOGIC ---
    const gridContainer = document.querySelector('.projects-placeholder');

    const renderBatch = () => {
        if (!gridContainer) return;

        let grid = document.querySelector('.projects-grid');
        if (!grid) {
            grid = document.createElement('div');
            grid.className = 'projects-grid';
            gridContainer.appendChild(grid);
        }

        const nextBatch = filteredGames.slice(currentIndex, currentIndex + BATCH_SIZE);
        if (nextBatch.length === 0) return;

        let batchHTML = '';
        nextBatch.forEach(game => {
            // Clean up the name: "my-game-file" -> "My Game File"
            const rawFileName = game.file.split('/').pop().split('.')[0];
            const cleanName = decodeURIComponent(rawFileName)
                .replace(/[-_]/g, ' ')
                .split(' ')
                .map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
                .join(' ');

            batchHTML += `
                <a href="${game.file}" class="game-link">
                    <div class="game-card">
                        <img class="game-thumbnail" 
                             src="${game.thumb || 'assets/default-icon.png'}" 
                             loading="lazy" 
                             onerror="this.src='assets/default-icon.png'">
                        <div class="game-label">${cleanName}</div>
                    </div>
                </a>`;
        });
        
        grid.insertAdjacentHTML('beforeend', batchHTML);
        currentIndex += BATCH_SIZE;

        // Auto-fill screen if it's too empty
        if (document.body.scrollHeight <= window.innerHeight && currentIndex < filteredGames.length) {
            renderBatch();
        }
    };

    const resetAndRender = (filter = "") => {
        currentIndex = 0;
        const grid = document.querySelector('.projects-grid');
        if (grid) grid.innerHTML = ''; 
        
        filteredGames = gameFiles.filter(g => 
            g.file.toLowerCase().includes(filter.toLowerCase())
        );
        renderBatch();
    };

    // --- 5. INTERACTION EVENTS ---
    
    // Infinite Scroll
    window.addEventListener('scroll', () => {
        if ((window.innerHeight + window.scrollY) >= document.body.offsetHeight - 1000) {
            if (currentIndex < filteredGames.length) renderBatch();
        }
    });

    // Search Input
    document.getElementById('gameSearch').addEventListener('input', (e) => {
        resetAndRender(e.target.value);
    });

    // Panic Button
    document.getElementById('panicButton').onclick = () => {
        window.location.href = "https://classroom.google.com";
    };

    // Random Game
    document.getElementById('randomBtn').onclick = () => {
        const rand = gameFiles[Math.floor(Math.random() * gameFiles.length)];
        if (rand) window.location.href = rand.file;
    };

    // Initial Load
    resetAndRender();
});