var allGames = allGames || []; 

function initLibrary() {
    const container = document.getElementById('projects-placeholder');
    const searchInput = document.querySelector('.search-input');

    // 1. POLLING CHECK: If elements aren't there yet, wait and try again
    if (!container) {
        setTimeout(initLibrary, 50); 
        return;
    }

    console.log("Library container found! Loading games...");

    // 2. FETCH DATA
    fetch('games-list.json?v=' + Date.now())
        .then(res => {
            if (!res.ok) throw new Error("404");
            return res.json();
        })
        .then(data => {
            allGames = data;
            render(allGames);
        })
        .catch(err => {
            console.error("Could not load games list:", err);
            container.innerHTML = `<div style="color:orange; padding:20px;">Library file not found.</div>`;
        });

    // 3. SEARCH LOGIC (Only if search input exists)
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            const term = e.target.value.toLowerCase();
            const filtered = allGames.filter(g => 
                (g.name && g.name.toLowerCase().includes(term)) || 
                (g.category && g.category.toLowerCase().includes(term))
            );
            render(filtered);
        });
    }

    // 4. RENDER FUNCTION
    function render(list) {
        if (list.length === 0) {
            container.innerHTML = `<div style="padding: 20px; color: #8b949e;">No games found...</div>`;
            return;
        }

        const groups = list.reduce((acc, game) => {
            const cat = game.category || 'other';
            if (!acc[cat]) acc[cat] = [];
            acc[cat].push(game);
            return acc;
        }, {});

        const categoryOrder = ['exclusive', 'html5', 'flash'];
        let html = '';

        categoryOrder.forEach(cat => {
            if (groups[cat] && groups[cat].length > 0) {
                html += `
                    <div class="category-block">
                        <div class="category-header">
                            <span class="label">${cat.toUpperCase()}</span>
                            <div class="line"></div>
                        </div>
                        <div class="game-flow">
                            ${groups[cat].map(game => {
                                let finalLink = game.file;
                                if (game.file.includes('.gbc') || game.file.includes('.gba')) {
                                    const type = game.file.toLowerCase().includes('.gba') ? 'gba' : 'gbc';
                                    finalLink = `gbaplayer.html?type=${type}`;
                                }
                                return `
                                    <a href="${finalLink}" class="game-card ${game.category}">
                                        <div class="img-container">
                                            <img src="${game.thumb}" alt="${game.name}" onerror="this.src='assets/thumbnails/placeholder.jpg';"> 
                                            <span class="badge ${game.category}">${game.category.toUpperCase()}</span>
                                        </div>
                                        <div class="game-label">${game.name}</div>
                                    </a>
                                `;
                            }).join('')}
                        </div>
                    </div>
                `;
            }
        });

        container.innerHTML = html;
    }
}

// Start the check
initLibrary();