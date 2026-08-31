import fs from 'fs';

function applyLiquidGlass(filePath) {
    let content = fs.readFileSync(filePath, 'utf8');

    const liquidGlassCss = `
        /* ============================================================ */
        /* 🍎 APPLE LIQUID GLASS & VIBRANT MATERIALS DESIGN SYSTEM       */
        /* ============================================================ */
        
        /* 1. ÜST ARAÇ ÇUBUĞU (FLOATING LIQUID GLASS HEADER) */
        .top-toolbar {
            background: rgba(13, 17, 23, 0.75) !important;
            backdrop-filter: blur(28px) saturate(190%) contrast(105%) !important;
            -webkit-backdrop-filter: blur(28px) saturate(190%) contrast(105%) !important;
            border-bottom: 1px solid rgba(255, 255, 255, 0.10) !important;
            box-shadow: inset 0 1px 0 0 rgba(255, 255, 255, 0.12), 0 8px 24px rgba(0, 0, 0, 0.35) !important;
            z-index: 100 !important;
        }

        /* 2. SOL ÇİZİM ARAÇ ÇUBUĞU (LIQUID GLASS DOCK) */
        .tv-left-toolbar {
            background: rgba(13, 17, 23, 0.70) !important;
            backdrop-filter: blur(24px) saturate(180%) !important;
            -webkit-backdrop-filter: blur(24px) saturate(180%) !important;
            border-right: 1px solid rgba(255, 255, 255, 0.08) !important;
            box-shadow: inset 1px 0 0 0 rgba(255, 255, 255, 0.08) !important;
            z-index: 90 !important;
        }

        /* 3. ALT DURUM ÇUBUĞU (LIQUID GLASS STATUS BAR) */
        .bottom-statusbar {
            background: rgba(13, 17, 23, 0.75) !important;
            backdrop-filter: blur(28px) saturate(190%) !important;
            -webkit-backdrop-filter: blur(28px) saturate(190%) !important;
            border-top: 1px solid rgba(255, 255, 255, 0.10) !important;
            box-shadow: inset 0 1px 0 0 rgba(255, 255, 255, 0.10) !important;
            z-index: 100 !important;
        }

        /* 4. FİYAT VE ZAMAN EKSENLERİ (LIQUID GLASS AXES) */
        .price-axis-sidebar, .time-axis-bar {
            background: rgba(13, 17, 23, 0.70) !important;
            backdrop-filter: blur(20px) saturate(180%) !important;
            -webkit-backdrop-filter: blur(20px) saturate(180%) !important;
            border-color: rgba(255, 255, 255, 0.08) !important;
        }
        .axis-corner-reset {
            background: rgba(255, 255, 255, 0.06) !important;
            border: 1px solid rgba(255, 255, 255, 0.10) !important;
            backdrop-filter: blur(12px) !important;
        }
        .axis-corner-reset:hover {
            background: rgba(255, 255, 255, 0.14) !important;
            border-color: rgba(255, 255, 255, 0.22) !important;
        }

        /* 5. BUTONLAR VE KONTROLLER (APPLE GLASS BUTTONS) */
        .tf-btn, .ind-btn, .theme-toggle-btn, .candle-depth-select, .fit-all-btn, .symbol-btn-wrapper {
            background: rgba(255, 255, 255, 0.05) !important;
            border: 1px solid rgba(255, 255, 255, 0.10) !important;
            backdrop-filter: blur(14px) !important;
            -webkit-backdrop-filter: blur(14px) !important;
            box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.12) !important;
            transition: all 0.18s cubic-bezier(0.16, 1, 0.3, 1) !important;
        }
        .tf-btn:hover, .ind-btn:hover, .theme-toggle-btn:hover, .candle-depth-select:hover, .fit-all-btn:hover, .symbol-btn-wrapper:hover {
            background: rgba(255, 255, 255, 0.12) !important;
            border-color: rgba(255, 255, 255, 0.22) !important;
            box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.20), 0 4px 12px rgba(0, 0, 0, 0.20) !important;
        }
        .tf-btn.active {
            background: rgba(255, 255, 255, 0.22) !important;
            border-color: rgba(255, 255, 255, 0.40) !important;
            color: #ffffff !important;
            box-shadow: inset 0 1px 1px rgba(255, 255, 255, 0.30), 0 4px 12px rgba(0, 0, 0, 0.30) !important;
        }

        .scale-mode-segmented-group {
            background: rgba(0, 0, 0, 0.35) !important;
            border: 1px solid rgba(255, 255, 255, 0.10) !important;
            backdrop-filter: blur(16px) !important;
        }
        .scale-mode-btn {
            background: transparent !important;
            border: 1px solid transparent !important;
            color: #8b949e !important;
        }
        .scale-mode-btn.active {
            background: rgba(255, 255, 255, 0.16) !important;
            border: 1px solid rgba(255, 255, 255, 0.25) !important;
            color: #ffffff !important;
            box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.25) !important;
        }

        /* 6. MODALLAR VE DİYALOG KARTLARI (LIQUID GLASS PANELS) */
        .symbol-modal-card, .fx-modal-card, .pine-editor-panel {
            background: rgba(15, 23, 42, 0.82) !important;
            backdrop-filter: blur(36px) saturate(200%) contrast(105%) !important;
            -webkit-backdrop-filter: blur(36px) saturate(200%) contrast(105%) !important;
            border: 1px solid rgba(255, 255, 255, 0.16) !important;
            border-top: 1px solid rgba(255, 255, 255, 0.35) !important;
            box-shadow: 
                inset 0 1px 1px 0 rgba(255, 255, 255, 0.30),
                0 30px 70px -15px rgba(0, 0, 0, 0.75),
                0 0 30px rgba(0, 0, 0, 0.40) !important;
        }

        .fx-indicator-item, .symbol-item {
            background: rgba(255, 255, 255, 0.04) !important;
            border: 1px solid rgba(255, 255, 255, 0.08) !important;
            backdrop-filter: blur(12px) !important;
        }
        .fx-indicator-item:hover, .symbol-item:hover {
            background: rgba(255, 255, 255, 0.10) !important;
            border-color: rgba(255, 255, 255, 0.20) !important;
        }

        /* 7. AÇIK / BEYAZ TEMADA APPLE LIQUID GLASS (LIGHT MODE) */
        body.light-theme .top-toolbar {
            background: rgba(255, 255, 255, 0.78) !important;
            backdrop-filter: blur(28px) saturate(190%) !important;
            border-bottom: 1px solid rgba(0, 0, 0, 0.08) !important;
            box-shadow: inset 0 1px 0 0 rgba(255, 255, 255, 0.80), 0 6px 20px rgba(0, 0, 0, 0.06) !important;
        }
        body.light-theme .tv-left-toolbar {
            background: rgba(255, 255, 255, 0.75) !important;
            border-right: 1px solid rgba(0, 0, 0, 0.06) !important;
        }
        body.light-theme .bottom-statusbar {
            background: rgba(255, 255, 255, 0.78) !important;
            border-top: 1px solid rgba(0, 0, 0, 0.08) !important;
        }
        body.light-theme .price-axis-sidebar, body.light-theme .time-axis-bar {
            background: rgba(255, 255, 255, 0.75) !important;
            border-color: rgba(0, 0, 0, 0.06) !important;
        }
        body.light-theme .tf-btn, body.light-theme .ind-btn, body.light-theme .theme-toggle-btn, 
        body.light-theme .candle-depth-select, body.light-theme .fit-all-btn, body.light-theme .symbol-btn-wrapper {
            background: rgba(0, 0, 0, 0.04) !important;
            border: 1px solid rgba(0, 0, 0, 0.08) !important;
            color: #1e293b !important;
            box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.90) !important;
        }
        body.light-theme .tf-btn:hover, body.light-theme .ind-btn:hover, body.light-theme .theme-toggle-btn:hover, 
        body.light-theme .candle-depth-select:hover, body.light-theme .fit-all-btn:hover, body.light-theme .symbol-btn-wrapper:hover {
            background: rgba(0, 0, 0, 0.08) !important;
            border-color: rgba(0, 0, 0, 0.16) !important;
        }
        body.light-theme .tf-btn.active {
            background: rgba(41, 98, 255, 0.90) !important;
            border-color: #2962ff !important;
            color: #ffffff !important;
            box-shadow: 0 4px 12px rgba(41, 98, 255, 0.35) !important;
        }
        body.light-theme .scale-mode-segmented-group {
            background: rgba(0, 0, 0, 0.05) !important;
            border: 1px solid rgba(0, 0, 0, 0.08) !important;
        }
        body.light-theme .scale-mode-btn.active {
            background: rgba(255, 255, 255, 0.90) !important;
            border: 1px solid rgba(0, 0, 0, 0.15) !important;
            color: #0f172a !important;
            box-shadow: 0 2px 6px rgba(0, 0, 0, 0.10) !important;
        }
        body.light-theme .symbol-modal-card, body.light-theme .fx-modal-card, body.light-theme .pine-editor-panel {
            background: rgba(255, 255, 255, 0.88) !important;
            border: 1px solid rgba(0, 0, 0, 0.10) !important;
            border-top: 1px solid rgba(255, 255, 255, 0.95) !important;
            box-shadow: 
                inset 0 1px 1px 0 rgba(255, 255, 255, 0.90),
                0 30px 60px -15px rgba(0, 0, 0, 0.15) !important;
        }
        body.light-theme .fx-indicator-item, body.light-theme .symbol-item {
            background: rgba(0, 0, 0, 0.03) !important;
            border: 1px solid rgba(0, 0, 0, 0.06) !important;
        }
        body.light-theme .fx-indicator-item:hover, body.light-theme .symbol-item:hover {
            background: rgba(0, 0, 0, 0.07) !important;
        }
    `;

    const styleEndIdx = content.indexOf('</style>');
    if (styleEndIdx !== -1) {
        content = content.substring(0, styleEndIdx) + liquidGlassCss + content.substring(styleEndIdx);
    }

    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`✓ Injected Apple Liquid Glass design system into ${filePath}`);
}

applyLiquidGlass('indikator_sablonu.html');
applyLiquidGlass('index.html');
console.log('APPLE LIQUID GLASS THEME APPLIED SUCCESSFULLY!');
