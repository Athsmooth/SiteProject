var allGames = allGames || []; 

function handleImageError(image) {
    image.onerror = null; 
    const localPath = '/main/assets/thumbnails/placeholder.jpg';
    image.src = localPath;
    image.style.objectFit = "contain";
    image.style.padding = "10px";
}

function render(list) {
    const container = document.getElementById('projects-placeholder');
    if (!container) return;
    
    if (list.length === 0) {
        container.innerHTML = `
            <div class="no-results" style="text-align:center; width:100%; padding:100px 20px; color:#8b949e; font-family:sans-serif;">
                <h2 style="font-size:32px; color:#f0f6fc; margin-bottom:10px;">Game not found</h2>
                <p style="font-size:18px;">Try searching for a different title or category.</p>
            </div>`;
        return;
    }

    // 1. DYNAMIC CATEGORIES: Instead of a hardcoded list, we get all categories present in the data
    const groups = list.reduce((acc, game) => {
        const cat = (game.category || 'other').toLowerCase();
        if (!acc[cat]) acc[cat] = [];
        acc[cat].push(game);
        return acc;
    }, {});

    // Sort categories alphabetically so the page is organized
    const sortedCategories = Object.keys(groups).sort();

    let html = '';
    sortedCategories.forEach(cat => {
        html += `
        <div class="category-block">
            <div class="category-header">
                <span class="label">${cat.toUpperCase()}</span>
                <div class="line"></div>
            </div>
            <div class="game-flow">
                ${groups[cat].map(game => {
                    // 2. PATH FIX: The scanner already provides the full path from /main/
                    // So we just ensure we aren't doubling up on the folder names.
                    const finalLink = game.file.startsWith('/') ? game.file : `/main/${game.file}`;
                    const thumbPath = game.thumb.startsWith('/') ? game.thumb : `/main/${game.thumb}`;
                    
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
    });
    container.innerHTML = html;
}

function initLibrary() {
    const container = document.getElementById('projects-placeholder');
    const searchInput = document.querySelector('.search-input');

    if (!container) {
        setTimeout(initLibrary, 50); 
        return;
    }

    // Cache busting with timestamp
    fetch('/main/games-list.json?v=' + Date.now())
        .then(res => {
            if (!res.ok) throw new Error(`File not found`);
            return res.json();
        })
        .then(data => {
            allGames = data;
            
            // 3. SEARCH REDIRECT HANDLING: Check URL for ?search= term
            const params = new URLSearchParams(window.location.search);
            const query = params.get('search');
            if (query && searchInput) {
                searchInput.value = query;
                const filtered = allGames.filter(g => 
                    g.name.toLowerCase().includes(query.toLowerCase()) || 
                    g.category.toLowerCase().includes(query.toLowerCase())
                );
                render(filtered);
            } else {
                render(allGames);
            }
        })
        .catch(err => {
            console.error("Library Load Error:", err);
            container.innerHTML = `<div style="color:orange; padding:20px;">Error loading library. Run scanner.js?</div>`;
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
}

initLibrary();