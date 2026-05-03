const navbarHTML = `
<nav id="nav">
    <div class="nav-left">
        <div class="ic-logo">
            <span class="logo">Krethan's Page</span>
        </div>
    </div>
    <div class="nav-right">
        <input type="text" class="search-input" placeholder="Search games...">
        <a href="index.html" class="nav-link">Homepage</a>
        <a href="javascript:void(0)" class="nav-link" onclick="exportUserData()">Save Data</a>
        <a href="javascript:void(0)" class="nav-link" onclick="triggerInternalFileInput()">Load Data</a>
        <a href="javascript:void(0)" class="nav-link" onclick="toggleDisclaimer(true)">Disclaimer</a>
        <a href="https://docs.google.com/forms/d/e/1FAIpQLSdAS8C_gANDaBC5AvOTb-cjWLUuUjzyqbe6eMsrSpuhiE5OaQ/viewform?usp=header_el" target="_blank" class="nav-link">Feedback</a>
    </div>
</nav>

<input type="file" id="importFileHandler" style="display:none" accept=".json" onchange="importUserData(event)">

<div id="disclaimer-modal" class="modal-overlay">
    <div class="modal-content">
        <div class="modal-header"><h2>Notice</h2></div>
        <div class="modal-body">
            <p><strong>Educational Purposes Only:</strong> This site is a personal project. All games are properties of their respective owners.</p>
        </div>
        <div class="modal-footer">
            <button class="agree-btn" onclick="toggleDisclaimer(false)">I Understand</button>
        </div>
    </div>
</div>

<div id="instructions-modal" class="modal-overlay">
    <div class="modal-content">
        <div class="modal-header"><h2>Transfer Instructions</h2></div>
        <div class="modal-body">
            <p>Your data backup has been downloaded! Send it to your new device and use "Load Data".</p>
        </div>
        <div class="modal-footer">
            <button class="agree-btn" onclick="toggleInstructions(false)">Got it!</button>
        </div>
    </div>
</div>
`;

function initNavbar() {
    const container = document.getElementById('navbar-container');
    if (!container) return; // Exit if the container isn't found
    
    container.innerHTML = navbarHTML;
    setupNavBehavior();
}

function setupNavBehavior() {
    const nav = document.getElementById('nav');
    if (!nav) return;

    let navTimeout;
    const isHomePage = window.location.pathname.endsWith('index.html') || window.location.pathname === '/' || window.location.pathname === '';

    window.showNav = function() {
        nav.classList.remove('nav-hidden');
        clearTimeout(navTimeout);

        if (!isHomePage) {
            navTimeout = setTimeout(() => {
                const isTyping = document.activeElement.tagName === 'INPUT';
                const isHovering = nav.matches(':hover');
                if (!isTyping && !isHovering) {
                    nav.classList.add('nav-hidden');
                }
            }, 3000);
        }
    };

    window.addEventListener('mousemove', showNav);
    window.addEventListener('scroll', showNav);
    window.addEventListener('keydown', showNav);

    // Iframe wake-up logic (only runs if game-frame exists)
    const iframe = document.getElementById('game-frame');
    if (iframe) {
        iframe.addEventListener('load', () => {
            try {
                const iDoc = iframe.contentDocument || iframe.contentWindow.document;
                iDoc.addEventListener('mousemove', showNav);
                iDoc.addEventListener('keydown', showNav);
            } catch(e) { console.warn("Nav-wake blocked inside iframe."); }
        });
    }

    showNav();
}

// --- GLOBAL FUNCTIONS ---
window.exportUserData = () => {
    const allData = JSON.stringify(localStorage);
    if (allData === "{}") return alert("No data to save.");
    const blob = new Blob([allData], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'krethan-data.json';
    link.click();
    URL.revokeObjectURL(url);
    setTimeout(() => window.toggleInstructions(true), 500);
};

window.triggerInternalFileInput = () => {
    const handler = document.getElementById('importFileHandler');
    if(handler) handler.click();
};

window.importUserData = (event) => {
    const file = event.target.files[0];
    const reader = new FileReader();
    reader.onload = (e) => {
        try {
            const data = JSON.parse(e.target.result);
            if (confirm("Overwrite all data?")) {
                localStorage.clear();
                Object.keys(data).forEach(k => localStorage.setItem(k, data[k]));
                window.location.reload();
            }
        } catch(err) { alert("Invalid backup file."); }
    };
    reader.readAsText(file);
};

window.toggleDisclaimer = (s) => document.getElementById('disclaimer-modal').classList.toggle('active', s);
window.toggleInstructions = (s) => document.getElementById('instructions-modal').classList.toggle('active', s);

window.onclick = (e) => {
    if (e.target.classList.contains('modal-overlay')) {
        window.toggleDisclaimer(false);
        window.toggleInstructions(false);
    }
};

// Run the script
initNavbar();