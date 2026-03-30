let allGames = [];

document.addEventListener('DOMContentLoaded', () => {
    const container = document.getElementById('projects-placeholder');
    const searchInput = document.querySelector('.search-input');

    // Fetch with cache busting
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

        container.innerHTML = list.map(game => {
            // FIX: Ensure the thumbnail path is correct
            // If your JSON says "assets/..." but they are in "data/assets/...", change it here:
            const thumbPath = game.thumb.startsWith('http') ? game.thumb : game.thumb;

            return `
                <a href="${game.file}" class="game-card ${game.category}">
                    <div class="img-container">
                        <img src="${thumbPath}" 
                            alt="${game.name}" 
                            loading="lazy" 
                            onerror="this.src='data/images/placeholder.png';"> 
                        <span class="badge ${game.category}">${game.category.toUpperCase()}</span>
                    </div>
                    <div class="game-label">${game.name}</div>
                </a>
            `;
        }).join('');
    }
});