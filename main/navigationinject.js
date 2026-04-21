const navbarHTML = `
<nav id="nav">
    <div class="nav-left">
        <div class="ic-logo">
            <span class="campus">Campus</span>
            <span class="student">Student</span>
        </div>
    </div>
    <div class="nav-right">
        <input type="text" class="search-input" placeholder="Search games...">
        <a href="index.html" class="nav-link">Homepage</a>
        <a href="javascript:void(0)" class="nav-link" onclick="toggleDisclaimer(true)">Disclaimer</a>
        <a href="https://docs.google.com/forms/d/e/1FAIpQLSdAS8C_gANDaBC5AvOTb-cjWLUuUjzyqbe6eMsrSpuhiE5OaQ/viewform?usp=header_el" target="_blank" class="nav-link">Feedback</a>
    </div>
</nav>

<div id="disclaimer-modal" class="modal-overlay">
    <div class="modal-content">
        <div class="modal-header">
            <h2>Notice</h2>
            <button class="close-btn" onclick="toggleDisclaimer(false)">&times;</button>
        </div>
        <div class="modal-body">
            <p><strong>Educational Purposes Only:</strong> This site is a personal project. Whether this site is accessed when not appropriate is not my responsibility. All games are properties of their respective owners. I own none of the games, I only used libraries and such to program this website.</p>
        </div>
        <div class="modal-footer">
            <button class="agree-btn" onclick="toggleDisclaimer(false)">I Understand</button>
        </div>
    </div>
</div>
`;

function initNavbar() {
    const container = document.getElementById('navbar-container');
    if (!container) {
        setTimeout(initNavbar, 50); // Wait for the container to exist
        return;
    }
    container.innerHTML = navbarHTML;
}

initNavbar();

window.toggleDisclaimer = (show) => {
    const modal = document.getElementById('disclaimer-modal');
    if (modal) modal.classList.toggle('active', show);
};

window.onclick = (e) => {
    if (e.target.classList.contains('modal-overlay')) toggleDisclaimer(false);
};