document.addEventListener('DOMContentLoaded', () => {
    const container = document.getElementById('projects-placeholder');
    if (!container) return;

    // Use a cache-buster (?v=) to ensure we get the latest list
    fetch(`./games-list.json?v=${Date.now()}`)
        .then(res => {
            if (!res.ok) throw new Error("File games-list.json not found on server.");
            return res.json();
        })
        .then(games => {
            if (!games || games.length === 0) {
                container.innerHTML = "<h2 style='color:white;text-align:center;'>No games found in games-list.json</h2>";
                return;
            }

            console.log("Games loaded successfully:");
            console.table(games);

            // Create the HTML
            container.innerHTML = games.map(game => `
                <a href="${game.file}" class="game-card ${game.category}">
                    <div class="thumb-container">
                        <img class="game-thumbnail" src="${game.thumb}" onerror="this.src='./assets/thumbnails/default.jpg'">
                        <span class="badge ${game.category}">${game.category.toUpperCase()}</span>
                    </div>
                    <div class="game-label">${game.name}</div>
                </a>
            `).join('');
        })
        .catch(err => {
            console.error(err);
            container.innerHTML = `<h2 style='color:red;text-align:center;'>Error: ${err.message}</h2>`;
        });
});