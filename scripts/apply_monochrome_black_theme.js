import fs from 'fs';

function transformFile(filePath) {
    let content = fs.readFileSync(filePath, 'utf8');

    // 1. Remove Velocity Mode / Popover HTML and simplify Bottom Bar
    const oldBottomBarStart = '<div class="bottom-statusbar">';
    const oldBottomBarEnd = '<!-- ==================== VERTEX SHADER ==================== -->';
    
    const bStartIdx = content.indexOf(oldBottomBarStart);
    const bEndIdx = content.indexOf(oldBottomBarEnd, bStartIdx);

    if (bStartIdx !== -1 && bEndIdx !== -1) {
        const cleanBottomBar = `<div class="bottom-statusbar">
            <div class="status-left">
                <span class="status-badge live" style="background: #161b22; border: 1px solid #30363d; color: #e2e8f0; padding: 3px 10px; border-radius: 4px; font-weight: 700; font-size: 11px; display: inline-flex; align-items: center; gap: 6px;">
                    <span style="width: 6px; height: 6px; border-radius: 50%; background: #94a3b8;"></span>
                    <span>CANLI</span>
                </span>

                <button class="fit-all-btn" onclick="triggerSpaceAutoFit()" style="background: #161b22; border: 1px solid #30363d; color: #e2e8f0; font-weight: 700; font-size: 11px; padding: 4px 12px; border-radius: 4px; cursor: pointer; transition: all 0.15s ease;" title="Görünür mumları dikeyde yumuşakça sığdır [Space]">SPACE: SIGDIR</button>
            </div>

            <div style="display: flex; align-items: center; gap: 14px; font-size: 11px; color: #64748b; font-family: monospace;">
                <span>% log</span>
                <span>UTC+3 (Istanbul)</span>
            </div>
        </div>

    </div>

    `;
        content = content.substring(0, bStartIdx) + cleanBottomBar + content.substring(bEndIdx);
        console.log(`✓ Cleaned bottom status bar in ${filePath}`);
    }

    // 2. Update Top Toolbar Buttons to Black / Dark Theme & Remove Bright Inline Colors
    content = content.replace(
        `style="background: rgba(56, 189, 248, 0.15); border: 1px solid #38bdf8; color: #38bdf8; font-weight: 700; gap: 6px; padding: 4px 12px; border-radius: 4px; display: flex; align-items: center; cursor: pointer;"`,
        `style="background: #161b22; border: 1px solid #30363d; color: #e2e8f0; font-weight: 600; gap: 6px; padding: 4px 12px; border-radius: 4px; display: flex; align-items: center; cursor: pointer;"`
    );

    content = content.replace(
        `style="background: rgba(245, 158, 11, 0.15); border: 1px solid #f59e0b; color: #f59e0b; font-weight: 700; gap: 6px; padding: 4px 10px; border-radius: 4px; display: flex; align-items: center; cursor: pointer;"`,
        `style="background: #161b22; border: 1px solid #30363d; color: #e2e8f0; font-weight: 600; gap: 6px; padding: 4px 10px; border-radius: 4px; display: flex; align-items: center; cursor: pointer;"`
    );

    // 3. Remove colored texts in subpane values
    content = content.replace(/valEl\.style\.color\s*=\s*'#38bdf8';/g, "valEl.style.color = '#e2e8f0';");
    content = content.replace(/valEl\.style\.color\s*=\s*'#10b981';/g, "valEl.style.color = '#e2e8f0';");
    content = content.replace(/valEl\.style\.color\s*=\s*'#ef4444';/g, "valEl.style.color = '#e2e8f0';");

    // 4. Default scaleMode to 'free' and isAutoPriceScale to false
    content = content.replace(/let scaleMode = localStorage\.getItem\('tradechart_scale_mode'\) \|\| 'velocity';/g, "let scaleMode = 'free';");
    content = content.replace(/let isAutoPriceScale = true;/g, "let isAutoPriceScale = false;");

    // 5. Ensure all top buttons (TF, depth, live price box) have dark/black styling
    const cssCleanups = `
        /* DARK / BLACK MONOCHROME SLEEK BUTTONS & CONTROLS */
        .top-toolbar {
            background: #0d1117 !important;
            border-bottom: 1px solid #21262d !important;
        }
        .indicator-badge {
            background: #161b22 !important;
            border: 1px solid #30363d !important;
            color: #e2e8f0 !important;
        }
        .symbol-btn-wrapper {
            background: #161b22 !important;
            border: 1px solid #30363d !important;
            color: #e2e8f0 !important;
        }
        .symbol-ticker {
            color: #f1f5f9 !important;
        }
        .symbol-exchange-tag {
            color: #8b949e !important;
        }
        .tf-btn {
            background: #161b22 !important;
            border: 1px solid #30363d !important;
            color: #8b949e !important;
        }
        .tf-btn:hover {
            background: #21262d !important;
            color: #f1f5f9 !important;
        }
        .tf-btn.active {
            background: #21262d !important;
            border-color: #484f58 !important;
            color: #ffffff !important;
        }
        .candle-depth-select {
            background: #161b22 !important;
            border: 1px solid #30363d !important;
            color: #c9d1d9 !important;
        }
        .live-price-box {
            background: #161b22 !important;
            border: 1px solid #30363d !important;
            color: #f1f5f9 !important;
        }
        .live-price-box #price-val {
            color: #f1f5f9 !important;
        }
        .api-source-badge {
            background: #21262d !important;
            color: #8b949e !important;
        }
        .tv-left-toolbar {
            background: #0d1117 !important;
            border-right: 1px solid #21262d !important;
        }
        .tv-tool-btn {
            color: #8b949e !important;
        }
        .tv-tool-btn:hover, .tv-tool-btn.active {
            background: #21262d !important;
            color: #ffffff !important;
        }
        .bottom-statusbar {
            background: #0d1117 !important;
            border-top: 1px solid #21262d !important;
        }
        .fit-all-btn:hover {
            background: #21262d !important;
            color: #ffffff !important;
        }
        .subpane-header {
            background: #161b22 !important;
            border: 1px solid #30363d !important;
            color: #e2e8f0 !important;
        }
        .subpane-title {
            color: #e2e8f0 !important;
        }
        .subpane-val {
            color: #e2e8f0 !important;
        }
        .price-axis-sidebar, .time-axis-bar {
            background: #0d1117 !important;
            border-color: #21262d !important;
        }
        .axis-corner-reset {
            background: #161b22 !important;
            border: 1px solid #30363d !important;
            color: #8b949e !important;
        }
        .axis-corner-reset:hover {
            background: #21262d !important;
            color: #ffffff !important;
        }
        .symbol-modal-card, .fx-modal-card, .pine-editor-card {
            background: #0d1117 !important;
            border: 1px solid #30363d !important;
            color: #e2e8f0 !important;
        }
        .symbol-tab-btn, .fx-tab-btn, .pine-btn {
            background: #161b22 !important;
            border: 1px solid #30363d !important;
            color: #8b949e !important;
        }
        .symbol-tab-btn.active, .fx-tab-btn.active {
            background: #21262d !important;
            border-color: #484f58 !important;
            color: #ffffff !important;
        }
        .symbol-search-input, .fx-search-input {
            background: #161b22 !important;
            border: 1px solid #30363d !important;
            color: #f1f5f9 !important;
        }
        .symbol-item:hover, .fx-item:hover {
            background: #161b22 !important;
        }
        .fx-indicator-item {
            display: flex !important;
            align-items: center !important;
            gap: 12px !important;
            padding: 10px 14px !important;
            background: #161b22 !important;
            border: 1px solid #30363d !important;
            border-radius: 6px !important;
            margin-bottom: 8px !important;
            cursor: pointer !important;
            transition: all 0.15s ease !important;
        }
        .fx-indicator-item:hover {
            background: #21262d !important;
            border-color: #484f58 !important;
        }
        .fx-checkbox {
            width: 16px !important;
            height: 16px !important;
            accent-color: #58a6ff !important;
            cursor: pointer !important;
        }
        .fx-category-title {
            font-size: 11px !important;
            font-weight: 700 !important;
            text-transform: uppercase !important;
            letter-spacing: 0.5px !important;
            color: #8b949e !important;
            margin: 14px 0 6px 4px !important;
        }
        .fx-indicator-name {
            font-size: 13px !important;
            font-weight: 600 !important;
            color: #f1f5f9 !important;
        }
        .fx-indicator-desc {
            font-size: 11px !important;
            color: #8b949e !important;
            margin-top: 2px !important;
        }
    `;

    // Inject CSS before </style>
    const styleEndIdx = content.indexOf('</style>');
    if (styleEndIdx !== -1) {
        content = content.substring(0, styleEndIdx) + cssCleanups + content.substring(styleEndIdx);
        console.log(`✓ Injected sleek dark monochrome CSS in ${filePath}`);
    }

    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`✓ Successfully updated ${filePath}`);
}

transformFile('indikator_sablonu.html');
transformFile('index.html');
console.log('ALL MONOCHROME & BLACK THEME UPDATES APPLIED SUCCESSFULLY!');
