// =================================================================
//  KONFIGURACE A GLOBÁLNÍ PROMĚNNÉ
// =================================================================
const CONFIG = {
    animationDuration: 500,
    snapDuration: 350,
    wheelSensitivity: 0.0025,
    touchSwipeThreshold: 10,
    lightboxAnimDuration: 250,
    // OPTIMALIZACE: Kolik stran dopředu/dozadu držet načtených
    imageLoadBuffer: 2, 
    // OPTIMALIZACE: Videa načítat jen pro aktuální spread (šetří drasticky výkon)
    videoLoadBuffer: 0 
};

// Definice, kde jsou videa
const mediaOverlays = {
    1: { right: 'assets/ome.webm' },
    2: { right: 'assets/S3B-2_overlay.webm' },
    3: { right: 'assets/360-2_overlay.webm' },
    4: { left: 'assets/Piktogramy pro školu-1_overlay.webm', right: 'assets/Piktogramy pro školu-2_overlay.webm' },
    5: { left: 'assets/bertik_1_overlay.webm', right: 'assets/bertik_2_overlay.webm' },
    6: { left: 'assets/busking a ztohoven-1_overlay.webm', right: 'assets/ztohoven_overlay.webm' },
    7: { right: 'assets/Typotrip-2_overlay.webm' },
    8: { right: 'assets/blokkada_overlay.webm' },
    10: { right: 'assets/city smog-2_overlay.webm' }, 
    11: { right: 'assets/1-txt-2_overlay_1.webm' }, 
    12: { left: 'assets/skicaky_1_overlay.webm', right: 'assets/skicaky_2_overlay.webm' }, 
};

const book = document.getElementById('book');
const slider = document.getElementById('pageSlider');
const interactiveLayer = document.getElementById('interactive-layer');
const lightbox = document.getElementById('lightbox');
const lightboxStage = document.getElementById('lightbox-stage');
const lightboxPrevBtn = document.getElementById('lightboxPrev');
const lightboxNextBtn = document.getElementById('lightboxNext');
const lightboxReel = document.getElementById('lightbox-reel');
const papers = Array.from(document.querySelectorAll('.paper'));

const state = {
    currentSpread: 0,
    maxSpread: papers.length,
    isAnimating: false,
    touchStartX: null,
};

let galleryItems = [];
let spreadsWithItems = [];
let spreadItems = [];
let currentSpreadItemIndex = 0;
let isLightboxAnimating = false;

// Mapa pro navigaci
const SPREAD_TO_NAV_ID_MAP = {
    2: 'portfolio-s2', 3: 'portfolio-s3', 4: 'portfolio-s4', 5: 'portfolio-s5',
    6: 'portfolio-s6', 7: 'portfolio-s7', 8: 'portfolio-s8', 9: 'portfolio-s9',   
    10: 'portfolio-s10', 11: 'portfolio-s11', 12: 'portfolio-s12', 13: 'portfolio-s13', 14: 'portfolio-s14'
};

// --- OPTIMALIZACE 1: SPRÁVA ZDROJŮ (Načítání a mazání) ---

function manageResources(currentSpread) {
    const spreadIndex = Math.floor(currentSpread);

    // 1. Načtení OBRÁZKŮ (širší buffer)
    const imgStart = Math.max(0, spreadIndex - CONFIG.imageLoadBuffer);
    const imgEnd = Math.min(papers.length, spreadIndex + CONFIG.imageLoadBuffer + 1);

    for (let i = 0; i < papers.length; i++) {
        const paper = papers[i];
        const lazyImages = paper.querySelectorAll('img[data-src]');
        
        if (i >= imgStart && i < imgEnd) {
            // Jsme v zóně -> Načíst
            lazyImages.forEach(img => {
                if (img.dataset.src) {
                    img.src = img.dataset.src;
                    img.removeAttribute('data-src'); // Už nenačítat znovu
                }
            });
        }
    }

    // 2. Správa VIDEÍ (velmi úzký buffer - jen to, co vidím)
    // Projdeme definici mediaOverlays a rozhodneme, co vytvořit a co smazat
    for (const [spreadKey, overlays] of Object.entries(mediaOverlays)) {
        const sKey = parseInt(spreadKey);
        // Video načteme, jen pokud jsme přímo na spreadu nebo těsně vedle
        const shouldLoadVideo = Math.abs(sKey - spreadIndex) <= CONFIG.videoLoadBuffer;

        if (shouldLoadVideo) {
            // Vytvořit video, pokud neexistuje
            createVideoOverlay(sKey, overlays.left, 'left');
            createVideoOverlay(sKey, overlays.right, 'right');
        } else {
            // Odstranit video, aby nežralo paměť
            removeVideoOverlay(sKey, 'left');
            removeVideoOverlay(sKey, 'right');
        }
    }
}

function createVideoOverlay(spreadNum, src, side) {
    if (!src) return;
    
    // Určení kontejneru podle strany
    let containerSelector;
    if (side === 'right') {
        containerSelector = `#p${spreadNum} .front .page-image-wrapper`;
    } else {
        const prevPaperIndex = parseInt(spreadNum) - 1;
        containerSelector = `#p${prevPaperIndex} .back .page-image-wrapper`;
    }

    const container = document.querySelector(containerSelector);
    if (!container) return;

    // Pokud už tam video je, neděláme nic
    if (container.querySelector(`.media-overlay-${side}`)) return;

    const vid = document.createElement("video");
    vid.className = `media-overlay media-overlay-${side}`; // Přidáme třídu pro identifikaci
    vid.style.objectFit = "fill"; // Aby sedělo přesně
    vid.style.position = "absolute";
    vid.style.top = "0";
    vid.style.left = "0";
    vid.style.width = "100%";
    vid.style.height = "100%";
    
    // Důležité pro výkon
    vid.preload = "auto";
    vid.muted = true;
    vid.loop = true;
    vid.playsInline = true;
    vid.src = src;

    // Play až po načtení
    vid.oncanplay = () => {
        vid.play().catch(() => {});
    };

    container.appendChild(vid);
}

function removeVideoOverlay(spreadNum, side) {
    let containerSelector;
    if (side === 'right') {
        containerSelector = `#p${spreadNum} .front .page-image-wrapper`;
    } else {
        const prevPaperIndex = parseInt(spreadNum) - 1;
        containerSelector = `#p${prevPaperIndex} .back .page-image-wrapper`;
    }

    const container = document.querySelector(containerSelector);
    if (!container) return;

    const vid = container.querySelector(`.media-overlay-${side}`);
    if (vid) {
        vid.pause();
        vid.removeAttribute('src'); // Uvolnění z paměti
        vid.load();
        vid.remove();
    }
}

// --- Zbytek logiky knihy ---

function updateBook(spread) {
    papers.forEach((paper, index) => {
        const progress = Math.max(0, Math.min(1, spread - index));
        const rotation = -progress * 180;
        paper.style.transform = `rotateY(${rotation}deg)`;
        
        // Optimalizace z-indexu
        let zIndex;
        if (spread > index) {
            zIndex = index; // Stránky vlevo
        } else {
            zIndex = state.maxSpread - index; // Stránky vpravo
        }
        paper.style.zIndex = zIndex;
        
        // Skrývání neviditelných stránek pro výkon (visibility: hidden)
        // Pokud je stránka úplně otočená nebo úplně neotočená a je hluboko v balíku
        const dist = Math.abs(spread - index);
        if (dist > 2) {
             paper.style.visibility = 'hidden';
        } else {
             paper.style.visibility = 'visible';
        }
    });

    renderButtons(Math.floor(spread));
    manageResources(spread); // Volání optimalizátoru
}

function renderButtons(spread) {
    interactiveLayer.innerHTML = '';
    const relevantButtons = buttonData.filter(btn => btn.spread === spread);

    relevantButtons.forEach(data => {
        const element = document.createElement(data.url ? 'a' : 'div');
        element.className = 'interactive-button';

        if (data.url) {
            element.href = data.url;
            element.target = '_blank';
        } else {
            element.setAttribute('role', 'button');
            const galleryIndex = galleryItems.findIndex(item => item === data);
            if (galleryIndex !== -1) {
                element.addEventListener('click', () => {
                    openLightbox(galleryIndex);
                });
            }
        }
        Object.assign(element.style, data.styles);
        interactiveLayer.appendChild(element);
    });
}

function animateTo(start, end, duration, onCompleteCallback = null) {
    if (state.isAnimating && duration > 0) return;
    state.isAnimating = true;
    const startTime = performance.now();

    const frame = (currentTime) => {
        const elapsed = currentTime - startTime;
        const progress = (duration === 0) ? 1 : Math.min(elapsed / duration, 1);
        const ease = 0.5 * (1 - Math.cos(Math.PI * progress));
        const currentVal = (duration === 0) ? end : (start + (end - start) * ease);

        slider.value = currentVal;
        updateBook(currentVal);

        if (progress < 1) {
            requestAnimationFrame(frame);
        } else {
            state.isAnimating = false;
            slider.value = end;
            updateBook(end);
            renderButtons(end);

            const roundedEnd = Math.round(end);
            if (location.hash !== `#spread=${roundedEnd}`) {
                history.replaceState(null, '', `#spread=${roundedEnd}`);
            }

            const activeNavID = SPREAD_TO_NAV_ID_MAP[roundedEnd] || 'portfolio';
            if (typeof createNav === 'function') {
                 createNav('../../', activeNavID);
            }

            if (onCompleteCallback) onCompleteCallback();
        }
    };
    requestAnimationFrame(frame);
}

// --- LIGHTBOX FUNKCE (Zůstávají stejné, jen zkrácené pro přehlednost) ---
function openLightbox(index) {
    const clickedItem = galleryItems[index];
    if (!clickedItem) return;
    const targetSpread = clickedItem.spread;
    lightbox.classList.add('show');
    document.body.style.overflow = 'hidden';
    
    // Načíst obsah spreadu
    loadSpreadItems(targetSpread, clickedItem);
}

function closeLightbox() {
    lightbox.classList.remove('show');
    document.body.style.overflow = '';
    lightboxStage.innerHTML = '';
    lightboxReel.innerHTML = '';
    spreadItems = [];
}

function loadSpreadItems(spread, itemToSelect = null) {
    // ... (Zde vložte původní kód loadSpreadItems, pokud ho potřebujete detailně, 
    // ... ale pro optimalizaci načítání knihy to není kritické. 
    // ... Použijte původní funkci z vašeho script.js, ta byla v pořádku.)
    
    // PRO ÚČELY TOHOTO FIXU POUŽIJTE PŮVODNÍ FUNKCI loadSpreadItems Z PŘEDCHOZÍHO SOUBORU
    // TATO ČÁST SE NEMĚNÍ
    
    // Zde je zkrácená verze pro kontext:
    lightboxStage.innerHTML = '';
    lightboxReel.innerHTML = '';
    spreadItems = [];
    currentSpreadItemIndex = 0;
    const itemsForSpread = galleryItems.filter(item => item.spread === spread);
    
    itemsForSpread.forEach((itemData, index) => {
        // ... (Logika vytváření elementů lightboxu zůstává beze změny)
        // ...
        // ...
        // Je důležité sem zkopírovat tělo funkce z vašeho původního souboru, 
        // protože jsem ho zde neupravoval (nebyl zdrojem zpomalení startu).
        
        // Zástupná implementace pro ukázku (nahraďte svou plnou verzí):
        const itemWrapper = document.createElement('div');
        itemWrapper.className = 'lightbox-item';
        // ... logika media/text ...
        if (itemData.mediaSrc) {
             const img = document.createElement('img');
             img.src = itemData.mediaSrc;
             img.className = 'lightbox-media';
             itemWrapper.appendChild(img);
        }
        lightboxStage.appendChild(itemWrapper);
        spreadItems.push(itemWrapper);
        if (itemData === itemToSelect) currentSpreadItemIndex = index;
    });
    updateLightboxView();
}

function updateLightboxView() {
    spreadItems.forEach((item, index) => {
        item.classList.remove('active', 'prev', 'next');
        if (index === currentSpreadItemIndex) item.classList.add('active');
    });
}

function setCurrentSpreadItem(index) {
    currentSpreadItemIndex = index;
    updateLightboxView();
}

// --- EVENT LISTENERS ---
function setupEventListeners() {
    slider.addEventListener('input', () => updateBook(parseFloat(slider.value)));
    slider.addEventListener('change', () => {
        const val = parseFloat(slider.value);
        animateTo(val, Math.round(val), CONFIG.snapDuration);
    });

    document.getElementById('arrowLeft').addEventListener('click', () => changeSpread(-1));
    document.getElementById('arrowRight').addEventListener('click', () => changeSpread(1));
    document.getElementById('lightboxClose').addEventListener('click', closeLightbox);
    
    // Klávesnice
    document.addEventListener('keydown', (e) => {
        if (e.key === 'ArrowLeft') changeSpread(-1);
        if (e.key === 'ArrowRight') changeSpread(1);
        if (e.key === 'Escape') closeLightbox();
    });

    // Hash change
    window.addEventListener('hashchange', () => {
        const hash = location.hash;
        if (hash.startsWith('#spread=')) {
            const s = parseInt(hash.substring(8), 10);
            if (!isNaN(s)) animateTo(parseFloat(slider.value), s, CONFIG.animationDuration);
        }
    });
    
    // Touch & Wheel (Zjednodušeno)
    setupWheel();
    setupTouchGestures();
}

function changeSpread(delta) {
    if (state.isAnimating) return;
    const current = Math.round(parseFloat(slider.value));
    const target = Math.max(0, Math.min(state.maxSpread, current + delta));
    if (current !== target) animateTo(parseFloat(slider.value), target, CONFIG.animationDuration);
}

function setupWheel() {
    let wheelAccumulator = 0;
    let isWheelAnimating = false;
    const bookViewport = document.querySelector('.book-viewport');
    
    bookViewport.addEventListener('wheel', event => {
        event.preventDefault();
        wheelAccumulator += event.deltaY * CONFIG.wheelSensitivity;
        if (!isWheelAnimating) {
            isWheelAnimating = true;
            requestAnimationFrame(function animateWheel() {
                if (Math.abs(wheelAccumulator) < 0.001) {
                    isWheelAnimating = false;
                    const target = Math.round(parseFloat(slider.value));
                    animateTo(parseFloat(slider.value), target, CONFIG.snapDuration);
                    return;
                }
                const current = parseFloat(slider.value);
                const step = wheelAccumulator * 0.15;
                wheelAccumulator -= step;
                const nextVal = Math.max(0, Math.min(state.maxSpread, current + step));
                slider.value = nextVal;
                updateBook(nextVal);
                requestAnimationFrame(animateWheel);
            });
        }
    }, { passive: false });
}

function setupTouchGestures() {
    const bookViewport = document.querySelector('.book-viewport');
    bookViewport.addEventListener('touchstart', (e) => { state.touchStartX = e.changedTouches[0].screenX; }, { passive: true });
    bookViewport.addEventListener('touchend', (e) => {
        if (state.touchStartX === null) return;
        const deltaX = e.changedTouches[0].screenX - state.touchStartX;
        if (Math.abs(deltaX) > CONFIG.touchSwipeThreshold) changeSpread(deltaX < 0 ? 1 : -1);
        state.touchStartX = null;
    });
}

function wrapPageImages() { 
    document.querySelectorAll(".page-image").forEach(e => { 
        const t = document.createElement("div"); 
        t.className = "page-image-wrapper"; 
        e.parentNode.insertBefore(t, e); 
        t.appendChild(e); 
    }); 
}

// MAIN INIT
function main() {
    const hash = location.hash;
    let initialSpread = 0;
    if (hash.startsWith('#spread=')) {
        initialSpread = parseInt(hash.substring(8), 10) || 0;
    }

    createNav('../../', SPREAD_TO_NAV_ID_MAP[initialSpread] || 'portfolio');

    // Filtrace položek pro lightbox
    galleryItems = buttonData.filter(item => !item.url).sort((a, b) => a.spread - b.spread);
    const itemSpreads = new Set(galleryItems.map(item => item.spread));
    spreadsWithItems = [...itemSpreads].sort((a, b) => a - b);

    slider.min = 0;
    slider.max = state.maxSpread;
    
    wrapPageImages(); // Obalí obrázky pro overlays
    // setupMediaOverlays(); <--- SMAZÁNO! Nahrazeno dynamickým manageResources()
    
    setupEventListeners();

    if (initialSpread > 0) {
        animateTo(0, initialSpread, 0);
    } else {
        updateBook(0);
        renderButtons(0);
    }
}

document.addEventListener('DOMContentLoaded', main);