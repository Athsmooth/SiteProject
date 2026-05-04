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

<div id="toast-container" style="
    position: fixed; 
    top: 85px; 
    left: 50%; 
    transform: translateX(-50%); 
    display: flex; 
    flex-direction: column; 
    gap: 10px; 
    align-items: center; 
    z-index: 10001; 
    pointer-events: none;
"></div>

<input type="file" id="importFileHandler" style="display:none" accept=".json" onchange="importUserData(event)">

<div id="disclaimer-modal" class="modal-overlay">
    <div class="modal-content">
        <div class="modal-header"><h2>Notice</h2></div>
        <div class="modal-body"><p>Educational Purposes Only: Games belong to their owners.</p></div>
        <div class="modal-footer"><button class="agree-btn" onclick="toggleDisclaimer(false)">I Understand</button></div>
    </div>
</div>
`;

let isNavLocked = false;
let lastToastTime = 0;

function showToast(msg) {
    const now = Date.now();
    // Debounce: prevent same-time double triggers
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
        fontFamily: "sans-serif",
        fontSize: "14px",
        fontWeight: "500",
        border: "1px solid #1b69c3",
        boxShadow: "0 4px 15px rgba(0,0,0,0.5)",
        opacity: "0",
        transform: "translateY(-10px)",
        transition: "all 0.4s ease"
    });

    toast.innerText = msg;
    container.appendChild(toast);

    setTimeout(() => {
        toast.style.opacity = "1";
        toast.style.transform = "translateY(0)";
    }, 10);

    setTimeout(() => {
        toast.style.opacity = "0";
        toast.style.transform = "translateY(-10px)";
        setTimeout(() => toast.remove(), 3000);
    }, 3000);
}

function setupNavBehavior() {
    const nav = document.getElementById('nav');
    if (!nav) return;

    let navTimeout;
    const isHomePage = window.location.pathname.endsWith('index.html') || window.location.pathname === '/' || window.location.pathname === '';

    window.showNav = function() {
        if (isNavLocked) return;
        nav.classList.remove('nav-hidden');
        clearTimeout(navTimeout);
        if (!isHomePage) {
            navTimeout = setTimeout(() => {
                if (!nav.matches(':hover') && document.activeElement.tagName !== 'INPUT') {
                    nav.classList.add('nav-hidden');
                }
            }, 3000);
        }
    };

    const handleShortcuts = (e) => {
        const isHide = e.ctrlKey && e.altKey && e.code === 'KeyH';
        const isPanic = e.ctrlKey && e.altKey && e.code === 'KeyP';

        if (isHide || isPanic) {
            e.preventDefault();
            e.stopPropagation(); // Stop event from bubbling to window
        }

        if (isHide) {
            isNavLocked = !isNavLocked;
            if (isNavLocked) {
                nav.classList.add('nav-hidden');
                showToast("Navbar Locked Hidden (Ctrl+Alt+H to show)");
            } else {
                nav.classList.remove('nav-hidden');
                showToast("Navbar Unlocked");
                window.showNav();
            }
            return;
        }

        if (isPanic) {
            window.open('https://google.com', '_blank');
            isNavLocked = true;
            nav.classList.add('nav-hidden');
            showToast("New safe tab opened.");
            return;
        }

        window.showNav();
    };

    // Main window listeners
    window.removeEventListener('keydown', handleShortcuts);
    window.addEventListener('keydown', handleShortcuts);
    window.addEventListener('mousemove', window.showNav);
    window.addEventListener('scroll', window.showNav);

    // Iframe listeners
    const iframe = document.getElementById('game-frame');
    if (iframe) {
        iframe.addEventListener('load', () => {
            // Only show tips once per frame load
            if (!iframe.dataset.tipsShown) {
                setTimeout(() => showToast("For fullscreen press Ctrl+Alt+H"), 1000);
                setTimeout(() => showToast("Press Ctrl+Alt+P for panic mode"), 1200);
                iframe.dataset.tipsShown = "true";
            }

            try {
                const iDoc = iframe.contentDocument || iframe.contentWindow.document;
                iDoc.removeEventListener('keydown', handleShortcuts);
                iDoc.addEventListener('keydown', handleShortcuts);
                iDoc.addEventListener('mousemove', window.showNav);
                iDoc.addEventListener('mousedown', window.showNav);
            } catch(e) { console.warn("Iframe blocked activity listeners."); }
        });
    }
    window.showNav();
}

// --- GLOBAL DATA FUNCTIONS ---
window.exportUserData = () => {
    const data = JSON.stringify(localStorage);
    if (data === "{}") return alert("No data found.");
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'backup.json';
    link.click();
    URL.revokeObjectURL(url);
};

window.triggerInternalFileInput = () => document.getElementById('importFileHandler').click();

window.importUserData = (e) => {
    const file = e.target.files[0];
    const reader = new FileReader();
    reader.onload = (event) => {
        try {
            const data = JSON.parse(event.target.result);
            if (confirm("Overwrite all data?")) {
                localStorage.clear();
                Object.keys(data).forEach(k => localStorage.setItem(k, data[k]));
                window.location.reload();
            }
        } catch(err) { alert("Invalid file."); }
    };
    reader.readAsText(file);
};

window.toggleDisclaimer = (s) => document.getElementById('disclaimer-modal').classList.toggle('active', s);

// Initialize with safety check
(function init() {
    const container = document.getElementById('navbar-container');
    if (container) {
        container.innerHTML = navbarHTML;
        setupNavBehavior();
    } else {
        setTimeout(init, 50);
    }
})();