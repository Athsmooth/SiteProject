let allGames = [];

document.addEventListener('DOMContentLoaded', () => {
    const container = document.getElementById('projects-placeholder');
    const searchInput = document.querySelector('.search-input');

    fetch('games-list.json?v=' + Date.now())
        .then(res => res.json())
        .then(data => {
            allGames = data;
            render(allGames);
        });

    searchInput.addEventListener('input', (e) => {
        const term = e.target.value.toLowerCase();
        const filtered = allGames.filter(g => 
            g.name.toLowerCase().includes(term) || 
            g.category.toLowerCase().includes(term)
        );
        render(filtered);
    });

    function render(list) {
        container.innerHTML = list.map(game => `
            <a href="${game.file}" class="game-card ${game.category}">
                <div class="img-container">
                    <img src="${game.thumb}" onerror="this.src='assets/thumbnails/default.jpg'">
                    <span class="badge ${game.category}">${game.category.toUpperCase()}</span>
                </div>
                <div class="game-label">${game.name}</div>
            </a>
        `).join('');
    }
});