document.addEventListener("DOMContentLoaded", async () => {
    // --- 1. FETCH DATA ---
    let gameFiles = [];
    try {
        const response = await fetch('./games-list.json');
        gameFiles = await response.json();
    } catch (err) {
        console.warn("Automation: games-list.json not found.");
    }

    // --- 2. STYLES (UI & Scroll Fixed) ---
    const style = document.createElement('style');
    style.textContent = `
        :root { --accent: #ff9800; --bg: #1a1a1a; --panel: #2a2a2a; }
        
        html, body { 
            margin: 0; 
            padding: 0;
            background: var(--bg); 
            color: white; 
            font-family: 'Segoe UI', system-ui, sans-serif;
            min-height: 100vh; /* Keeps page scrollable */
            overflow-x: hidden;
        }

        .my-nav { 
            background: var(--bg); 
            padding: 10px 20px; 
            display: flex; 
            flex-wrap: wrap; 
            justify-content: space-between; 
            align-items: center; 
            border-bottom: 2px solid #333; 
            position: sticky; 
            top: 0; 
            z-index: 9999; /* Highest priority */
            gap: 15px;
        }

        .nav-left { display: flex; align-items: center; gap: 20px; }
        .nav-logo { color: white; text-decoration: none; font-weight: bold; font-size: 1.2rem; }
        
        .search-container { position: relative; flex-grow: 1; max-width: 400px; }
        .search-input { 
            width: 100%; background: var(--panel); border: 1px solid #444; 
            padding: 10px 18px; border-radius: 25px; color: white; outline: none;
            font-size: 1rem;
        }
        .search-input:focus { border-color: var(--accent); }

        .nav-right { display: flex; gap: 10px; }
        .nav-btn { 
            background: var(--panel); color: white; border: none; 
            padding: 8px 16px; border-radius: 8px; cursor: pointer; 
            font-weight: 600; transition: 0.2s;
        }
        .nav-btn:hover { background: #444; }
        .panic-btn { background: #ff4444; }

        /* Grid Layout */
        .projects-grid { 
            display: grid; 
            grid-template-columns: repeat(auto-fill, minmax(240px, 1fr)); 
            gap: 20px; 
            padding: 40px 20px; 
            max-width: 1600px; 
            margin: 0 auto; 
        }
        
        .game-link { text-decoration: none; color: inherit; display: block; }

        .game-card { 
            position: relative; 
            border-radius: 12px; 
            overflow: hidden; 
            background: #000; 
            border: 2px solid #333; 
            aspect-ratio: 16 / 9;
            transition: transform 0.2s ease;
            content-visibility: auto; /* RAM Saver */
        }
        
        .game-card:hover { transform: scale(1.03); border-color: var(--accent); }

        .game-thumbnail { width: 100%; height: 100%; object-fit: cover; display: block; }

        .game-label { 
            position: absolute; bottom: 0; width: 100%; 
            background: linear-gradient(transparent, rgba(0,0,0,0.9)); 
            color: white; font-size: 14px; padding: 20px 10px 10px; 
            text-align: center; pointer-events: none;
        }
    `;
    document.head.appendChild(style);

    // --- 3. INJECT NAVBAR ---
    const navHTML = `
        <nav class="my-nav">
            <div class="nav-left">
                <a href="/" class="nav-logo">Krecak Kreations</a>
                <div class="search-container">
                    <input type="text" id="gameSearch" class="search-input" placeholder="Search games...">
                </div>
            </div>
            <div class="nav-right">
                <button class="nav-btn" id="randomBtn">Random</button>
                <button class="nav-btn panic-btn" id="panicButton">PANIC</button>
            </div>
        </nav>`;
    document.body.insertAdjacentHTML('afterbegin', navHTML);

    // --- 4. RENDER LOGIC ---
    const gridPlaceholder = document.querySelector('.projects-placeholder') || document.body;
    let filteredGames = [];
    let currentIndex = 0;
    const BATCH_SIZE = 20;

    const renderBatch = () => {
        let grid = document.querySelector('.projects-grid');
        if (!grid) {
            grid = document.createElement('div');
            grid.className = 'projects-grid';
            gridPlaceholder.appendChild(grid);
        }

        const nextBatch = filteredGames.slice(currentIndex, currentIndex + BATCH_SIZE);
        
        nextBatch.forEach(game => {
            const rawFileName = game.file.split('/').pop().split('.')[0];
            const decodedName = decodeURIComponent(rawFileName).replace(/[-_]/g, ' ');
            const cleanName = decodedName.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(' ');

            const cardHTML = `
                <a href="${game.file}" class="game-link">
                    <div class="game-card">
                        <img class="game-thumbnail" src="assets/thumbnails/${rawFileName}.png" loading="lazy" onerror="this.src='assets/default-icon.png'">
                        <div class="game-label">${cleanName}</div>
                    </div>
                </a>`;
            grid.insertAdjacentHTML('beforeend', cardHTML);
        });
        currentIndex += BATCH_SIZE;
    };

    const resetAndRender = (filter = "") => {
        currentIndex = 0;
        const existingGrid = document.querySelector('.projects-grid');
        if (existingGrid) existingGrid.innerHTML = '';
        
        filteredGames = gameFiles.filter(g => g.file.toLowerCase().includes(filter.toLowerCase()));
        renderBatch();
    };

    // Infinite Scroll
    window.addEventListener('scroll', () => {
        if ((window.innerHeight + window.scrollY) >= document.body.offsetHeight - 1000) {
            if (currentIndex < filteredGames.length) renderBatch();
        }
    });

    // --- 5. EVENTS ---
    document.getElementById('gameSearch').addEventListener('input', (e) => resetAndRender(e.target.value));
    document.getElementById('panicButton').onclick = () => window.location.href = "https://google.com";
    document.getElementById('randomBtn').onclick = () => {
        const random = gameFiles[Math.floor(Math.random() * gameFiles.length)];
        if(random) window.location.href = random.file;
    };

    resetAndRender();
});