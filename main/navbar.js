var allGames = allGames || []; 

function initLibrary() {
    const container = document.getElementById('projects-placeholder');
    const searchInput = document.querySelector('.search-input');

    if (!container) {
        setTimeout(initLibrary, 50); 
        return;
    }

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

    function render(list) {
        const container = document.getElementById('projects-placeholder');
        let html = '';

        const groups = list.reduce((acc, game) => {
            const cat = (game.category || 'other').toLowerCase();
            if (!acc[cat]) acc[cat] = [];
            acc[cat].push(game);
            return acc;
        }, {});

        const categories = ['exclusive', 'html5', 'flash', 'swf'];

        categories.forEach(cat => {
            if (groups[cat] && groups[cat].length > 0) {
                html += `
                <div class="category-block">
                    <div class="category-header">
                        <span class="label">${cat.toUpperCase()}</span>
                        <div class="line"></div>
                    </div>
                    <div class="game-flow">
                        ${groups[cat].map(game => {
                            let finalLink = "";
                            const fileName = game.file;

                            finalLink = fileName;

                            return `
                                <a href="${finalLink}" class="game-card">
                                    <div class="img-container">
                                        <img src="${game.thumb}" onerror="this.src='assets/thumbnails/placeholder.jpg';">
                                        <span class="badge ${cat}">${cat}</span>
                                    </div>
                                    <div class="game-label">${game.name}</div>
                                </a>
                            `;
                        }).join('')}
                    </div>
                </div>`;
            }
        });
        container.innerHTML = html;
    }
}

initLibrary();