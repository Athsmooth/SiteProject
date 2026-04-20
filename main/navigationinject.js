let allGames = [];

document.addEventListener('DOMContentLoaded', () => {
    const container = document.getElementById('projects-placeholder');
    
    // Check local folder first
    fetch('games-list.json')
        .then(res => {
            if (!res.ok) throw new Error(`Linux 404: File not found at ${res.url}`);
            return res.json();
        })
        .then(data => {
            allGames = data;
            render(allGames);
        })
        .catch(err => {
            console.error(err);
            if (container) container.innerHTML = `<div style="color:red; padding:20px;">
                <h3>Linux Path Error</h3>
                <p>${err.message}</p>
                <p>Ensure <b>games-list.json</b> is inside the <b>main</b> folder.</p>
            </div>`;
        });

    function render(list) {
        if (!container) return;
        container.innerHTML = list.map(game => `
            <div class="game-card">
                <img src="${game.thumb}" alt="${game.name}">
                <p>${game.name}</p>
                <a href="${game.file}">Play</a>
            </div>
        `).join('');
    }
});