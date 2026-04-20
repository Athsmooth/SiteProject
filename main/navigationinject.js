let allGames = [];

document.addEventListener('DOMContentLoaded', () => {
    const container = document.getElementById('projects-placeholder');
    const searchInput = document.querySelector('.search-input');

    fetch('games-list.json?v=' + Date.now())
        .then(res => res.json())
        .then(data => {
            allGames = data;
            render(allGames);
        })
        .catch(err => console.error("Error loading JSON:", err));

    window.openGame = (gamePath) => {
        const win = window.open('about:blank', '_blank');
        if (win) {
            win.document.body.style.margin = '0';
            win.document.body.style.height = '100vh';
            const iframe = win.document.createElement('iframe');
            iframe.style.border = 'none';
            iframe.style.width = '100%';
            iframe.style.height = '100%';
            // This ensures it stays within the /main/ subfolder context
            iframe.src = window.location.href.substring(0, window.location.href.lastIndexOf('/') + 1) + gamePath;
            win.document.body.appendChild(iframe);
        }
    };

    function render(list) {
        if (!container) return;
        container.innerHTML = list.map(game => `
            <div class="game-card" onclick="launchGame('${game.file}')" style="cursor:pointer;">
                <div class="img-container">
                    <img src="${game.thumb}" onerror="this.src='assets/thumbnails/placeholder.jpg'">
                </div>
                <div class="game-label">${game.name}</div>
            </div>
        `).join('');
    }

    // The "Safety-First" Cloaker
    window.launchGame = (gameUrl) => {
        const win = window.open('about:blank', '_blank');
        if (win) {
            win.document.body.style.margin = '0';
            win.document.body.style.padding = '0';
            win.document.body.style.overflow = 'hidden';
            
            const iframe = win.document.createElement('iframe');
            iframe.style.border = 'none';
            iframe.style.width = '100vw';
            iframe.style.height = '100vh';
            
            // This constructs the full path back to your /main/ folder
            const fullPath = window.location.origin + '/main/' + gameUrl;
            iframe.src = fullPath;
            
            win.document.body.appendChild(iframe);
        } else {
            alert("Pop-up blocked! Please allow pop-ups to launch the game.");
        }
    };
});