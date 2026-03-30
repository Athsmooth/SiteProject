const navbarHTML = `
<nav id="nav">
    <div class="nav-left">
        <div class="ic-logo">
            <span class="campus">Campus</span>
            <span class="student">Student</span>
        </div>
    </div>
    <div class="nav-right">
        <a href="index.html" class="nav-link">Today</a>
        <a href="javascript:void(0)" class="nav-link" onclick="toggleDisclaimer(true)">Disclaimer</a>
        <a href="https://docs.google.com/forms/d/e/1FAIpQLSdAS8C_gANDaBC5AvOTb-cjWLUuUjzyqbe6eMsrSpuhiE5OaQ/viewform?usp=publish-editor" target="_blank" class="nav-link">Feedback</a>
    </div>
</nav>

<div id="disclaimer-modal" class="modal-overlay">
    <div class="modal-content">
        <div class="modal-header">
            <h2>Notice</h2>
            <button class="close-btn" onclick="toggleDisclaimer(false)">&times;</button>
        </div>
        <div class="modal-body">
            <p><strong>Educational Purposes Only:</strong> This site is a personal project. Whether this site is accesed when not appropriate is not my responsability. All games are properties of their respective owners. https://github.com/Susorodni/swfgalaxy/tree/master
https://github.com/CoolDude2349/Offline-HTML-Games-Pack</p>
        </div>
        <div class="modal-footer">
            <button class="agree-btn" onclick="toggleDisclaimer(false)">I Understand</button>
        </div>
    </div>
</div>
`;

// Inject into the top of the body
document.body.insertAdjacentHTML('afterbegin', navbarHTML);

// Universal Toggle Function
window.toggleDisclaimer = (show) => {
    document.getElementById('disclaimer-modal').classList.toggle('active', show);
};

window.onclick = (e) => {
    if (e.target.classList.contains('modal-overlay')) toggleDisclaimer(false);
};