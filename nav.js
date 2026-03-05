/*
 * ============================================
 * === nav.js (S ikonami Instagram a Mail) ===
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

        projekty: `<a href="${relativePath}projects/projekty/projekty.html" 
                       class="${(activePageID.startsWith('projekty') || activePageID.startsWith('portfolio')) ? 'active' : ''}">
                       Projekty
                    </a>`,

        fotky: `<a href="${relativePath}projects/fotky/fotky.html" class="${activePageID === 'fotky' ? 'active' : ''}">Fotky</a>`
    };

    // --- 2. Definice Ikonek (SVG) a Odkazů ---
    // ZDE SI UPRAV ODKAZY NA SVŮJ INSTAGRAM A EMAIL
    const socialLinks = {
        instagram: "https://www.instagram.com/vymalovano_mk/",

    };

    const icons = {
        instagram: `<svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>`,
        mail: `<svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>`
    };


    // Pod-menu Portfolio
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

    // Pod-menu Projekty
    const projektySubNav = [
        {
            id: 'portfolio',
            href: `${relativePath}projects/book/bookengine.html`,
            text: 'Portfolio 25',
            children: portfolioSubNav
        },
        { id: 'projekty-bertik', href: `${relativePath}projects/bertik/bertik.html`, text: 'Bertík' },
        { id: 'projekty-bezfiltru', href: `${relativePath}projects/bez filtru/bez.filtru.html`, text: 'Bez filtru' },
        { id: 'projekty-blokkada', href: `${relativePath}projects/font/font.html`, text: 'Blokkada' },
        { id: 'projekty-1txt', href: `${relativePath}projects/1.txt/1.txt.html`, text: '1.TXT' },
        { id: 'projekty-citysmog', href: `${relativePath}projects/city smog super swag/city smog super swag.html`, text: 'City Smog Super Swag' }
    ];

    function buildSubNav(items) {
        let html = '<ul class="sub-nav nested-sub-nav">';
        for (const item of items) {
            let isActive = false;
            if (item.id === activePageID) isActive = true;

            const targetAttr = item.target ? `target="${item.target}"` : '';

            if (item.children) {
                // Otevře se jen pokud je načten konkrétní spread (tzn. ID začíná např. 'portfolio-s')
                const isOpen = activePageID.startsWith('portfolio-') ? 'open' : '';
                html += `<li class="sub-nav-item has-submenu portfolio-sub-nav-item ${isOpen}">
                             <div class="nav-row">
                               <a href="${item.href}" ${targetAttr} class="${isActive ? 'active-sub' : ''}">
                                 ${item.text}
                               </a>
                               <span class="nav-expand-arrow nested-arrow ${isActive ? 'is-active-link' : ''}" aria-label="Rozbalit ${item.text}"></span>
                             </div>
                             ${buildSubNav(item.children)}
                         </li>`;
            } else {
                html += `<li class="sub-nav-item">
                             <a href="${item.href}" ${targetAttr} class="${isActive ? 'active-sub' : ''}">
                               ${item.text}
                             </a>
                         </li>`;
            }
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

    // Sekce Portfolio byla přesunuta pouze na stránku Projekty

    // Sekce Projekty
    const isProjektyOpen = (activePageID.startsWith('projekty') || activePageID.startsWith('portfolio')) ? 'open' : '';
    navHTML += `<li class="has-submenu ${isProjektyOpen}">`;
    navHTML += `<div class="nav-row">`;
    navHTML += mainLinks.projekty;
    navHTML += `<span class="nav-expand-arrow" aria-label="Rozbalit Projekty"></span>`;
    navHTML += `</div>`;
    navHTML += buildSubNav(projektySubNav);
    navHTML += `</li>`;

    navHTML += `<li class="nav-spacer"></li>`;

    // Odkaz na Fotky
    navHTML += `<li>${mainLinks.fotky}</li>`;

    // --- PŘIDÁNÍ IKON POD FOTKY ---
    navHTML += `<li class="nav-spacer"></li>`;
    navHTML += `<li class="nav-spacer"></li>`;
    navHTML += `<li class="nav-socials">
                    <a href="${socialLinks.instagram}" target="_blank" aria-label="Instagram">${icons.instagram}</a>
                   
                </li>`;

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

    // --- Event Listenery ---
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

    if (window.innerWidth <= 768 || window.matchMedia("(orientation: portrait)").matches) {
        if (activePageID === 'main') {
            document.body.classList.add('mobile-nav-open');
        }
    }
}