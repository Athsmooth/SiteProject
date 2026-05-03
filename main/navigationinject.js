/* --- NAVIGATION INJECTOR --- */
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

function showToast(msg) {
    const container = document.getElementById('toast-container');
    if (!container) return;

    // Create a new toast element
    const toast = document.createElement('div');
    
    // Apply styles directly
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

    // Trigger animation
    setTimeout(() => {
        toast.style.opacity = "1";
        toast.style.transform = "translateY(0)";
    }, 10);

    // Remove after 3 seconds
    setTimeout(() => {
        toast.style.opacity = "0";
        toast.style.transform = "translateY(-10px)";
        setTimeout(() => {
            toast.remove();
        }, 400); // Wait for fade out to finish
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
        if (e.ctrlKey && e.altKey && e.code === 'KeyH') {
            e.preventDefault();
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
        if (e.ctrlKey && e.altKey && e.code === 'KeyP') {
            e.preventDefault();

            // Opens a new tab to a safe site
            window.open('https://google.com', '_blank');

            // Optional: Hide the navbar on the current page so it looks cleaner
            const nav = document.getElementById('nav');
            if (nav) {
                isNavLocked = true;
                nav.classList.add('nav-hidden');
            }

            showToast("New safe tab opened.");
            return;
        }
    };

    window.addEventListener('mousemove', window.showNav);
    window.addEventListener('scroll', window.showNav);
    window.addEventListener('keydown', handleShortcuts);

    const iframe = document.getElementById('game-frame');
    if (iframe) {
        iframe.addEventListener('load', () => {
            setTimeout(() => showToast("For fullscren press Ctrl+Alt+H"), 1000);
            showToast("Press Ctrl+Alt+P for panic mode");
            try {
                const iDoc = iframe.contentDocument || iframe.contentWindow.document;
                iDoc.addEventListener('mousemove', window.showNav);
                iDoc.addEventListener('keydown', handleShortcuts);
                iDoc.addEventListener('mousedown', window.showNav);
            } catch(e) { console.warn("Iframe blocked."); }
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

// Initialize
(function init() {
    const container = document.getElementById('navbar-container');
    if (container) {
        container.innerHTML = navbarHTML;
        setupNavBehavior();
    } else {
        setTimeout(init, 50);
    }
})();