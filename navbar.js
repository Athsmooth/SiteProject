document.addEventListener("DOMContentLoaded", async () => {
    let gameFiles = [];
    let filteredGames = [];
    const gridContainer = document.querySelector('.projects-placeholder');
    let lastScrollTop = 0;

    // Load Data
    try {
        const response = await fetch('./games-list.json');
        if (!response.ok) throw new Error("JSON not found");
        gameFiles = await response.json();
    } catch (err) {
        console.warn("Games list not found. Run generate-games.js!");
    }

    // --- STYLES ---
    const style = document.createElement('style');
    style.textContent = `
        :root { --accent: #ff9800; --bg: #090412; --panel: #1a1a2e; --text: #ffffff; }
        body { margin: 0; background: var(--bg); color: var(--text); font-family: sans-serif; }
        
        #navbar { 
            background: rgba(9, 4, 18, 0.95); backdrop-filter: blur(10px);
            padding: 10px 20px; display: flex; justify-content: space-between; align-items: center; 
            position: fixed; top: 0; width: 100%; height: 65px; z-index: 10000; border-bottom: 1px solid #333;
            transition: top 0.3s; box-sizing: border-box;
        }
        .nav-up { top: -75px !important; }
        .search-input { background: #16121e; border: 1px solid #444; padding: 8px 20px; border-radius: 20px; color: white; width: 250px; }
        .panic-btn { background: #ff4444; color: white; border: none; padding: 8px 15px; border-radius: 5px; cursor: pointer; font-weight: bold; }

        .section-header { margin: 40px 20px 10px; color: var(--accent); border-left: 4px solid var(--accent); padding-left: 15px; text-transform: uppercase; }
        .projects-grid { 
            display: grid; grid-template-columns: repeat(auto-fill, minmax(240px, 1fr)); 
            gap: 20px; padding: 20px; 
        }
        .game-card { 
            background: #1a1a2e; border-radius: 12px; overflow: hidden; aspect-ratio: 16/9; 
            position: relative; transition: transform 0.3s; border: 1px solid #222;
        }
        .game-card:hover { transform: translateY(-5px); border-color: var(--accent); }
        .game-thumbnail { width: 100%; height: 100%; object-fit: cover; }
        .game-label { 
            position: absolute; bottom: 0; width: 100%; padding: 15px 10px 5px;
            background: linear-gradient(transparent, rgba(0,0,0,0.9)); text-align: center; font-size: 14px;
        }
    `;
    document.head.appendChild(style);

    // --- HELPERS ---
    const cleanName = (name) => {
        return decodeURIComponent(name).replace(/[-_]/g, ' ')
            .split(' ')
            .map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
            .join(' ');
    };

    const createGridHTML = (games) => {
        return games.map(game => `
            <a href="${game.file}" class="game-link">
                <div class="game-card">
                    <img class="game-thumbnail" src="${game.thumb}" loading="lazy" onerror="this.style.display='none'">
                    <div class="game-label">${cleanName(game.name)}</div>
                </div>
            </a>`).join('');
    };

    const resetAndRender = (filter = "") => {
        if (!gridContainer) return;
        const search = filter.toLowerCase();
        filteredGames = gameFiles.filter(g => g.name.toLowerCase().includes(search));

        const krecak = filteredGames.filter(g => g.isKrecak);
        const standard = filteredGames.filter(g => !g.isKrecak);

        let finalHTML = '';
        
        if (krecak.length > 0) {
            finalHTML += `<h2 class="section-header">Krecak Games</h2><div class="projects-grid">${createGridHTML(krecak)}</div>`;
        }
        
        if (standard.length > 0) {
            finalHTML += `<h2 class="section-header">All Games</h2><div class="projects-grid">${createGridHTML(standard)}</div>`;
        }

        gridContainer.innerHTML = `<div style="padding-top:70px">${finalHTML}</div>`;
    };

    // --- INIT ---
    document.getElementById('gameSearch').addEventListener('input', (e) => resetAndRender(e.target.value));
    document.getElementById('panicButton').onclick = () => window.location.href = "https://classroom.google.com";
    
    window.addEventListener('scroll', () => {
        let st = window.pageYOffset || document.documentElement.scrollTop;
        const navbar = document.getElementById('navbar');
        if (st > lastScrollTop && st > 65) navbar.classList.add('nav-up');
        else navbar.classList.remove('nav-up');
        lastScrollTop = st;
    });

    resetAndRender();
});