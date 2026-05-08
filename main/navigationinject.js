/* --- NAVIGATION INJECTOR --- */
const navbarHTML = `
<nav id="nav">
    <div class="nav-left">
        <a href="index.html" style="text-decoration: none; color: inherit;">
            <div class="ic-logo">
                <span class="logo">Krethan's Page</span>
            </div>
        </a>
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

<div id="toast-container" style="position: fixed; top: 85px; left: 50%; transform: translateX(-50%); display: flex; flex-direction: column; gap: 10px; align-items: center; z-index: 10001; pointer-events: none;"></div>

<input type="file" id="importFileHandler" style="display:none" accept=".json" onchange="importUserData(event)">

<div id="disclaimer-modal" class="modal-overlay">
    <div class="modal-content">
        <div class="modal-header"><h2>Notice</h2></div>
        <div class="modal-body"><p>Educational Purposes Only: Games belong to their owners.</p></div>
        <div class="modal-footer"><button class="agree-btn" onclick="toggleDisclaimer(false)">I Understand</button></div>
    </div>
</div>
`;

// Set to false initially so it is VISIBLE by default
let isNavLockedVisible = true; 
let lastToastTime = 0;

function showToast(msg) {
    const now = Date.now();
    if (now - lastToastTime < 100) return; 
    lastToastTime = now;
    const container = document.getElementById('toast-container');
    if (!container) return;
    const toast = document.createElement('div');
    Object.assign(toast.style, {
        background: "rgba(13, 17, 23, 0.95)", 
        color: "white", 
        padding: "12px 24px", 
        borderRadius: "8px", 
        border: "1px solid #1b69c3", 
        opacity: "0", 
        transition: "all 0.4s ease",
        fontFamily: "sans-serif"
    });
    toast.innerText = msg;
    container.appendChild(toast);
    setTimeout(() => toast.style.opacity = "1", 10);
    setTimeout(() => { 
        toast.style.opacity = "0"; 
        setTimeout(() => toast.remove(), 400); 
    }, 3000);
}

function setupNavBehavior() {
    const nav = document.getElementById('nav');
    const searchInput = document.querySelector('.search-input');
    if (!nav) return;

    // Ensure the nav is visible immediately upon injection
    nav.classList.remove('nav-hidden');

    // --- SEARCH REDIRECT ---
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            const term = e.target.value;
            // Improved home detection
            const isHome = window.location.pathname.endsWith('index.html') || 
                           window.location.pathname === '/' || 
                           window.location.pathname === '';
                           
            if (!isHome && term.length > 0) {
                window.location.href = 'index.html?search=' + encodeURIComponent(term);
            }
        });
    }

    const handleShortcuts = (e) => {
        const isToggle = e.ctrlKey && e.altKey && e.code === 'KeyH';
        const isPanic = e.ctrlKey && e.altKey && e.code === 'KeyP';

        if (isToggle) {
            e.preventDefault();
            // This purely toggles the hidden state manually
            const currentlyHidden = nav.classList.contains('nav-hidden');
            if (currentlyHidden) {
                nav.classList.remove('nav-hidden');
                showToast("Navbar Visible");
            } else {
                nav.classList.add('nav-hidden');
                showToast("Navbar Hidden");
            }
        }

        if (isPanic) {
            e.preventDefault();
            window.open('https://google.com', '_blank');
            window.location.replace('https://drive.google.com');
        }
    };

    window.addEventListener('keydown', handleShortcuts);
    
    // REMOVED: Mousemove and Timeout logic that causes disappearing.
    // The navbar will now stay put unless Ctrl+Alt+H is pressed.
}

// --- GLOBAL DATA FUNCTIONS ---
window.exportUserData = () => {
    const data = JSON.stringify(localStorage);
    const blob = new Blob([data], {type: 'application/json'});
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'save_backup.json';
    a.click();
    showToast("Data Exported");
};

window.triggerInternalFileInput = () => document.getElementById('importFileHandler').click();

window.importUserData = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
        try {
            const data = JSON.parse(event.target.result);
            Object.keys(data).forEach(k => localStorage.setItem(k, data[k]));
            showToast("Data Imported! Reloading...");
            setTimeout(() => window.location.reload(), 1000);
        } catch(err) {
            alert("Error importing file.");
        }
    };
    reader.readAsText(file);
};

window.toggleDisclaimer = (s) => {
    const modal = document.getElementById('disclaimer-modal');
    if(modal) modal.style.display = s ? 'flex' : 'none';
};

(function init() {
    const container = document.getElementById('navbar-container');
    if (container) {
        container.innerHTML = navbarHTML;
        setupNavBehavior();
    } else {
        setTimeout(init, 50);
    }
})();