document.addEventListener("DOMContentLoaded", async () => {
    // 1. AUTO-INJECT NAVBAR
    if (!document.getElementById('navbar')) {
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
                    <button class="nav-btn panic-btn" id="panicButton">PANIC!</button>
                </div>
            </nav>`;
        document.body.insertAdjacentHTML('afterbegin', navHTML);
    }

    // 2. PANIC & SCROLL
    const panicBtn = document.getElementById('panicButton');
    if (panicBtn) panicBtn.onclick = () => window.location.href = "https://drive.google.com";
    
    let lastScrollTop = 0;
    window.addEventListener('scroll', () => {
        const nav = document.getElementById('navbar');
        let st = window.pageYOffset || document.documentElement.scrollTop;
        if (st > lastScrollTop && st > 65) nav.classList.add('nav-up');
        else nav.classList.remove('nav-up');
        lastScrollTop = st;
    });

    // 3. HOME PAGE GRID AUTO-RENDER
    const gridContainer = document.querySelector('.projects-placeholder');
    if (!gridContainer) return; // Stop here if we aren't on the home page

    const response = await fetch('/games-list.json');
    const games = await response.json();

    const render = (filter = "") => {
        const filtered = games.filter(g => g.name.toLowerCase().includes(filter.toLowerCase()));
        const krecak = filtered.filter(g => g.isKrecak);
        const standard = filtered.filter(g => !g.isKrecak);

        const card = (g) => `
            <a href="/${g.file}" class="game-card">
                <img src="/${g.thumb}" class="game-thumbnail">
                <div class="game-label">${g.name.replace(/[-_]/g, ' ')}</div>
            </a>`;

        gridContainer.innerHTML = `
            ${krecak.length ? `<h2 class="section-header">Krecak Originals</h2><div class="projects-grid">${krecak.map(card).join('')}</div>` : ''}
            ${standard.length ? `<h2 class="section-header">All Games</h2><div class="projects-grid">${standard.map(card).join('')}</div>` : ''}
        `;
    };

    const searchInput = document.getElementById('gameSearch');
    if (searchInput) searchInput.addEventListener('input', (e) => render(e.target.value));
    
    render();
});