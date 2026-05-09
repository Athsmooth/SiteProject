/* --- NAVIGATION INJECTOR --- */
var navbarHTML = `
<nav id="nav">
    <div class="nav-left">
        <a href="/main/index.html" style="text-decoration:none;"><span class="logo">Krethan's Page</span></a>
    </div>
    <div class="nav-right">
        <input type="text" class="search-input" placeholder="Search games...">
        <a href="/main/index.html" class="nav-link">Homepage</a>
        <a href="javascript:void(0)" class="nav-link" onclick="exportUserData()">Save</a>
        <a href="javascript:void(0)" class="nav-link" onclick="triggerInternalFileInput()">Load</a>
        <a href="https://docs.google.com" target="_blank" class="nav-link">Feedback</a>
    </div>
</nav>

<div id="universal-modal" class="modal-overlay">
    <div class="modal-content">
        <h2 id="modal-title"></h2>
        <div id="modal-body" style="color:#8b949e; margin-bottom:20px; line-height:1.6;"></div>
        <button onclick="closeModal()" class="modal-close-btn">Close</button>
    </div>
</div>

<input type="file" id="importFileHandler" style="display:none" accept=".json" onchange="importUserData(event)">
`;

window.customAlert = function(title, body) {
    document.getElementById('modal-title').innerText = title;
    document.getElementById('modal-body').innerHTML = body;
    document.getElementById('universal-modal').classList.add('active');
};

window.closeModal = function() {
    document.getElementById('universal-modal').classList.remove('active');
};

var isNavLocked = false;

function setupNavBehavior() {
    var nav = document.getElementById('nav');
    var body = document.body;
    var searchInput = document.querySelector('.search-input');

    window.addEventListener('keydown', function(e) {
        // Ctrl + Alt + H: Stealth Mode (Toggle Fullscreen)
        if (e.ctrlKey && e.altKey && e.code === 'KeyH') {
            e.preventDefault();
            isNavLocked = !isNavLocked;
            
            if (nav) nav.style.display = isNavLocked ? 'none' : 'flex';
            
            if (isNavLocked) {
                body.style.paddingTop = "0px";
                var game = document.querySelector('.game-content');
                if (game) game.style.height = "100vh";
            } else {
                body.style.paddingTop = "70px";
                var game = document.querySelector('.game-content');
                if (game) game.style.height = "calc(100vh - 70px)";
            }
        }

        // Ctrl + Alt + P: Panic
        if (e.ctrlKey && e.altKey && e.code === 'KeyP') {
            window.location.replace('https://www.google.com');
        }
    });

    if (searchInput) {
        searchInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') window.location.href = '/main/index.html?search=' + encodeURIComponent(searchInput.value);
        });
    }
}

// Data Handlers
window.triggerInternalFileInput = () => document.getElementById('importFileHandler').click();
window.exportUserData = () => {
    const data = JSON.stringify(localStorage);
    const blob = new Blob([data], {type: 'application/json'});
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'save.json';
    a.click();
};
window.importUserData = (e) => {
    const file = e.target.files[0];
    const reader = new FileReader();
    reader.onload = (event) => {
        const data = JSON.parse(event.target.result);
        localStorage.clear();
        for (let key in data) localStorage.setItem(key, data[key]);
        window.location.reload();
    };
    reader.readAsText(file);
};

(function init() {
    var container = document.getElementById('navbar-container');
    if (container) {
        container.innerHTML = navbarHTML;
        setupNavBehavior();
    } else { setTimeout(init, 50); }
})();