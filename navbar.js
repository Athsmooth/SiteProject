document.addEventListener("DOMContentLoaded", async () => {
    // --- 1. FETCH DATA ---
    let gameFiles = [];
    try {
        const response = await fetch('./games-list.json');
        gameFiles = await response.json();
    } catch (err) {
        console.warn("Automation: games-list.json not found.");
    }

    // --- 2. STYLES (Memory & Rendering Optimized) ---
    const style = document.createElement('style');
    style.textContent = `
        :root { --accent: #ff9800; --bg: #1a1a1a; --panel: #2a2a2a; }
        
        body { margin: 0; background: var(--bg); color: white; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; }

        .my-nav { 
            background: var(--bg); padding: 10px 20px; 
            display: flex; flex-wrap: wrap; justify-content: space-between; align-items: center; 
            border-bottom: 2px solid #333; position: sticky; top: 0; z-index: 1000; gap: 15px;
        }

        .nav-left { display: flex; align-items: center; gap: 20px; }
        .nav-logo { color: white; text-decoration: none; font-weight: bold; font-size: 1.2rem; }
        
        .search-container { position: relative; flex-grow: 1; max-width: 400px; }
        .search-input { 
            width: 100%; background: var(--panel); border: 1px solid #444; 
            padding: 8px 15px; border-radius: 20px; color: white; outline: none;
            transition: 0.3s;
        }
        .search-input:focus { border-color: var(--accent); box-shadow: 0 0 8px rgba(255,152,0,0.3); }

        .nav-right { display: flex; gap: 10px; align-items: center; }
        .nav-btn { 
            background: var(--panel); color: white; border: none; 
            padding: 8px 15px; border-radius: 6px; cursor: pointer; 
            font-weight: 600; transition: 0.2s; font-size: 0.9rem;
        }
        .nav-btn:hover { background: #3a3a3a; }
        .panic-btn { background: #ff4444; }

        /* Optimized Grid */
        .projects-grid { 
            display: grid; 
            grid-template-columns: repeat(auto-fill, minmax(220px, 1fr)); 
            gap: 25px; padding: 25px; max-width: 1600px; margin: 0 auto; 
        }
        
        .game-link { text-decoration: none; color: inherit; }

        .game-card { 
            position: relative; border-radius: 12px; overflow: hidden; 
            background: #000; border: 2px solid #333; aspect-ratio: 16 / 9;
            transition: transform 0.2s ease, border-color 0.2s;
            /* RAM Optimization: Don't render if off-screen */
            content-visibility: auto;
            contain-intrinsic-size: 220px 124px;
        }
        
        .game-card:hover { transform: translateY(-5px); border-color: var(--accent); }

        .game-thumbnail { 
            width: 100%; height: 100%; object-fit: cover; display: block;
            background: #222; /* Placeholder color while loading */
        }

        .game-label { 
            position: absolute; bottom: 0; width: 100%; 
            background: linear-gradient(transparent, rgba(0,0,0,0.9)); 
            color: white; font-size: 13px; padding: 15px 5px 8px 5px; text-align: center;
            font-weight: 500; pointer-events: none;
        }
    `;
    document.head.appendChild(style);

    // --- 3. INJECT MENUBAR ---
    const navHTML = `
        <nav class="my-nav">
            <div class="nav-left">
                <a href="index.html" class="nav-logo">Krecak Kreations</a>
                <div class="search-container">
                    <input type="text" id="gameSearch" class="search-input" placeholder="Search 300+ games...">
                </div>
            </div>
            <div class="nav-right">
                <button class="nav-btn" id="randomBtn">Random Game</button>
                <button class="nav-btn panic-btn" id="panicButton">PANIC</button>
            </div>
        </nav>`;
    document.body.insertAdjacentHTML('afterbegin', navHTML);

    // --- 4. PAGINATED GRID LOGIC (RAM SAVER) ---
    const gridPlaceholder = document.querySelector('.projects-placeholder');
    let filteredGames = [];
    let currentIndex = 0;
    const BATCH_SIZE = 24; // Number of games to load at a time

    const renderBatch = () => {
        if (!gridPlaceholder) return;
        
        let grid = document.querySelector('.projects-grid');
        if (!grid) {
            grid = document.createElement('div');
            grid.className = 'projects-grid';
            gridPlaceholder.appendChild(grid);
        }

        const nextBatch = filteredGames.slice(currentIndex, currentIndex + BATCH_SIZE);
        
        nextBatch.forEach(game => {
            const rawFileName = game.file.split('/').pop().split('.')[0];
            
            // Clean up titles: Decode %20, replace - with space, and Title Case
            const decodedName = decodeURIComponent(rawFileName).replace(/[-_]/g, ' ');
            const cleanName = decodedName.split(' ')
                .map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
                .join(' ');

            const cardHTML = `
                <a href="${game.file}" class="game-link">
                    <div class="game-card">
                        <img class="game-thumbnail" 
                             src="assets/thumbnails/${rawFileName}.png" 
                             alt="${cleanName}"
                             loading="lazy"
                             onerror="this.src='assets/default-icon.png'">
                        <div class="game-label">${cleanName}</div>
                    </div>
                </a>`;
            grid.insertAdjacentHTML('beforeend', cardHTML);
        });

        currentIndex += BATCH_SIZE;
    };

    const renderGrid = (filter = "") => {
        currentIndex = 0;
        gridPlaceholder.innerHTML = ''; // Wipe DOM to free up RAM
        
        filteredGames = gameFiles.filter(g => {
            const name = g.file.split('/').pop().toLowerCase();
            return name.includes(filter.toLowerCase());
        });

        renderBatch();
    };

    // Infinite Scroll Event
    window.onscroll = () => {
        if ((window.innerHeight + window.scrollY) >= document.body.offsetHeight - 800) {
            if (currentIndex < filteredGames.length) {
                renderBatch();
            }
        }
    };

    // --- 5. BUTTON EVENTS ---
    document.getElementById('panicButton').onclick = () => window.open("https://classroom.google.com", "_blank");
    
    document.getElementById('randomBtn').onclick = () => {
        if (gameFiles.length === 0) return;
        const randomGame = gameFiles[Math.floor(Math.random() * gameFiles.length)];
        window.location.href = randomGame.file;
    };

    document.getElementById('gameSearch').oninput = (e) => {
        renderGrid(e.target.value);
    };

    // Initial Load
    renderGrid();
});