document.addEventListener("DOMContentLoaded", async () => {
    // --- 1. FETCH DATA ---
    let gameFiles = [];
    try {
        const response = await fetch('./games-list.json');
        gameFiles = await response.json();
    } catch (err) {
        console.warn("Automation: games-list.json not found. Run the build script.");
    }

    // --- 2. STYLES ---
    const style = document.createElement('style');
    style.textContent = `
        :root { --accent: #ff9800; --bg: #1a1a1a; --panel: #2a2a2a; }
        
        html, body { 
            margin: 0; padding: 0; background: var(--bg); color: white; 
            font-family: 'Segoe UI', system-ui, sans-serif;
            min-height: 100vh; overflow-y: scroll;
        }

        .my-nav { 
            background: var(--bg); padding: 10px 20px; 
            display: flex; flex-wrap: wrap; justify-content: space-between; align-items: center; 
            border-bottom: 2px solid #333; position: sticky; top: 0; z-index: 10000; gap: 15px;
        }

        .nav-left { display: flex; align-items: center; gap: 20px; }
        .nav-logo { color: white; text-decoration: none; font-weight: bold; font-size: 1.2rem; }
        
        .search-container { position: relative; flex-grow: 1; max-width: 400px; }
        .search-input { 
            width: 100%; background: var(--panel); border: 1px solid #444; 
            padding: 10px 18px; border-radius: 25px; color: white; outline: none;
        }

        .nav-right { display: flex; gap: 10px; }
        .nav-btn { background: var(--panel); color: white; border: none; padding: 8px 16px; border-radius: 8px; cursor: pointer; }
        .panic-btn { background: #ff4444; }

        .projects-placeholder { min-height: 100vh; padding-bottom: 100px; }

        .projects-grid { 
            display: grid; grid-template-columns: repeat(auto-fill, minmax(220px, 1fr)); 
            gap: 25px; padding: 30px 20px; max-width: 1600px; margin: 0 auto; 
        }
        
        .game-link { text-decoration: none; color: inherit; }
        .game-card { 
            position: relative; border-radius: 12px; overflow: hidden; 
            background: #000; border: 2px solid #333; aspect-ratio: 16 / 9;
            transition: transform 0.2s;
        }
        .game-card:hover { transform: scale(1.05); border-color: var(--accent); }
        .game-thumbnail { width: 100%; height: 100%; object-fit: cover; display: block; }
        .game-label { 
            position: absolute; bottom: 0; width: 100%; background: linear-gradient(transparent, rgba(0,0,0,0.9)); 
            color: white; font-size: 13px; padding: 15px 5px 8px 5px; text-align: center;
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
    const gridContainer = document.querySelector('.projects-placeholder') || document.body;
    let filteredGames = [];
    let currentIndex = 0;
    const BATCH_SIZE = 24;

    const renderBatch = () => {
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
            const rawFileName = game.file.split('/').pop().split('.')[0];
            const cleanName = decodeURIComponent(rawFileName)
                .replace(/[-_]/g, ' ')
                .replace(/\b\w/g, l => l.toUpperCase());

            batchHTML += `
                <a href="${game.file}" class="game-link">
                    <div class="game-card">
                        <img class="game-thumbnail" 
                             src="${game.thumb}" 
                             onerror="this.src='assets/default-icon.png'" 
                             loading="lazy">
                        <div class="game-label">${cleanName}</div>
                    </div>
                </a>`;
        });
        
        grid.insertAdjacentHTML('beforeend', batchHTML);
        currentIndex += BATCH_SIZE;
    };

    const resetAndRender = (filter = "") => {
        currentIndex = 0;
        const grid = document.querySelector('.projects-grid');
        if (grid) grid.innerHTML = ''; 
        filteredGames = gameFiles.filter(g => g.file.toLowerCase().includes(filter.toLowerCase()));
        renderBatch();
    };

    // --- 5. EVENTS ---
    window.addEventListener('scroll', () => {
        if ((window.innerHeight + window.scrollY) >= document.body.offsetHeight - 800) {
            if (currentIndex < filteredGames.length) renderBatch();
        }
    });

    document.getElementById('gameSearch').addEventListener('input', (e) => resetAndRender(e.target.value));
    document.getElementById('panicButton').onclick = () => window.location.href = "https://google.com";
    document.getElementById('randomBtn').onclick = () => {
        const rand = gameFiles[Math.floor(Math.random() * gameFiles.length)];
        if(rand) window.location.href = rand.file;
    };

    resetAndRender();
});