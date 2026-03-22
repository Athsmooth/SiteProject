document.addEventListener("DOMContentLoaded", async () => {
    // --- 1. CONFIGURATION & DATA ---
    let gameFiles = [];
    const BATCH_SIZE = 24;
    let currentIndex = 0;
    let filteredGames = [];
    
    // Scroll Tracking for Navbar
    let lastScrollTop = 0;
    const delta = 5; 

    try {
        const response = await fetch('./games-list.json');
        if (!response.ok) throw new Error("JSON not found");
        gameFiles = await response.json();
    } catch (err) {
        console.warn("Games list not found. Run your sync script!");
    }

    // --- 2. INJECT UPDATED STYLES ---
    const style = document.createElement('style');
    style.textContent = `
        :root { 
            --accent: #ff9800; --bg: #090412; --panel: #1a1a2e; --text: #ffffff;
        }
        
        body { 
            margin: 0; padding: 0; background: var(--bg); color: var(--text); 
            font-family: 'Segoe UI', Roboto, sans-serif;
            min-height: 100vh;
        }

        /* Fixed Navbar with Slide Transition */
        #navbar { 
            background: rgba(9, 4, 18, 0.95); 
            backdrop-filter: blur(10px);
            padding: 10px 20px; 
            display: flex; flex-wrap: wrap; justify-content: space-between; align-items: center; 
            border-bottom: 1px solid #333; 
            position: fixed; top: 0; width: 100%; height: 65px;
            z-index: 10000; gap: 15px; box-sizing: border-box;
            transition: top 0.3s ease-in-out;
        }

        .nav-up { top: -75px !important; }

        .nav-left { display: flex; align-items: center; gap: 20px; }
        .nav-logo { color: white; text-decoration: none; font-weight: bold; font-size: 1.4rem; }
        
        .search-container { position: relative; flex-grow: 1; max-width: 400px; }
        .search-input { 
            width: 100%; background: #16121e; border: 1px solid #444; 
            padding: 10px 20px; border-radius: 30px; color: white; outline: none;
        }

        .nav-right { display: flex; gap: 10px; }
        .nav-btn { background: #2a2a4a; color: white; border: none; padding: 8px 15px; border-radius: 8px; cursor: pointer; font-weight: 600; }
        .panic-btn { background: #ff4444; }

        /* Grid & Card Styling */
        .projects-placeholder { padding-top: 80px; padding-bottom: 50px; }
        .projects-grid { 
            display: grid; grid-template-columns: repeat(auto-fill, minmax(240px, 1fr)); 
            gap: 20px; padding: 20px; max-width: 1400px; margin: 0 auto; 
        }
        
        .game-card { 
            position: relative; border-radius: 12px; overflow: hidden; 
            background: #1a1a2e; border: 1px solid #222; aspect-ratio: 16 / 9;
            transition: transform 0.3s;
        }
        .game-card:hover { transform: translateY(-5px); border-color: var(--accent); }

        .game-thumbnail { 
            width: 100%; height: 100%; object-fit: cover; display: block; 
        }

        .game-label { 
            position: absolute; bottom: 0; width: 100%; 
            background: linear-gradient(transparent, rgba(0,0,0,0.9)); 
            color: white; font-size: 14px; padding: 15px 10px 5px; 
            text-align: center; box-sizing: border-box;
        }
    `;
    document.head.appendChild(style);

    // --- 3. INJECT NAVBAR ---
    const navHTML = `
        <nav id="navbar">
            <div class="nav-left">
                <a href="/" class="nav-logo">KRECAK</a>
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

    const gridContainer = document.querySelector('.projects-placeholder');
    const navbar = document.getElementById('navbar');

    // --- 4. RENDER BATCH LOGIC ---
    const renderBatch = () => {
        if (!gridContainer) return;
        let grid = document.querySelector('.projects-grid') || document.createElement('div');
        if (!grid.className) { grid.className = 'projects-grid'; gridContainer.appendChild(grid); }

        const nextBatch = filteredGames.slice(currentIndex, currentIndex + BATCH_SIZE);
        let batchHTML = '';
        
        nextBatch.forEach(game => {
            // Logic to handle folders: html5/game-name/index.html -> "game name"
            const pathParts = game.file.split('/');
            const nameToClean = pathParts.length > 2 ? pathParts[1] : pathParts.pop().split('.')[0];
            
            const cleanName = decodeURIComponent(nameToClean)
                .replace(/[-_]/g, ' ')
                .split(' ')
                .map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
                .join(' ');

            batchHTML += `
                <a href="${game.file}" class="game-link">
                    <div class="game-card">
                        <img class="game-thumbnail" 
                             src="${game.thumb}" 
                             loading="lazy" 
                             onerror="this.style.display='none'">
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

    // --- 5. SCROLL & INTERACTION EVENTS ---
    
    // Navbar Hide/Show on Scroll
    window.addEventListener('scroll', () => {
        let st = window.pageYOffset || document.documentElement.scrollTop;
        if (Math.abs(lastScrollTop - st) <= delta) return;

        if (st > lastScrollTop && st > 65) {
            navbar.classList.add('nav-up'); // Scrolling Down
        } else {
            navbar.classList.remove('nav-up'); // Scrolling Up
        }
        lastScrollTop = st;

        // Infinite Scroll Check
        if ((window.innerHeight + window.scrollY) >= document.body.offsetHeight - 800) {
            if (currentIndex < filteredGames.length) renderBatch();
        }
    });

    document.getElementById('gameSearch').addEventListener('input', (e) => resetAndRender(e.target.value));
    document.getElementById('panicButton').onclick = () => window.location.href = "https://classroom.google.com";
    document.getElementById('randomBtn').onclick = () => {
        const rand = gameFiles[Math.floor(Math.random() * gameFiles.length)];
        if (rand) window.location.href = rand.file;
    };

    resetAndRender();
});