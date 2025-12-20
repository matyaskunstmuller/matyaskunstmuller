/*
 * ============================================
 * === nav.js (Kompletní verze s opravami) ===
 * ============================================
 */

function createNav(relativePath = '', activePageID = '') {

    // --- 1. Definice hlavních odkazů ---
    const mainLinks = {
        main: `<a href="${relativePath}index.html" 
                       class="name-link ${activePageID === 'main' ? 'active' : ''}">
                       Matyas Kunstmüller
                    </a>`,

        omne: `<a href="${relativePath}o-mne/omne.html" class="${activePageID === 'omne' ? 'active' : ''}">O mně</a>`,
        portfolio: `<a href="${relativePath}projects/book/bookengine.html" 
                       class="${activePageID.startsWith('portfolio') ? 'active' : ''}">
                       Portfolio
                    </a>`,
        projekty: `<a href="${relativePath}projects/projekty/projekty.html" 
                       class="${activePageID.startsWith('projekty') ? 'active' : ''}">
                       Projekty
                    </a>`
    };

    // Pod-menu Portfolio - Aktualizované pořadí spreadů
    const portfolioSubNav = [
        { id: 'portfolio-s2', href: `${relativePath}projects/book/bookengine.html#spread=2`, text: 'S3B' },
        { id: 'portfolio-s3', href: `${relativePath}projects/book/bookengine.html#spread=3`, text: '360' },
        { id: 'portfolio-s4', href: `${relativePath}projects/book/bookengine.html#spread=4`, text: 'Piktogramy' },
        { id: 'portfolio-s5', href: `${relativePath}projects/book/bookengine.html#spread=5`, text: 'Bertík' },
        { id: 'portfolio-s6', href: `${relativePath}projects/book/bookengine.html#spread=6`, text: 'Busking / Ztohoven' },
        { id: 'portfolio-s7', href: `${relativePath}projects/book/bookengine.html#spread=7`, text: 'Typotrip' },
        { id: 'portfolio-s8', href: `${relativePath}projects/book/bookengine.html#spread=8`, text: 'Blokkada' },
        { id: 'portfolio-s9', href: `${relativePath}projects/book/bookengine.html#spread=9`, text: 'Bez Filtru' },
        { id: 'portfolio-s10', href: `${relativePath}projects/book/bookengine.html#spread=10`, text: 'City Smog' },
        { id: 'portfolio-s11', href: `${relativePath}projects/book/bookengine.html#spread=11`, text: '1.TXT' },
        { id: 'portfolio-s12', href: `${relativePath}projects/book/bookengine.html#spread=12`, text: 'skicák' }
    ];

    // Pod-menu Projekty - Bertík nastaven na otevírání v novém okně
    const projektySubNav = [
        { id: 'projekty-1txt', href: `${relativePath}projects/1.txt/1.txt.html`, text: '1.TXT' },
        { id: 'projekty-bezfiltru', href: `${relativePath}projects/bez filtru/bez.filtru.html`, text: 'Bez filtru' },
        { id: 'projekty-blokkada', href: `${relativePath}projects/font/font.html`, text: 'Blokkada' },
        { id: 'projekty-citysmog', href: `${relativePath}projects/city smog super swag/city smog super swag.html`, text: 'City Smog Super Swag' },
        { id: 'projekty-bertik', href: `https://matyaskunstmuller.github.io/bertik/`, text: 'Bertík', target: '_blank' }
    ];

    // Pomocná funkce pro sestavení sub-nav (podporuje target="_blank")
    function buildSubNav(items) {
        let html = '<ul class="sub-nav">';
        for (const item of items) {
            const isActive = (item.id === activePageID);
            const targetAttr = item.target ? `target="${item.target}"` : '';
            html += `<li class="sub-nav-item">
                         <a href="${item.href}" ${targetAttr} class="${isActive ? 'active-sub' : ''}">
                           ${item.text}
                         </a>
                     </li>`;
        }
        html += '</ul>';
        return html;
    }

    // --- Sestavení celkového HTML navigace ---
    let navHTML = '<nav class="project-list"><ul>';

    navHTML += `<li>${mainLinks.main}</li>`;
    navHTML += `<li class="nav-spacer"></li>`; 
    navHTML += `<li class="nav-spacer"></li>`; 
    navHTML += `<li>${mainLinks.omne}</li>`;
    navHTML += `<li class="nav-spacer"></li>`;
    
    // Sekce Portfolio
    const isPortfolioOpen = activePageID.startsWith('portfolio') ? 'open' : '';
    navHTML += `<li class="has-submenu ${isPortfolioOpen}">`;
    navHTML += `<div class="nav-row">`;
    navHTML += mainLinks.portfolio;
    navHTML += `<span class="nav-expand-arrow" aria-label="Rozbalit Portfolio"></span>`;
    navHTML += `</div>`;
    navHTML += buildSubNav(portfolioSubNav);
    navHTML += `</li>`;
    
    navHTML += `<li class="nav-spacer"></li>`;
    
    // Sekce Projekty
    const isProjektyOpen = activePageID.startsWith('projekty') ? 'open' : '';
    navHTML += `<li class="has-submenu ${isProjektyOpen}">`;
    navHTML += `<div class="nav-row">`;
    navHTML += mainLinks.projekty;
    navHTML += `<span class="nav-expand-arrow" aria-label="Rozbalit Projekty"></span>`;
    navHTML += `</div>`;
    navHTML += buildSubNav(projektySubNav);
    navHTML += `</li>`;

    navHTML += '</ul></nav>';

    // --- Vstříknutí do placeholderu ---
    const navPlaceholder = document.getElementById('nav-placeholder');
    if (navPlaceholder) {
        navPlaceholder.innerHTML = `
            <div id="desktop-nav">
                <button class="desktop-toggle-btn" aria-label="Přepnout postranní navigaci"></button>
                <div class="desktop-nav-content">
                    ${navHTML} 
                </div>
            </div>

            <div id="mobile-nav">
                <button class="mobile-toggle-btn" aria-label="Přepnout horní navigaci"></button>
                <div class="mobile-nav-content">
                    ${navHTML}
                </div>
            </div>
        `;
    }

    // --- Event Listenery pro ovládání menu ---
    const arrows = document.querySelectorAll('.nav-expand-arrow');
    arrows.forEach(arrow => {
        arrow.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            const parentLi = arrow.closest('li');
            parentLi.classList.toggle('open');
        });
    });

    const desktopButton = document.querySelector('.desktop-toggle-btn');
    if (desktopButton) {
        desktopButton.addEventListener('click', () => {
            document.body.classList.toggle('desktop-nav-closed');
        });
    }

    const mobileButton = document.querySelector('.mobile-toggle-btn');
    if (mobileButton) {
        mobileButton.addEventListener('click', () => {
            document.body.classList.toggle('mobile-nav-open');
        });
    }

    // Automatické otevření mobilního menu na hlavní stránce
    if (window.innerWidth <= 768 || window.matchMedia("(orientation: portrait)").matches) {
        if (activePageID === 'main') {
            document.body.classList.add('mobile-nav-open');
        }
    }
}