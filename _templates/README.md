# Šablony projektů (Templates & Asset Storage)

Tato složka slouží jako úložiště předpřipravených layoutů a assetů pro tvorbu nových stránek projektů v celém portfoliu.

Všechny šablony respektují jednotný designový systém:
* **Globální styly:** napojení na `../../main_style.css` (případně `../main_style.css` v rootu)
* **Boční navigace:** inicializace přes `createNav('../nav.js', 'PAGE_ID')`
* **Typografie:** jednotná velikost anotací (0.95rem), jednotné sekční štítky v mínuskách (`.section-label`, 0.8rem, tučné), jednotné texty obhajob (`.about-content`)
* **Lightbox:** jednotný styl šipek (`&#10094;` / `&#10095;`) a ovládání klávesnicí i klikem mimo okno

---

## 1. `template-basic.html` + `template-basic.css`
**Vzor:** Pagoda, Prostřeno  
**Kdy použít:** Pro projekty se scrollovatelným obsahem, fotogalerií a vloženým interaktivním prvkem (3D scan, video přehrávač, iframe).

### Struktura:
1. **Hlavička projektu:** `.project-intro` obsahující `.project-name` a `.project-annotation`.
2. **Sekce fotografií:** `.media-section` s nadpisem `.section-label`, 2-sloupcovým masonry gridem (`.masonry-row` + `.masonry-col`) a vestavěným lightboxem.
3. **Embed sekce:** `.embed-section` s přehrávačem nebo 3D iframe a externím odkazem.

---

## 2. `template-tabs.html` + `template-tabs.css`
**Vzor:** Bertík, Povaleč, Font (Blokkada), City Smog  
**Kdy použít:** Pro projekty, které se dělí do jasných sekcí přístupných přes horní přepínač (např. *Demo* | *Obhajoba* | *Fotodokumentace*).

### Struktura:
1. **Horní navigační lišta:** `.demo-nav` s tlačítky `.demo-nav-btn[data-target]`.
2. **Panely obsahu:** `.demo-panel` (aktivní panel má třídu `.active`).
3. **Textový panel:** `.about-content` s globální typografií, nadpisy a správným scrollem.
4. **Galerijní panel:** samostatný scroll s fotodokumentací a lightboxem.

---

## 3. `template-fullscreen.html` + `template-fullscreen.css`
**Vzor:** City Smog, 3D Kniha (1.TXT, Bez Filtru), interaktivní experimenty  
**Kdy použít:** Pro experimentální projekty běžící přes celou obrazovku (WebGL, Three.js plátno, dynamická koláž videí se zvukem, virtuální kniha), které vyžadují vlastní ovládání a interakci.

### Klíčové vlastnosti:
1. **Plná integrace s boční lištou:** container `.fullscreen-stage-container` automaticky reaguje na otevírání i zavírání boční nabídky (`body.desktop-nav-closed`) a vysílá událost `stageResize`.
2. **Plovoucí HUD:** `.stage-hud` s tlačítky pro zvuk (mute/unmute), celou obrazovku a otevření informací.
3. **Vysouvací drawer pro obhajobu:** `.info-drawer` umožňuje číst kompletní text obhajoby a konceptu bez opuštění interaktivní scény.

---

## Jak vytvořit nový projekt:
1. Zkopírujte vybranou šablonu (`.html` a `.css`) do nové složky v `projects/<nazev-projektu>/`.
2. V HTML upravte relativní cesty ke stylům (`../../main_style.css`, `../../nav.js`).
3. V `nav.js` přidejte novou položku do navigace a vložte odpovídající `PAGE_ID` do volání `createNav('../../nav.js', 'vase-page-id')`.
4. V `projects/projekty/projekty.html` přidejte náhledovou kartu projektu.
