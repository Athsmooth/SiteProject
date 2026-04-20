let allGames = [];

document.addEventListener('DOMContentLoaded', () => {
    const container = document.getElementById('projects-placeholder');
    const searchInput = document.querySelector('.search-input');

    fetch('games-list.json?v=' + Date.now())
        .then(res => res.json())
        .then(data => {
            allGames = data;
            render(allGames);
        })
        .catch(err => console.error("Could not load games list:", err));

    searchInput.addEventListener('input', (e) => {
        const term = e.target.value.toLowerCase();
        const filtered = allGames.filter(g => 
            g.name.toLowerCase().includes(term) || 
            g.category.toLowerCase().includes(term)
        );
        render(filtered);
    });

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
});
