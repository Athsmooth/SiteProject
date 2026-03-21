document.addEventListener("DOMContentLoaded", () => {
    // --- 1. THE DATA LISTS ---
    const gameFiles = [
        "html5/clicker.htm", 
        "html5/run3.html", 
        "html5/slope.html", 
        "html5/papas-burgeria.html", 
        "html5/eaglercraft-1.5.2.html", 
        "html5/circloO2.html", 
        "html5/stacktris.html",
        "html5/slither.html",
        "html5/krecakmon.html"
    ];

    const assetFiles = [
        "assets/click-cookie-thumbnail.jpeg", 
        "assets/run3-thumbnail.jpeg", 
        "assets/slope-thumbnail.jpeg", 
        "assets/papas-burgeria-thumbnail.jpeg", 
        "assets/minecraft-thumbnail.jpeg", 
        "assets/circlo0-thumbnail.jpeg", 
        "assets/stacktris-thumbnail.jpeg",
        "assets/slither.jpeg"
        // Note: krecakmon is missing a thumbnail here to test the fallback
    ];

    // --- 2. THE STYLES ---
    const style = document.createElement('style');
    style.textContent = `
        .my-nav { background: #1a1a1a; padding: 15px; display: flex; justify-content: space-between; align-items: center; font-family: sans-serif; border-bottom: 2px solid #333; position: sticky; top: 0; z-index: 1000; }
        .my-nav a { color: white; text-decoration: none; margin: 0 15px; font-weight: bold; }
        .panic-btn { background: #ff4444; padding: 8px 16px; border-radius: 4px; color: white; cursor: pointer; border: none; font-weight: bold; }
        
        .projects-grid { display: grid; grid-template-columns: repeat(auto-fill, 200px); gap: 20px; justify-content: center; margin: 30px auto; max-width: 900px; }
        .game-link { text-decoration: none; transition: 0.2s; }
        
        .projects-grid img { width: 200px; height: 200px; border-radius: 8px; border: 2px solid transparent; transition: 0.2s; object-fit: cover; }
        .game-link:hover img { transform: scale(1.05); border-color: #ff9800; }

        /* Style for buttons when thumbnail is missing */
        .no-thumb { 
            width: 200px; 
            height: 200px; 
            background: #2a2a2a; 
            color: #ff9800; 
            display: flex; 
            align-items: center; 
            justify-content: center; 
            border-radius: 8px; 
            font-weight: bold; 
            text-transform: uppercase;
            text-align: center;
            padding: 15px;
            box-sizing: border-box;
            border: 2px solid #444;
            font-family: sans-serif;
            transition: 0.2s;
        }
        .game-link:hover .no-thumb { 
            transform: scale(1.05); 
            border-color: #ff9800; 
            background: #333; 
        }
    `;
    document.head.appendChild(style);

    // --- 3. INJECT TOP BAR ---
    const navHTML = `
        <div class="my-nav">
            <a href="index.html">Krecak Kreations</a>
            <div class="links">
                <a href="index.html">Home</a>
                <button class="panic-btn" id="panicButton">PANIC</button>
            </div>
        </div>`;
    document.body.insertAdjacentHTML('afterbegin', navHTML);

    document.getElementById('panicButton').onclick = () => {
        window.open("https://drive.google.com", "_blank");
    };

    // --- 4. INJECT GAME GRID ---
    const gridContainer = document.querySelector('.projects-placeholder');
    if (gridContainer) {
        let gridHTML = '<div class="projects-grid">';
        
        gameFiles.forEach((file, index) => {
            const img = assetFiles[index];
            
            // Extract and clean the filename (e.g., "papas-burgeria.html" -> "papas burgeria")
            const rawName = file.split('/').pop().split('.')[0];
            const cleanName = rawName.replace(/-/g, ' ');

            gridHTML += `<a href="${file}" class="game-link">`;
            
            if (img && img.trim() !== "") {
                // Use [alt text](https://accessibility.olemiss.edu/home/web/adding-alt-text-to-images/) for accessibility
                gridHTML += `<img src="${img}" alt="${cleanName}">`;
            } else {
                // Fallback: Show the cleaned filename in a styled box
                gridHTML += `<div class="no-thumb">${cleanName}</div>`;
            }
            
            gridHTML += `</a>`;
        });
        
        gridHTML += '</div>';
        gridContainer.innerHTML = gridHTML;
    }
});
