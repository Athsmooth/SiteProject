let gameData = [];

document.addEventListener('DOMContentLoaded', () => {
    const container = document.getElementById('projects-placeholder');
    const searchInput = document.querySelector('.search-input');

    // 1. Fetch the data
    fetch('./games-list.json?v=' + Date.now())
        .then(res => res.json())
        .then(data => {
            gameData = data;
            displayGames(gameData);
        });

    // 2. Search Logic
    searchInput.addEventListener('input', (e) => {
        const query = e.target.value.toLowerCase();
        const filtered = gameData.filter(game => 
            game.name.toLowerCase().includes(query) || 
            game.category.toLowerCase().includes(query)
        );
        displayGames(filtered);
    });

    // 3. Rendering Function
    function displayGames(list) {
        if (list.length === 0) {
            container.innerHTML = `<p style="width:100%; text-align:center; opacity:0.5;">No games found.</p>`;
            return;
        }

        container.innerHTML = list.map(game => `
            <a href="${game.file}" class="game-card ${game.category}">
                <div style="position:relative;">
                    <img src="${game.thumb}" onerror="this.src='./assets/thumbnails/default.jpg'" style="width:100%; aspect-ratio:16/9; object-fit:cover;">
                    <span class="badge ${game.category}" style="position:absolute; top:10px; right:10px;">${game.category.toUpperCase()}</span>
                </div>
                <div style="padding:15px; text-align:center; font-weight:bold;">${game.name}</div>
            </a>
        `).join('');
    }
});