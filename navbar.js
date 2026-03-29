// Function to render the grid based on the category
const renderGameGrid = (games) => {
    const container = document.getElementById('projects-placeholder');
    if (!container) return;

    container.innerHTML = games.map(game => {
        // Add a small badge if it's a Flash game
        const badge = game.category === 'flash' ? '<span class="badge">FLASH</span>' : '<span class="badge html">HTML5</span>';
        
        return `
            <a href="${game.file}" class="game-card-link">
                <div class="game-card ${game.category}">
                    <div class="thumb-container">
                        <img src="${game.thumb}" onerror="this.src='./assets/thumbnails/default.jpg'">
                        ${badge}
                    </div>
                    <div class="game-info">
                        <h3>${game.name}</h3>
                    </div>
                </div>
            </a>
        `;
    }).join('');
};

// CSS to support the separation (Add this to your style.css)
/*

*/