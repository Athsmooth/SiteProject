document.addEventListener("DOMContentLoaded", async () => {
    let gameFiles = [];
    let filteredGames = [];
    const gridContainer = document.querySelector('.projects-placeholder');
    let lastScrollTop = 0;

    // --- 1. LOAD DATA ---
    try {
        const response = await fetch('./games-list.json');
        if (!response.ok) throw new Error("JSON not found");
        gameFiles = await response.json();
    } catch (err) {
        console.warn("Games list not found. Run generate-games.js to create games-list.json!");
        if (gridContainer) {
            gridContainer.innerHTML = `<p style="color: white; text-align: center;">Error: games-list.json not found. Please run your generator script.</p>`;
        }
    }

    // --- 2. DYNAMIC STYLES ---
    const style = document.createElement('style');
    style.textContent = `
        :root { 
            --accent: #00ffcc; 
            --bg: #090412; 
            --panel: #1a1a2e; 
            --text: #ffffff; 
            --krecak-color: #ff9800;
        }
        
        #navbar { 
            background: rgba(9, 4, 18, 0.95); 
            backdrop-filter: blur(10px);
            padding: 10px 20px; 
            display: flex; 
            justify-content: space-between; 
            align-items: center; 
            position: fixed; 
            top: 0; 
            width: 100%; 
            height: 65px; 
            z-index: 10000; 
            border-bottom: 1px solid #333;
            transition: top 0.3s; 
            box-sizing: border-box;
        }
        .nav-up { top: -75px !important; }
        
        .search-input { 
            background: #16121e; 
            border: 1px solid #444; 
            padding: 8px 20px; 
            border-radius: 20px; 
            color: white; 
            width: 250px; 
            outline: none;
        }
        .search-input:focus { border-color: var(--accent); }

        .panic-btn { 
            background: #ff4444; 
            color: white; 
            border: none; 
            padding: 8px 15px; 
            border-radius: 5px; 
            cursor: pointer; 
            font-weight: bold; 
            transition: 0.2s;
        }
        .panic-btn:hover { background: #cc0000; transform: scale(1.05); }

        .section-header { 
            margin: 60px 20px 10px; 
            color: var(--text); 
            border-left: 4px solid var(--accent); 
            padding-left: 15px; 
            text-transform: uppercase; 
            font-size: 1.2rem;
            letter-spacing: 1px;
        }
        .section-header.krecak { border-color: var(--krecak-color); color: var(--krecak-color); }

        .projects-grid { 
            display: grid; 
            grid-template-columns: repeat(auto-fill, minmax(220px, 1fr)); 
            gap: 20px; 
            padding: 20px; 
        }

        .game-link { text-decoration: none; color: inherit; }

        .game-card { 
            background: #1a1a2e; 
            border-radius: 12px; 
            overflow: hidden; 
            aspect-ratio: 16/9; 
            position: relative; 
            transition: transform 0.3s, border-color 0.3s; 
            border: 1px solid #222;
            display: flex;
            flex-direction: column;
        }
        .game-card:hover { 
            transform: translateY(-5px); 
            border-color: var(--accent); 
            box-shadow: 0 5px 15px rgba(0, 255, 204, 0.2);
        }

        .game-thumbnail { 
            width: 100%; 
            height: 100%; 
            object-fit: cover; 
            background: #000;
        }

        .game-label { 
            position: absolute; 
            bottom: 0; 
            width: 100%; 
            padding: 20px 10px 8px;
            background: linear-gradient(transparent, rgba(0,0,0,0.9)); 
            text-align: center; 
            font-size: 14px;
            font-weight: bold;
            color: white;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
        }
    `;
    document.head.appendChild(style);

    // --- 3. HELPERS ---
    const cleanName = (name) => {
        return decodeURIComponent(name)
            .replace(/\.swf$/i, '')
            .replace(/[-_]/g, ' ')
            .split(' ')
            .map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
            .join(' ');
    };

    const createGridHTML = (games) => {
        return games.map(game => `
            <a href="${game.file}" class="game-link">
                <div class="game-card">
                    <img class="game-thumbnail" src="${game.thumb}" loading="lazy" onerror="this.src='/assets/thumbnails/placeholder.jpg'">
                    <div class="game-label">${cleanName(game.name)}</div>
                </div>
            </a>`).join('');
    };

    const resetAndRender = (filter = "") => {
        if (!gridContainer) return;
        const search = filter.toLowerCase();
        
        // Filter overall list
        filteredGames = gameFiles.filter(g => g.name.toLowerCase().includes(search));

        // Sub-sections based on flags set in generategames.js
        const krecak = filteredGames.filter(g => g.isKrecak);
        const flash = filteredGames.filter(g => g.isFlash);
        const standard = filteredGames.filter(g => !g.isKrecak && !g.isFlash);

        let finalHTML = '';
        
        if (krecak.length > 0) {
            finalHTML += `<h2 class="section-header krecak">Krecak Games</h2><div class="projects-grid">${createGridHTML(krecak)}</div>`;
        }
        
        if (flash.length > 0) {
            finalHTML += `<h2 class="section-header">Flash Classics</h2><div class="projects-grid">${createGridHTML(flash)}</div>`;
        }
        
        if (standard.length > 0) {
            finalHTML += `<h2 class="section-header">HTML5 Games</h2><div class="projects-grid">${createGridHTML(standard)}</div>`;
        }

        if (filteredGames.length === 0) {
            finalHTML = `<p style="text-align:center; color: #888; margin-top: 50px;">No games found matching "${filter}"</p>`;
        }

        gridContainer.innerHTML = `<div style="padding-top:20px">${finalHTML}</div>`;
    };

    // --- 4. EVENT LISTENERS ---

    // Search input logic
    const searchInput = document.getElementById('gameSearch');
    if (searchInput) {
        searchInput.addEventListener('input', (e) => resetAndRender(e.target.value));
    }

    // Panic button logic
    const panicBtn = document.getElementById('panicButton');
    if (panicBtn) {
        panicBtn.onclick = () => window.location.href = "https://classroom.google.com";
    }

    // Navbar hide/show on scroll
    window.addEventListener('scroll', () => {
        let st = window.pageYOffset || document.documentElement.scrollTop;
        const navbar = document.getElementById('navbar');
        if (navbar) {
            if (st > lastScrollTop && st > 65) {
                navbar.classList.add('nav-up');
            } else {
                navbar.classList.remove('nav-up');
            }
        }
        lastScrollTop = st;
    });

    // Initial Render
    resetAndRender();
});