document.addEventListener('DOMContentLoaded', () => {
    const container = document.getElementById('projects-placeholder');
    
    // Fetch JSON with a timestamp to prevent caching
    fetch(`./games-list.json?v=${Date.now()}`)
        .then(res => res.json())
        .then(games => {
            if (games.length === 0) {
                container.innerHTML = "<p>No games found.</p>";
                return;
            }

            container.innerHTML = games.map(game => `
                <a href="${game.file}" class="game-card ${game.category}">
                    <img class="game-thumbnail" src="${game.thumb}" onerror="this.src='./assets/thumbnails/default.jpg'">
                    <span class="badge ${game.category}">${game.category}</span>
                    <div class="game-label">${game.name}</div>
                </a>
            `).join('');
        })
        .catch(err => console.error("Error loading games list:", err));
});