/* --- NAVIGATION INJECTOR --- */
// Standard strings used to prevent "literal not terminated" SyntaxErrors
var navbarHTML = '<nav id="nav">' +
    '<div class="nav-left">' +
        '<a href="/main/index.html" style="text-decoration: none; color: inherit;">' +
            '<div class="ic-logo">' +
                '<span class="logo">Krethan\'s Page</span>' +
            '</div>' +
        '</a>' +
    '</div>' +
    '<div class="nav-right">' +
        '<input type="text" class="search-input" placeholder="Search games...">' +
        '<a href="/main/index.html" class="nav-link">Homepage</a>' +
        '<a href="javascript:void(0)" class="nav-link" onclick="exportUserData()">Save Data</a>' +
        '<a href="javascript:void(0)" class="nav-link" onclick="triggerInternalFileInput()">Load Data</a>' +
        '<a href="javascript:void(0)" class="nav-link" onclick="toggleDisclaimer(true)">Disclaimer</a>' +
        '<a href="https://docs.google.com/forms/d/e/1FAIpQLSdAS8C_gANDaBC5AvOTb-cjWLUuUjzyqbe6eMsrSpuhiE5OaQ/viewform?usp=header_el" target="_blank" class="nav-link">Feedback</a>' +
    '</div>' +
'</nav>' +
'<div id="toast-container" style="position: fixed; top: 85px; left: 50%; transform: translateX(-50%); display: flex; flex-direction: column; gap: 10px; align-items: center; z-index: 10001; pointer-events: none;"></div>' +
'<input type="file" id="importFileHandler" style="display:none" accept=".json" onchange="importUserData(event)">' +
'<div id="disclaimer-modal" class="modal-overlay" style="display:none; position: fixed; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.8); z-index:10002; justify-content:center; align-items:center;">' +
    '<div class="modal-content" style="background:#0d1117; padding:20px; border-radius:8px; border:1px solid #30363d; text-align:center; color:white; max-width:400px;">' +
        '<h2>Notice</h2>' +
        '<p>Educational Purposes Only: Games belong to their owners.</p>' +
        '<button onclick="toggleDisclaimer(false)" style="background:#238636; color:white; border:none; padding:10px 20px; border-radius:5px; cursor:pointer;">I Understand</button>' +
    '</div>' +
'</div>';

var isNavLocked = false;
var lastToastTime = 0;

function showToast(msg) {
    var now = Date.now();
    if (now - lastToastTime < 100) return; 
    lastToastTime = now;
    var container = document.getElementById('toast-container');
    if (!container) return;
    var toast = document.createElement('div');
    toast.style.background = "rgba(13, 17, 23, 0.95)";
    toast.style.color = "white";
    toast.style.padding = "12px 24px";
    toast.style.borderRadius = "8px";
    toast.style.border = "1px solid #1b69c3";
    toast.style.opacity = "0";
    toast.style.transition = "all 0.4s ease";
    toast.style.fontFamily = "sans-serif";
    toast.innerText = msg;
    container.appendChild(toast);
    setTimeout(function() { toast.style.opacity = "1"; }, 10);
    setTimeout(function() { 
        toast.style.opacity = "0"; 
        setTimeout(function() { toast.remove(); }, 400); 
    }, 3000);
}

function setupNavBehavior() {
    var nav = document.getElementById('nav');
    var searchInput = document.querySelector('.search-input');
    if (!nav) return;

    // Search logic: Redirects back to library from anywhere
    if (searchInput) {
        searchInput.addEventListener('keydown', function(e) {
            if (e.key === 'Enter') {
                var term = searchInput.value.trim();
                if (term.length > 0) {
                    window.location.href = '/main/index.html?search=' + encodeURIComponent(term);
                }
            }
        });
    }

    // Commands: Ctrl+Alt+H (Hide) and Ctrl+Alt+P (Panic)
    window.addEventListener('keydown', function(e) {
        if (e.ctrlKey && e.altKey && e.code === 'KeyH') {
            e.preventDefault();
            isNavLocked = !isNavLocked;
            nav.classList.toggle('nav-hidden', isNavLocked);
            showToast(isNavLocked ? "Navbar Hidden" : "Navbar Visible");
        }
        if (e.ctrlKey && e.altKey && e.code === 'KeyP') {
            e.preventDefault();
            window.open('https://google.com', '_blank');
            window.location.replace('https://drive.google.com');
        }
    });
}

// --- DATA FUNCTIONS ---
window.exportUserData = function() {
    var data = JSON.stringify(localStorage);
    if (data === "{}") return alert("No data found.");
    var blob = new Blob([data], {type: 'application/json'});
    var url = URL.createObjectURL(blob);
    var a = document.createElement('a');
    a.href = url;
    a.download = 'backup.json';
    a.click();
};

window.triggerInternalFileInput = function() { 
    document.getElementById('importFileHandler').click(); 
};

window.importUserData = function(e) {
    var file = e.target.files[0];
    if (!file) return;
    var reader = new FileReader();
    reader.onload = function(event) {
        try {
            var data = JSON.parse(event.target.result);
            localStorage.clear();
            for (var key in data) {
                localStorage.setItem(key, data[key]);
            }
            window.location.reload();
        } catch(err) { alert("Invalid backup file."); }
    };
    reader.readAsText(file);
};

window.toggleDisclaimer = function(s) {
    var modal = document.getElementById('disclaimer-modal');
    if (modal) modal.style.display = s ? 'flex' : 'none';
};

(function init() {
    var container = document.getElementById('navbar-container');
    if (container) {
        container.innerHTML = navbarHTML;
        setupNavBehavior();
    } else {
        setTimeout(init, 50);
    }
})();