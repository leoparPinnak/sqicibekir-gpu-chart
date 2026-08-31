import fs from 'fs';

// 1. UPDATE FRONTEND PORTAL STYLES (liquid-glass.css)
function updateFrontendPortal() {
    const cssPath = 'frontend/styles/liquid-glass.css';
    let css = fs.readFileSync(cssPath, 'utf8');

    const allButtonsWaterGlassCss = `
/* ============================================================ */
/* 💧 UNIVERSAL CRYSTAL LIQUID WATER BUTTONS & CONTROLS        */
/* ============================================================ */

/* 1. ÜST BAR SAĞ 'TERMINALI BAŞLAT' BUTONU */
.portal-btn-primary {
    position: relative !important;
    overflow: hidden !important;
    background: linear-gradient(135deg, rgba(255, 255, 255, 0.22) 0%, rgba(255, 255, 255, 0.03) 40%, rgba(255, 255, 255, 0.01) 70%, rgba(255, 255, 255, 0.16) 100%), rgba(255, 255, 255, 0.01) !important;
    backdrop-filter: blur(4px) saturate(260%) contrast(118%) brightness(1.20) !important;
    -webkit-backdrop-filter: blur(4px) saturate(260%) contrast(118%) brightness(1.20) !important;
    border: 1px solid rgba(255, 255, 255, 0.35) !important;
    border-top: 1.8px solid rgba(255, 255, 255, 0.95) !important;
    border-bottom: 1px solid rgba(255, 255, 255, 0.20) !important;
    border-radius: 9999px !important;
    padding: 10px 22px !important;
    font-size: 13px !important;
    font-weight: 700 !important;
    color: #ffffff !important;
    box-shadow: 
        inset 0 1.5px 2.5px 0 rgba(255, 255, 255, 0.80),
        inset 0 -1px 2px 0 rgba(0, 0, 0, 0.30),
        inset 0 0 16px 0 rgba(255, 255, 255, 0.15),
        0 8px 24px rgba(0, 0, 0, 0.40) !important;
    transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1) !important;
    display: inline-flex !important;
    align-items: center !important;
    gap: 10px !important;
}

.portal-btn-primary:hover {
    background: linear-gradient(135deg, rgba(255, 255, 255, 0.32) 0%, rgba(255, 255, 255, 0.08) 40%, rgba(255, 255, 255, 0.04) 70%, rgba(255, 255, 255, 0.26) 100%), rgba(255, 255, 255, 0.06) !important;
    border-top-color: #ffffff !important;
    transform: translateY(-1.5px) scale(1.02) !important;
    box-shadow: 
        inset 0 2px 3px 0 rgba(255, 255, 255, 0.95),
        0 12px 30px rgba(0, 0, 0, 0.55),
        0 0 25px rgba(16, 185, 129, 0.35) !important;
}

/* 2. KART İÇİ MARKET & ZAMAN DİLİMİ PİLL'LERİ */
.portal-market-pill {
    position: relative !important;
    overflow: hidden !important;
    background: linear-gradient(135deg, rgba(255, 255, 255, 0.20) 0%, rgba(255, 255, 255, 0.03) 40%, rgba(255, 255, 255, 0.01) 70%, rgba(255, 255, 255, 0.15) 100%), rgba(255, 255, 255, 0.01) !important;
    backdrop-filter: blur(4px) saturate(240%) contrast(115%) brightness(1.18) !important;
    -webkit-backdrop-filter: blur(4px) saturate(240%) contrast(115%) brightness(1.18) !important;
    border: 1px solid rgba(255, 255, 255, 0.30) !important;
    border-top: 1.8px solid rgba(255, 255, 255, 0.90) !important;
    border-bottom: 1px solid rgba(255, 255, 255, 0.18) !important;
    border-radius: 9999px !important;
    padding: 8px 18px !important;
    font-size: 13px !important;
    font-weight: 700 !important;
    color: #ffffff !important;
    cursor: pointer !important;
    display: inline-flex !important;
    align-items: center !important;
    gap: 8px !important;
    box-shadow: 
        inset 0 1.5px 2px 0 rgba(255, 255, 255, 0.75),
        inset 0 -1px 2px 0 rgba(0, 0, 0, 0.25),
        0 6px 18px rgba(0, 0, 0, 0.35) !important;
    transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1) !important;
}

.portal-market-pill:hover {
    background: linear-gradient(135deg, rgba(255, 255, 255, 0.30) 0%, rgba(255, 255, 255, 0.06) 40%, rgba(255, 255, 255, 0.03) 70%, rgba(255, 255, 255, 0.22) 100%), rgba(255, 255, 255, 0.05) !important;
    border-top-color: #ffffff !important;
    transform: translateY(-1.5px) scale(1.02) !important;
    box-shadow: 
        inset 0 2px 3px 0 rgba(255, 255, 255, 0.90),
        0 10px 25px rgba(0, 0, 0, 0.45),
        0 0 25px rgba(41, 98, 255, 0.30) !important;
}

/* 3. ÜST MENÜ LİNKLERİ */
.portal-nav-item {
    transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1) !important;
}

.portal-nav-item:hover {
    color: #ffffff !important;
    background: linear-gradient(135deg, rgba(255, 255, 255, 0.22) 0%, rgba(255, 255, 255, 0.04) 100%), rgba(255, 255, 255, 0.04) !important;
    border: 1px solid rgba(255, 255, 255, 0.25) !important;
    border-top: 1.5px solid rgba(255, 255, 255, 0.80) !important;
    box-shadow: inset 0 1px 2px rgba(255, 255, 255, 0.60), 0 4px 14px rgba(0, 0, 0, 0.30) !important;
    transform: translateY(-1px) !important;
}

.portal-nav-item.active {
    color: #ffffff !important;
    background: linear-gradient(135deg, rgba(255, 255, 255, 0.28) 0%, rgba(255, 255, 255, 0.06) 100%), rgba(41, 98, 255, 0.35) !important;
    border: 1px solid rgba(255, 255, 255, 0.30) !important;
    border-top: 1.5px solid rgba(255, 255, 255, 0.85) !important;
    font-weight: 700 !important;
    box-shadow: inset 0 1px 2px rgba(255, 255, 255, 0.70), 0 6px 20px rgba(41, 98, 255, 0.40) !important;
}

/* 4. DÖNÜŞ BUTONU */
.return-to-portal-btn {
    background: linear-gradient(135deg, rgba(255, 255, 255, 0.22) 0%, rgba(255, 255, 255, 0.03) 40%, rgba(255, 255, 255, 0.01) 70%, rgba(255, 255, 255, 0.16) 100%), rgba(255, 255, 255, 0.01) !important;
    backdrop-filter: blur(4px) saturate(260%) contrast(118%) brightness(1.20) !important;
    border: 1px solid rgba(255, 255, 255, 0.35) !important;
    border-top: 1.8px solid rgba(255, 255, 255, 0.95) !important;
    box-shadow: 
        inset 0 1.5px 2.5px 0 rgba(255, 255, 255, 0.80),
        0 12px 30px rgba(0, 0, 0, 0.55),
        0 0 25px rgba(41, 98, 255, 0.30) !important;
}
    `;

    css = css + '\n' + allButtonsWaterGlassCss;
    fs.writeFileSync(cssPath, css, 'utf8');
    console.log('✓ Applied Universal Crystal Liquid Water to frontend/styles/liquid-glass.css');
}

// 2. INJECT TO ENGINE FILES (indikator_sablonu.html & index.html)
function updateEngineFiles(filePath) {
    let content = fs.readFileSync(filePath, 'utf8');

    const terminalWaterGlassCss = `
        /* ============================================================ */
        /* 💧 TERMINAL-WIDE CRYSTAL LIQUID WATER BUTTONS & CONTROLS    */
        /* ============================================================ */
        
        /* 1. ÜST ARAÇ ÇUBUĞU SU PRİZMASI BUTONLARI */
        .symbol-btn-wrapper, .tf-btn, .ind-btn, .theme-toggle-btn, .candle-depth-select, .live-price-badge, .fit-all-btn {
            position: relative !important;
            overflow: hidden !important;
            background: linear-gradient(135deg, rgba(255, 255, 255, 0.22) 0%, rgba(255, 255, 255, 0.03) 40%, rgba(255, 255, 255, 0.01) 70%, rgba(255, 255, 255, 0.16) 100%), rgba(255, 255, 255, 0.01) !important;
            backdrop-filter: blur(4px) saturate(260%) contrast(118%) brightness(1.20) !important;
            -webkit-backdrop-filter: blur(4px) saturate(260%) contrast(118%) brightness(1.20) !important;
            border: 1px solid rgba(255, 255, 255, 0.32) !important;
            border-top: 1.8px solid rgba(255, 255, 255, 0.95) !important;
            border-bottom: 1px solid rgba(255, 255, 255, 0.20) !important;
            border-radius: 9999px !important;
            color: #ffffff !important;
            box-shadow: 
                inset 0 1.5px 2px 0 rgba(255, 255, 255, 0.80),
                inset 0 -1px 2px 0 rgba(0, 0, 0, 0.25),
                inset 0 0 16px 0 rgba(255, 255, 255, 0.12),
                0 6px 20px rgba(0, 0, 0, 0.40) !important;
            transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1) !important;
        }

        .symbol-btn-wrapper:hover, .tf-btn:hover, .ind-btn:hover, .theme-toggle-btn:hover, .candle-depth-select:hover, .fit-all-btn:hover {
            background: linear-gradient(135deg, rgba(255, 255, 255, 0.32) 0%, rgba(255, 255, 255, 0.08) 40%, rgba(255, 255, 255, 0.04) 70%, rgba(255, 255, 255, 0.26) 100%), rgba(255, 255, 255, 0.06) !important;
            border-top-color: #ffffff !important;
            transform: translateY(-1.5px) scale(1.02) !important;
            box-shadow: 
                inset 0 2px 3px 0 rgba(255, 255, 255, 0.95),
                0 10px 25px rgba(0, 0, 0, 0.55),
                0 0 25px rgba(41, 98, 255, 0.35) !important;
        }

        .tf-btn.active {
            background: linear-gradient(135deg, rgba(255, 255, 255, 0.35) 0%, rgba(255, 255, 255, 0.08) 50%, rgba(255, 255, 255, 0.03) 100%), rgba(41, 98, 255, 0.65) !important;
            border-color: rgba(255, 255, 255, 0.40) !important;
            border-top: 2px solid rgba(255, 255, 255, 1.0) !important;
            color: #ffffff !important;
            box-shadow: 
                inset 0 2px 3px 0 rgba(255, 255, 255, 0.90),
                0 8px 24px rgba(41, 98, 255, 0.55),
                0 0 30px rgba(41, 98, 255, 0.45) !important;
        }

        /* 2. SOL ÇİZİM ARAÇLARI (SU PRİZMASI TILES) */
        .tv-tool-btn {
            background: linear-gradient(135deg, rgba(255, 255, 255, 0.18) 0%, rgba(255, 255, 255, 0.03) 100%), rgba(255, 255, 255, 0.01) !important;
            backdrop-filter: blur(4px) saturate(240%) !important;
            -webkit-backdrop-filter: blur(4px) saturate(240%) !important;
            border: 1px solid rgba(255, 255, 255, 0.28) !important;
            border-top: 1.5px solid rgba(255, 255, 255, 0.85) !important;
            border-radius: 8px !important;
            box-shadow: inset 0 1px 2px rgba(255, 255, 255, 0.70), 0 4px 14px rgba(0, 0, 0, 0.30) !important;
            transition: all 0.18s cubic-bezier(0.16, 1, 0.3, 1) !important;
        }

        .tv-tool-btn:hover {
            background: linear-gradient(135deg, rgba(255, 255, 255, 0.28) 0%, rgba(255, 255, 255, 0.06) 100%), rgba(255, 255, 255, 0.05) !important;
            border-top-color: #ffffff !important;
            transform: scale(1.06) !important;
            box-shadow: inset 0 1.5px 2px rgba(255, 255, 255, 0.90), 0 8px 20px rgba(0, 0, 0, 0.45), 0 0 20px rgba(41, 98, 255, 0.30) !important;
        }

        /* 3. ALT BAR SEGMENTED SU KAPSÜLÜ */
        .scale-mode-segmented-group {
            background: linear-gradient(135deg, rgba(255, 255, 255, 0.14) 0%, rgba(255, 255, 255, 0.02) 100%), rgba(10, 15, 25, 0.40) !important;
            border: 1px solid rgba(255, 255, 255, 0.25) !important;
            border-top: 1.5px solid rgba(255, 255, 255, 0.80) !important;
            backdrop-filter: blur(6px) saturate(220%) !important;
            border-radius: 9999px !important;
            padding: 3px !important;
            box-shadow: inset 0 1px 2px rgba(255, 255, 255, 0.60), 0 6px 18px rgba(0, 0, 0, 0.35) !important;
        }

        .scale-mode-btn.active {
            background: linear-gradient(135deg, rgba(255, 255, 255, 0.28) 0%, rgba(255, 255, 255, 0.06) 100%), rgba(255, 255, 255, 0.12) !important;
            border: 1px solid rgba(255, 255, 255, 0.35) !important;
            border-top: 1.8px solid rgba(255, 255, 255, 0.95) !important;
            color: #ffffff !important;
            font-weight: 800 !important;
            box-shadow: inset 0 1.5px 2px rgba(255, 255, 255, 0.85), 0 4px 14px rgba(0, 0, 0, 0.35) !important;
        }

        /* 4. AÇIK / BEYAZ TEMADA SU PRİZMASI */
        body.light-theme .symbol-btn-wrapper, body.light-theme .tf-btn, body.light-theme .ind-btn, 
        body.light-theme .theme-toggle-btn, body.light-theme .candle-depth-select, body.light-theme .fit-all-btn {
            background: linear-gradient(135deg, rgba(255, 255, 255, 0.90) 0%, rgba(255, 255, 255, 0.50) 100%), rgba(255, 255, 255, 0.60) !important;
            border: 1px solid rgba(0, 0, 0, 0.12) !important;
            border-top: 1.8px solid rgba(255, 255, 255, 1.0) !important;
            border-bottom: 1px solid rgba(0, 0, 0, 0.08) !important;
            color: #0f172a !important;
            box-shadow: 
                inset 0 1.5px 2px 0 rgba(255, 255, 255, 1.0),
                0 6px 16px rgba(0, 0, 0, 0.08) !important;
        }

        body.light-theme .symbol-btn-wrapper:hover, body.light-theme .tf-btn:hover, body.light-theme .ind-btn:hover, 
        body.light-theme .theme-toggle-btn:hover, body.light-theme .candle-depth-select:hover, body.light-theme .fit-all-btn:hover {
            background: linear-gradient(135deg, rgba(255, 255, 255, 1.0) 0%, rgba(255, 255, 255, 0.70) 100%), rgba(255, 255, 255, 0.90) !important;
            border-color: rgba(0, 0, 0, 0.20) !important;
            transform: translateY(-1.5px) scale(1.02) !important;
            box-shadow: inset 0 2px 3px rgba(255, 255, 255, 1.0), 0 10px 25px rgba(0, 0, 0, 0.12) !important;
        }
    `;

    const styleEndIdx = content.indexOf('</style>');
    if (styleEndIdx !== -1) {
        content = content.substring(0, styleEndIdx) + terminalWaterGlassCss + content.substring(styleEndIdx);
    }

    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`✓ Injected Universal Crystal Liquid Water to ${filePath}`);
}

updateFrontendPortal();
updateEngineFiles('indikator_sablonu.html');
updateEngineFiles('index.html');
console.log('ALL BUTTONS TRANSFORMED TO CRYSTAL LIQUID WATER REFRACTION!');
