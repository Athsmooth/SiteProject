var allGames = allGames || []; 

// Helper function to handle broken images
function handleImageError(image) {
    image.onerror = null; 
    const localPath = '/main/assets/thumbnails/placeholder.jpg';
    if (!image.src.includes(localPath)) {
        image.src = localPath;
        image.style.objectFit = "contain";
        image.style.padding = "10px";
    } else {
        image.src = "https://placehold.co/600x400/222/ffffff?text=No+Thumbnail";
    }
}

function initLibrary() {
    const container = document.getElementById('projects-placeholder');
    const searchInput = document.querySelector('.search-input');

    if (!container) {
        setTimeout(initLibrary, 50); 
        return;
    }

    fetch('/main/games-list.json?v=' + Date.now())
        .then(res => {
            if (!res.ok) throw new Error(`File not found at ${res.url}`);
            return res.json();
        })
        .then(data => {
            allGames = data;
            render(allGames);
        })
        .catch(err => {
            console.error("Library Load Error:", err);
            container.innerHTML = `<div style="color:orange; padding:20px;">Error: ${err.message}</div>`;
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

    // --- UPDATED RENDER FUNCTION ---
    function render(list) {
        const container = document.getElementById('projects-placeholder');
        
        // 1. Check if the list is empty first
        if (list.length === 0) {
            container.innerHTML = `
                <div class="no-results" style="
                    text-align: center; 
                    width: 100%; 
                    padding: 100px 20px; 
                    color: #8b949e; 
                    font-family: sans-serif;
                ">
                    <h2 style="font-size: 32px; color: #f0f6fc; margin-bottom: 10px;">Game not found</h2>
                    <p style="font-size: 18px;">Try searching for a different title or category.</p>
                </div>
            `;
            return;
        }

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
                    <div class="category-header">
                        <span class="label">${cat.toUpperCase()}</span>
                        <div class="line"></div>
                    </div>
                    <div class="game-flow">
                        ${groups[cat].map(game => {
                            const finalLink = `/main/${game.file}`;
                            const thumbPath = `/main/${game.thumb}`;
                            return `
                                <a href="${finalLink}" class="game-card">
                                    <div class="img-container">
                                        <img src="${thumbPath}" onerror="handleImageError(this)" loading="lazy">
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

// UI Controls (Navbar Toggle) - Keep as is
let isNavbarHidden = false;
const navbar = document.querySelector('.navbar');
const notice = document.getElementById('hide-notice');

document.addEventListener('keydown', function(event) {
    if (event.ctrlKey && event.code === 'KeyH') {
        event.preventDefault(); 
        isNavbarHidden = !isNavbarHidden;
        if (navbar) {
            navbar.classList.toggle('hidden', isNavbarHidden);
        }
    }
});

initLibrary();