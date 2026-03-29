// Configuration
const JSON_URL = './games-list.json';

// Main Initialization
document.addEventListener('DOMContentLoaded', () => {
    fetchGames();
});

async function fetchGames() {
    try {
        const response = await fetch(JSON_URL);
        if (!response.ok) throw new Error('Failed to load games list');
        const games = await response.json();
        
        // Initial Render
        renderGrid(games);

        // Setup Search Functionality
        const searchInput = document.querySelector('.search-input');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                const searchTerm = e.target.value.toLowerCase();
                const filtered = games.filter(game => 
                    game.name.toLowerCase().includes(searchTerm)
                );
                renderGrid(filtered);
            });
        }
    } catch (err) {
        console.error('Error:', err);
        const container = document.getElementById('projects-placeholder');
        if (container) container.innerHTML = `<h2 style="color:white; text-align:center;">Failed to load games. Check console (F12).</h2>`;
    }
}

function renderGrid(games) {
    const container = document.getElementById('projects-placeholder');
    if (!container) return;

    if (games.length === 0) {
        container.innerHTML = `<h2 style="color:white; text-align:center; width:100%; padding-top:50px;">No games found.</h2>`;
        return;
    }

    // Wrap the grid for styling
    let html = `<div class="projects-grid">`;

    html += games.map(game => {
        // Determine the badge and class based on category
        const isFlash = game.category === 'flash';
        const badgeClass = isFlash ? 'flash' : 'html5';
        const badgeText = isFlash ? 'FLASH' : 'HTML5';

        return `
            <a href="${game.file}" class="game-card-link">
                <div class="game-card ${badgeClass}">
                    <div class="thumb-container">
                        <img class="game-thumbnail" src="${game.thumb}" onerror="this.src='./assets/thumbnails/default.jpg'">
                        <span class="badge ${badgeClass}">${badgeText}</span>
                    </div>
                    <div class="game-label">${game.name}</div>
                </div>
            </a>
        `;
    }).join('');

    html += `</div>`;
    container.innerHTML = html;
}