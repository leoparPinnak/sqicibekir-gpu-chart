import fs from 'fs';

// 1. UPDATE FRONTEND PORTAL STYLES (liquid-glass.css)
function updateFrontendPortalCss() {
    const cssPath = 'frontend/styles/liquid-glass.css';
    let css = fs.readFileSync(cssPath, 'utf8');

    const upgradedPortalCss = `
/* ============================================================ */
/* 🍎 APPLE LIQUID GLASS COMPLETE DESIGN SYSTEM (PORTAL & TERMINAL) */
/* ============================================================ */

/* 1. ÜST MENÜ LİNKLERİ VE KAPSÜLLER */
.portal-nav-links {
    display: flex;
    align-items: center;
    gap: 6px;
    background: linear-gradient(135deg, rgba(255, 255, 255, 0.10) 0%, rgba(255, 255, 255, 0.02) 100%), rgba(10, 15, 25, 0.65) !important;
    padding: 5px;
    border-radius: 9999px;
    border: 1px solid rgba(255, 255, 255, 0.14);
    border-top: 1px solid rgba(255, 255, 255, 0.30);
    backdrop-filter: blur(24px) saturate(190%) !important;
    -webkit-backdrop-filter: blur(24px) saturate(190%) !important;
    box-shadow: inset 0 1px 1px rgba(255, 255, 255, 0.25), 0 8px 24px rgba(0, 0, 0, 0.35);
}

.portal-nav-item {
    padding: 7px 18px;
    font-size: 13px;
    font-weight: 600;
    color: #94a3b8;
    cursor: pointer;
    border-radius: 9999px;
    transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
    text-decoration: none;
}

.portal-nav-item:hover {
    color: #ffffff;
    background: linear-gradient(135deg, rgba(255, 255, 255, 0.18) 0%, rgba(255, 255, 255, 0.05) 100%), rgba(255, 255, 255, 0.08);
    box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.30);
    transform: translateY(-1px);
}

.portal-nav-item.active {
    color: #ffffff;
    background: linear-gradient(135deg, rgba(255, 255, 255, 0.25) 0%, rgba(255, 255, 255, 0.08) 100%), rgba(41, 98, 255, 0.40) !important;
    border: 1px solid rgba(255, 255, 255, 0.25);
    border-top: 1px solid rgba(255, 255, 255, 0.50);
    font-weight: 700;
    box-shadow: inset 0 1px 1px rgba(255, 255, 255, 0.40), 0 4px 15px rgba(41, 98, 255, 0.35);
}

/* 2. MERKEZİ KART VE İÇ PİLL BUTONLARI */
.portal-market-pill {
    background: linear-gradient(135deg, rgba(255, 255, 255, 0.14) 0%, rgba(255, 255, 255, 0.04) 100%), rgba(18, 24, 38, 0.60) !important;
    border: 1px solid rgba(255, 255, 255, 0.16) !important;
    border-top: 1px solid rgba(255, 255, 255, 0.45) !important;
    backdrop-filter: blur(20px) saturate(180%) !important;
    padding: 8px 18px;
    border-radius: 9999px;
    font-size: 13px;
    font-weight: 700;
    color: #f1f5f9;
    cursor: pointer;
    display: inline-flex;
    align-items: center;
    gap: 8px;
    box-shadow: inset 0 1px 1px rgba(255, 255, 255, 0.35), 0 6px 18px rgba(0, 0, 0, 0.30);
    transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
}

.portal-market-pill:hover {
    background: linear-gradient(135deg, rgba(255, 255, 255, 0.25) 0%, rgba(255, 255, 255, 0.08) 100%), rgba(30, 40, 65, 0.75) !important;
    border-top-color: rgba(255, 255, 255, 0.70) !important;
    transform: translateY(-1.5px) scale(1.02);
    box-shadow: inset 0 1px 1px rgba(255, 255, 255, 0.55), 0 10px 25px rgba(0, 0, 0, 0.45);
}

.portal-market-pill:active {
    transform: scale(0.97);
    box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.4);
}

/* 3. DÖNÜŞ BUTONU */
.return-to-portal-btn {
    position: fixed;
    top: 14px;
    right: 20px;
    z-index: 10000;
    background: linear-gradient(135deg, rgba(255, 255, 255, 0.18) 0%, rgba(255, 255, 255, 0.06) 100%), rgba(13, 17, 23, 0.85) !important;
    border: 1px solid rgba(255, 255, 255, 0.20) !important;
    border-top: 1px solid rgba(255, 255, 255, 0.50) !important;
    backdrop-filter: blur(28px) saturate(200%) !important;
    -webkit-backdrop-filter: blur(28px) saturate(200%) !important;
    color: #f1f5f9;
    padding: 9px 20px;
    border-radius: 9999px;
    font-size: 12px;
    font-weight: 700;
    cursor: pointer;
    display: none;
    align-items: center;
    gap: 8px;
    box-shadow: inset 0 1px 1px rgba(255, 255, 255, 0.40), 0 12px 30px rgba(0, 0, 0, 0.55);
    transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
}

.return-to-portal-btn:hover {
    background: linear-gradient(135deg, rgba(255, 255, 255, 0.28) 0%, rgba(255, 255, 255, 0.10) 100%), rgba(25, 35, 55, 0.90) !important;
    border-top-color: rgba(255, 255, 255, 0.75) !important;
    transform: translateY(-2px) scale(1.02);
    box-shadow: inset 0 1.5px 2px rgba(255, 255, 255, 0.60), 0 16px 40px rgba(0, 0, 0, 0.65);
}
    `;

    css = css + '\n' + upgradedPortalCss;
    fs.writeFileSync(cssPath, css, 'utf8');
    console.log('✓ Updated frontend/styles/liquid-glass.css with full Apple Liquid Glass controls');
}

// 2. INJECT APPLE LIQUID GLASS TO MAIN ENGINE (indikator_sablonu.html & index.html)
function updateMainEngineFiles(filePath) {
    let content = fs.readFileSync(filePath, 'utf8');

    const terminalLiquidGlassCss = `
        /* ============================================================ */
        /* 🍎 ULTRA APPLE LIQUID GLASS CONTROLS & DOCKS (ENGINE-WIDE)   */
        /* ============================================================ */
        
        /* 1. ÜST ARAÇ ÇUBUĞU KAPSÜL BUTONLARI */
        .symbol-btn-wrapper, .tf-btn, .ind-btn, .theme-toggle-btn, .candle-depth-select, .live-price-badge, .fit-all-btn {
            background: linear-gradient(135deg, rgba(255, 255, 255, 0.14) 0%, rgba(255, 255, 255, 0.04) 50%, rgba(255, 255, 255, 0.01) 100%), rgba(18, 24, 38, 0.60) !important;
            border: 1px solid rgba(255, 255, 255, 0.16) !important;
            border-top: 1px solid rgba(255, 255, 255, 0.45) !important;
            border-bottom: 1px solid rgba(255, 255, 255, 0.08) !important;
            backdrop-filter: blur(28px) saturate(210%) contrast(108%) brightness(1.10) !important;
            -webkit-backdrop-filter: blur(28px) saturate(210%) contrast(108%) brightness(1.10) !important;
            box-shadow: 
                inset 0 1px 1px 0 rgba(255, 255, 255, 0.35),
                inset 0 -1px 1px 0 rgba(0, 0, 0, 0.25),
                0 6px 18px rgba(0, 0, 0, 0.35) !important;
            border-radius: 9999px !important;
            transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1) !important;
        }

        .symbol-btn-wrapper:hover, .tf-btn:hover, .ind-btn:hover, .theme-toggle-btn:hover, .candle-depth-select:hover, .fit-all-btn:hover {
            background: linear-gradient(135deg, rgba(255, 255, 255, 0.24) 0%, rgba(255, 255, 255, 0.08) 50%, rgba(255, 255, 255, 0.03) 100%), rgba(28, 38, 58, 0.75) !important;
            border-top-color: rgba(255, 255, 255, 0.75) !important;
            transform: translateY(-1.5px) scale(1.02) !important;
            box-shadow: 
                inset 0 1.5px 2px 0 rgba(255, 255, 255, 0.55),
                0 10px 25px rgba(0, 0, 0, 0.50),
                0 0 20px rgba(41, 98, 255, 0.25) !important;
        }

        .tf-btn.active {
            background: linear-gradient(135deg, rgba(255, 255, 255, 0.30) 0%, rgba(255, 255, 255, 0.10) 50%, rgba(255, 255, 255, 0.04) 100%), rgba(41, 98, 255, 0.70) !important;
            border-color: rgba(255, 255, 255, 0.35) !important;
            border-top: 1px solid rgba(255, 255, 255, 0.80) !important;
            color: #ffffff !important;
            box-shadow: 
                inset 0 1.5px 2px 0 rgba(255, 255, 255, 0.70),
                0 8px 24px rgba(41, 98, 255, 0.50),
                0 0 25px rgba(41, 98, 255, 0.35) !important;
        }

        /* 2. SOL ÇİZİM ARAÇLARI (FLOATING DOCK BUTTONS) */
        .tv-tool-btn {
            background: linear-gradient(135deg, rgba(255, 255, 255, 0.12) 0%, rgba(255, 255, 255, 0.03) 100%), rgba(18, 24, 38, 0.55) !important;
            border: 1px solid rgba(255, 255, 255, 0.14) !important;
            border-top: 1px solid rgba(255, 255, 255, 0.35) !important;
            backdrop-filter: blur(20px) saturate(180%) !important;
            border-radius: 8px !important;
            box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.25), 0 4px 12px rgba(0, 0, 0, 0.25) !important;
            transition: all 0.18s cubic-bezier(0.16, 1, 0.3, 1) !important;
        }

        .tv-tool-btn:hover {
            background: linear-gradient(135deg, rgba(255, 255, 255, 0.22) 0%, rgba(255, 255, 255, 0.06) 100%), rgba(30, 40, 60, 0.75) !important;
            border-top-color: rgba(255, 255, 255, 0.65) !important;
            transform: scale(1.06) !important;
            box-shadow: inset 0 1px 1px rgba(255, 255, 255, 0.45), 0 6px 18px rgba(0, 0, 0, 0.45) !important;
        }

        .tv-tool-btn.active {
            background: linear-gradient(135deg, rgba(255, 255, 255, 0.28) 0%, rgba(255, 255, 255, 0.08) 100%), rgba(41, 98, 255, 0.60) !important;
            border-color: rgba(255, 255, 255, 0.30) !important;
            border-top: 1px solid rgba(255, 255, 255, 0.70) !important;
            color: #ffffff !important;
            box-shadow: inset 0 1px 1px rgba(255, 255, 255, 0.60), 0 6px 20px rgba(41, 98, 255, 0.45) !important;
        }

        /* 3. ALT DURUM ÇUBUĞU VE SEGMENTED KAPSÜLLER */
        .scale-mode-segmented-group {
            background: linear-gradient(135deg, rgba(255, 255, 255, 0.08) 0%, rgba(255, 255, 255, 0.02) 100%), rgba(10, 15, 25, 0.65) !important;
            border: 1px solid rgba(255, 255, 255, 0.14) !important;
            border-top: 1px solid rgba(255, 255, 255, 0.35) !important;
            backdrop-filter: blur(24px) saturate(190%) !important;
            border-radius: 9999px !important;
            padding: 3px !important;
            box-shadow: inset 0 1px 1px rgba(255, 255, 255, 0.25), 0 6px 18px rgba(0, 0, 0, 0.30) !important;
        }

        .scale-mode-btn {
            border-radius: 9999px !important;
            padding: 4px 14px !important;
            transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1) !important;
        }

        .scale-mode-btn.active {
            background: linear-gradient(135deg, rgba(255, 255, 255, 0.25) 0%, rgba(255, 255, 255, 0.08) 100%), rgba(255, 255, 255, 0.15) !important;
            border: 1px solid rgba(255, 255, 255, 0.25) !important;
            border-top: 1px solid rgba(255, 255, 255, 0.60) !important;
            color: #ffffff !important;
            font-weight: 800 !important;
            box-shadow: inset 0 1px 1px rgba(255, 255, 255, 0.50), 0 4px 14px rgba(0, 0, 0, 0.35) !important;
        }

        /* 4. AÇIK / BEYAZ TEMADA APPLE LIQUID GLASS KONTROLLERİ */
        body.light-theme .symbol-btn-wrapper, body.light-theme .tf-btn, body.light-theme .ind-btn, 
        body.light-theme .theme-toggle-btn, body.light-theme .candle-depth-select, body.light-theme .fit-all-btn {
            background: linear-gradient(135deg, rgba(255, 255, 255, 0.85) 0%, rgba(255, 255, 255, 0.45) 100%), rgba(240, 244, 250, 0.75) !important;
            border: 1px solid rgba(0, 0, 0, 0.10) !important;
            border-top: 1px solid rgba(255, 255, 255, 0.95) !important;
            border-bottom: 1px solid rgba(0, 0, 0, 0.06) !important;
            color: #0f172a !important;
            box-shadow: 
                inset 0 1px 1px 0 rgba(255, 255, 255, 0.95),
                0 4px 12px rgba(0, 0, 0, 0.06) !important;
        }

        body.light-theme .symbol-btn-wrapper:hover, body.light-theme .tf-btn:hover, body.light-theme .ind-btn:hover, 
        body.light-theme .theme-toggle-btn:hover, body.light-theme .candle-depth-select:hover, body.light-theme .fit-all-btn:hover {
            background: linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(255, 255, 255, 0.65) 100%), rgba(255, 255, 255, 0.90) !important;
            border-color: rgba(0, 0, 0, 0.18) !important;
            transform: translateY(-1.5px) scale(1.02) !important;
            box-shadow: inset 0 1px 1px rgba(255, 255, 255, 1.0), 0 8px 20px rgba(0, 0, 0, 0.10) !important;
        }

        body.light-theme .tf-btn.active {
            background: linear-gradient(135deg, rgba(41, 98, 255, 0.95) 0%, rgba(30, 64, 175, 0.90) 100%) !important;
            border-color: rgba(255, 255, 255, 0.40) !important;
            border-top: 1px solid rgba(255, 255, 255, 0.80) !important;
            color: #ffffff !important;
            box-shadow: 0 6px 18px rgba(41, 98, 255, 0.40), inset 0 1px 1px rgba(255, 255, 255, 0.60) !important;
        }
    `;

    const styleEndIdx = content.indexOf('</style>');
    if (styleEndIdx !== -1) {
        content = content.substring(0, styleEndIdx) + terminalLiquidGlassCss + content.substring(styleEndIdx);
    }

    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`✓ Injected Engine-wide Apple Liquid Glass to ${filePath}`);
}

updateFrontendPortalCss();
updateMainEngineFiles('indikator_sablonu.html');
updateMainEngineFiles('index.html');
console.log('COMPLETE APPLE LIQUID GLASS TRANSFORMATION FINISHED!');
