var allGames = allGames || []; 

function handleImageError(image) {
    image.onerror = null; 
    // Try local placeholder first
    const localPath = 'assets/thumbnails/placeholder.png';
    if (!image.src.includes(localPath)) {
        image.src = localPath;
        image.style.objectFit = "contain"; // Don't stretch small icons
        image.style.padding = "15px";
    } else {
        // Ultimate fallback
        image.src = "https://placehold.co/600x400/222/ffffff?text=No+Thumb";
    }
}

function initLibrary() {
    const container = document.getElementById('projects-placeholder');
    if (!container) { setTimeout(initLibrary, 50); return; }

    fetch('games-list.json?v=' + Date.now())
        .then(res => { if (!res.ok) throw new Error("404"); return res.json(); })
        .then(data => {
            allGames = data;
            render(allGames);
        })
        .catch(err => {
            container.innerHTML = `<div style="color:orange; padding:20px;">Library not found.</div>`;
        });

    function render(list) {
        const container = document.getElementById('projects-placeholder');
        let html = '';
        const groups = list.reduce((acc, game) => {
            const cat = (game.category || 'other').toLowerCase();
            if (!acc[cat]) acc[cat] = [];
            acc[cat].push(game);
            return acc;
        }, {});

        const categories = ['exclusive', 'html5', 'swf', 'gameboy'];

        categories.forEach(cat => {
            if (groups[cat] && groups[cat].length > 0) {
                html += `
                <div class="category-block">
                    <div class="category-header"><span class="label">${cat.toUpperCase()}</span><div class="line"></div></div>
                    <div class="game-flow">
                        ${groups[cat].map(game => `
                            <a href="${game.file}" class="game-card">
                                <div class="img-container">
                                    <img src="${game.thumb}" onerror="handleImageError(this)" loading="lazy">
                                    <span class="badge ${cat}">${cat}</span>
                                </div>
                                <div class="game-label">${game.name}</div>
                            </a>
                        `).join('')}
                    </div>
                </div>`;
            }
        });
        container.innerHTML = html;
    }
}

// Navbar Toggle (Ctrl+H)
document.addEventListener('keydown', e => {
    if (e.ctrlKey && e.code === 'KeyH') {
        e.preventDefault();
        const nav = document.querySelector('.navbar');
        if (nav) nav.classList.toggle('hidden');
    }
});

initLibrary();