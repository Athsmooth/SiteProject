document.addEventListener("DOMContentLoaded", async () => {
    // --- 1. FETCH DATA ---
    let gameFiles = [];
    try {
        const response = await fetch('./games-list.json');
        gameFiles = await response.json();
    } catch (err) {
        console.warn("Automation: games-list.json not found.");
    }

    // --- 2. STYLES ---
    const style = document.createElement('style');
    style.textContent = `
        :root { --accent: #ff9800; --bg: #1a1a1a; --panel: #2a2a2a; }
        
        .my-nav { 
            background: var(--bg); padding: 10px 20px; 
            display: flex; flex-wrap: wrap; justify-content: space-between; align-items: center; 
            font-family: 'Segoe UI', sans-serif; border-bottom: 2px solid #333; 
            position: sticky; top: 0; z-index: 1000; gap: 15px;
        }

        .nav-left { display: flex; align-items: center; gap: 20px; }
        .nav-logo { color: white; text-decoration: none; font-weight: bold; font-size: 1.2rem; }
        
        /* Search Bar Styling */
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
        .panic-btn:hover { background: #cc0000; }

        /* Grid Setup */
        .projects-grid { 
            display: grid; grid-template-columns: repeat(auto-fill, minmax(180px, 1fr)); 
            gap: 20px; padding: 20px; max-width: 1300px; margin: 0 auto; 
        }
        .game-link { text-decoration: none; transition: 0.2s; }
        .game-card { 
            position: relative; border-radius: 10px; overflow: hidden; 
            background: #000; border: 2px solid #333; aspect-ratio: 1/1; 
        }
        .game-preview { 
            width: 1024px; height: 1024px; transform: scale(0.18); 
            transform-origin: 0 0; border: none; pointer-events: none; 
        }
        .game-label { 
            position: absolute; bottom: 0; width: 100%; background: rgba(0,0,0,0.8); 
            color: white; font-size: 11px; padding: 5px; text-align: center; 
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
                <button class="nav-btn" id="randomBtn">Random</button>
                <button class="nav-btn panic-btn" id="panicButton">PANIC</button>
            </div>
        </nav>`;
    document.body.insertAdjacentHTML('afterbegin', navHTML);

    // --- 4. GRID LOGIC ---
    const gridContainer = document.querySelector('.projects-placeholder');
    
    const renderGrid = (filter = "") => {
        if (!gridContainer) return;
        let html = '<div class="projects-grid">';
        
        const filteredGames = gameFiles.filter(g => {
            const name = g.file.split('/').pop().toLowerCase();
            return name.includes(filter.toLowerCase());
        });

        filteredGames.forEach(game => {
            const cleanName = game.file.split('/').pop().split('.')[0].replace(/-/g, ' ');
            html += `
                <a href="${game.file}" class="game-link">
                    <div class="game-card">
                        <iframe class="game-preview" src="${game.file}" loading="lazy"></iframe>
                        <div class="game-label">${cleanName}</div>
                    </div>
                </a>`;
        });
        gridContainer.innerHTML = html + '</div>';
    };

    // --- 5. BUTTON EVENTS ---
    document.getElementById('panicButton').onclick = () => window.open("https://drive.google.com", "_blank");
    
    document.getElementById('randomBtn').onclick = () => {
        const randomGame = gameFiles[Math.floor(Math.random() * gameFiles.length)];
        window.location.href = randomGame.file;
    };

    document.getElementById('gameSearch').oninput = (e) => {
        renderGrid(e.target.value);
    };

    // Initial Load
    renderGrid();
});